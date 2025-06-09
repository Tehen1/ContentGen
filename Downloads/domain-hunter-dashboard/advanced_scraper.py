#!/usr/bin/env python3
"""
Domain Hunter Pro - Scraper Avancé avec Proxies et Anti-Détection
Script professionnel pour collecter massivement les domaines expirés
"""

import requests
import time
import json
import csv
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from dataclasses import dataclass
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import sqlite3
import logging
import random
from concurrent.futures import ThreadPoolExecutor, as_completed
import cloudscraper
from fake_useragent import UserAgent
import tld
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import undetected_chromedriver as uc

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('advanced_scraper.log'),
        logging.StreamHandler()
    ]
)

@dataclass
class ScrapingConfig:
    """Configuration pour le scraping avancé"""
    use_proxies: bool = True
    use_selenium: bool = True
    max_workers: int = 5
    request_delay: tuple = (2, 5)
    retry_attempts: int = 3
    timeout: int = 30
    rotate_user_agents: bool = True
    headless: bool = True
    
@dataclass
class ProxyServer:
    host: str
    port: int
    username: Optional[str] = None
    password: Optional[str] = None
    protocol: str = 'http'
    
    def to_dict(self) -> dict:
        proxy_url = f"{self.protocol}://"
        if self.username and self.password:
            proxy_url += f"{self.username}:{self.password}@"
        proxy_url += f"{self.host}:{self.port}"
        
        return {
            'http': proxy_url,
            'https': proxy_url
        }

class AdvancedExpiredDomainScraper:
    def __init__(self, config: ScrapingConfig = None):
        self.config = config or ScrapingConfig()
        
        # User Agent rotatif
        if self.config.rotate_user_agents:
            self.ua = UserAgent()
        
        # Session CloudScraper pour contourner Cloudflare
        self.session = cloudscraper.create_scraper()
        
        # Pool de proxies
        self.proxy_pool = self.load_proxy_pool()
        self.current_proxy_index = 0
        
        # WebDriver pour les sites JavaScript
        self.driver = None
        
        # Configuration de base
        self.init_database()
        
        # Sources avancées avec configurations spécifiques
        self.advanced_sources = {
            'expireddomains_net': {
                'url': 'https://www.expireddomains.net/domain-name-search',
                'method': 'requests',
                'requires_proxy': True,
                'rate_limit': 2,
                'parser': self.parse_expireddomains_net
            },
            'pendingdelete_com': {
                'url': 'https://www.pendingdelete.com',
                'method': 'selenium',
                'requires_proxy': True,
                'rate_limit': 3,
                'parser': self.parse_pendingdelete_com
            },
            'deleteddomains_com': {
                'url': 'https://www.deleteddomains.com',
                'method': 'requests',
                'requires_proxy': False,
                'rate_limit': 1,
                'parser': self.parse_deleteddomains_com
            },
            'justdropped_com': {
                'url': 'https://justdropped.com',
                'method': 'selenium',
                'requires_proxy': True,
                'rate_limit': 2,
                'parser': self.parse_justdropped_com
            },
            'snapnames_com': {
                'url': 'https://www.snapnames.com',
                'method': 'requests',
                'requires_proxy': True,
                'rate_limit': 3,
                'parser': self.parse_snapnames_com
            }
        }
    
    def load_proxy_pool(self) -> List[ProxyServer]:
        """Charge la liste des proxies depuis un fichier"""
        proxies = []
        
        # Proxies gratuits (à remplacer par des proxies premium)
        free_proxies = [
            {'host': '8.210.76.207', 'port': 3128},
            {'host': '103.152.112.162', 'port': 80},
            {'host': '185.162.231.106', 'port': 80}
        ]
        
        for proxy_data in free_proxies:
            proxy = ProxyServer(**proxy_data)
            proxies.append(proxy)
        
        # Charger depuis un fichier si disponible
        try:
            with open('proxies.json', 'r') as f:
                proxy_list = json.load(f)
                for proxy_data in proxy_list:
                    proxy = ProxyServer(**proxy_data)
                    proxies.append(proxy)
        except FileNotFoundError:
            logging.warning("Fichier proxies.json non trouvé, utilisation des proxies par défaut")
        
        logging.info(f"📡 {len(proxies)} proxies chargés")
        return proxies
    
    def get_next_proxy(self) -> Optional[ProxyServer]:
        """Obtient le prochain proxy dans la rotation"""
        if not self.proxy_pool:
            return None
        
        proxy = self.proxy_pool[self.current_proxy_index]
        self.current_proxy_index = (self.current_proxy_index + 1) % len(self.proxy_pool)
        return proxy
    
    def test_proxy(self, proxy: ProxyServer) -> bool:
        """Teste si un proxy fonctionne"""
        try:
            response = requests.get(
                'http://httpbin.org/ip',
                proxies=proxy.to_dict(),
                timeout=10
            )
            return response.status_code == 200
        except:
            return False
    
    def init_database(self):
        """Initialise la base de données avancée"""
        with sqlite3.connect('advanced_scraped_domains.db') as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS scraped_domains (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    domain TEXT UNIQUE,
                    source TEXT,
                    da INTEGER,
                    pa INTEGER,
                    dr INTEGER,
                    ur INTEGER,
                    tf INTEGER,
                    cf INTEGER,
                    backlinks INTEGER,
                    referring_domains INTEGER,
                    price REAL,
                    auction_end TEXT,
                    registrar TEXT,
                    category TEXT,
                    length INTEGER,
                    extension TEXT,
                    alexa_rank INTEGER,
                    majestic_tf INTEGER,
                    majestic_cf INTEGER,
                    spam_score REAL,
                    discovered_at DATETIME,
                    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
                    scraped_with_proxy BOOLEAN DEFAULT 0
                )
            """)
            
            # Table pour les proxies
            conn.execute("""
                CREATE TABLE IF NOT EXISTS proxy_performance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    proxy_host TEXT,
                    proxy_port INTEGER,
                    success_count INTEGER DEFAULT 0,
                    failure_count INTEGER DEFAULT 0,
                    avg_response_time REAL DEFAULT 0,
                    last_used DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.commit()
    
    def init_selenium_driver(self) -> webdriver.Chrome:
        """Initialise un WebDriver Chrome non détectable"""
        options = uc.ChromeOptions()
        
        if self.config.headless:
            options.add_argument('--headless')
        
        # Arguments anti-détection
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        # User Agent aléatoire
        if self.config.rotate_user_agents:
            options.add_argument(f'--user-agent={self.ua.random}')
        
        # Proxy si disponible
        if self.config.use_proxies and self.proxy_pool:
            proxy = self.get_next_proxy()
            if proxy:
                options.add_argument(f'--proxy-server={proxy.host}:{proxy.port}')
        
        driver = uc.Chrome(options=options)
        
        # Script pour masquer l'automatisation
        driver.execute_script(
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
        )
        
        return driver
    
    def make_request_with_retry(self, url: str, method: str = 'GET', **kwargs) -> Optional[requests.Response]:
        """Fait une requête avec retry et rotation de proxies"""
        for attempt in range(self.config.retry_attempts):
            try:
                # Headers anti-détection
                headers = {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                }
                
                if self.config.rotate_user_agents:
                    headers['User-Agent'] = self.ua.random
                
                # Proxy rotatif
                proxies = None
                if self.config.use_proxies and self.proxy_pool:
                    proxy = self.get_next_proxy()
                    if proxy and self.test_proxy(proxy):
                        proxies = proxy.to_dict()
                
                # Requête
                if method.upper() == 'GET':
                    response = self.session.get(
                        url,
                        headers=headers,
                        proxies=proxies,
                        timeout=self.config.timeout,
                        **kwargs
                    )
                else:
                    response = self.session.post(
                        url,
                        headers=headers,
                        proxies=proxies,
                        timeout=self.config.timeout,
                        **kwargs
                    )
                
                response.raise_for_status()
                return response
                
            except Exception as e:
                logging.warning(f"Tentative {attempt + 1} échouée pour {url}: {e}")
                if attempt < self.config.retry_attempts - 1:
                    time.sleep(random.uniform(5, 10))
        
        return None
    
    def scrape_with_selenium(self, url: str, parser_func) -> List:
        """Scrape un site avec Selenium"""
        domains = []
        driver = None
        
        try:
            driver = self.init_selenium_driver()
            driver.get(url)
            
            # Attendre que la page se charge
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Parser la page
            domains = parser_func(driver.page_source)
            
        except Exception as e:
            logging.error(f"Erreur Selenium pour {url}: {e}")
        
        finally:
            if driver:
                driver.quit()
        
        return domains
    
    def parse_expireddomains_net(self, content: str) -> List:
        """Parse ExpiredDomains.net avec extraction avancée"""
        domains = []
        soup = BeautifulSoup(content, 'html.parser')
        
        # Recherche de la table principale
        table = soup.find('table', {'class': 'base1'})
        if not table:
            return domains
        
        rows = table.find_all('tr')[1:]  # Skip header
        
        for row in rows:
            cells = row.find_all('td')
            if len(cells) >= 15:  # Table complète
                try:
                    domain_name = cells[1].get_text(strip=True)
                    da = self.safe_int(cells[4].get_text(strip=True))
                    pa = self.safe_int(cells[5].get_text(strip=True))
                    backlinks = self.safe_int(cells[6].get_text(strip=True))
                    referring_domains = self.safe_int(cells[7].get_text(strip=True))
                    alexa_rank = self.safe_int(cells[8].get_text(strip=True))
                    
                    # Extraction Majestic si disponible
                    majestic_tf = self.safe_int(cells[9].get_text(strip=True))
                    majestic_cf = self.safe_int(cells[10].get_text(strip=True))
                    
                    if domain_name and self.is_quality_domain(domain_name):
                        domain_data = {
                            'domain': domain_name,
                            'source': 'expireddomains.net',
                            'da': da,
                            'pa': pa,
                            'backlinks': backlinks,
                            'referring_domains': referring_domains,
                            'alexa_rank': alexa_rank,
                            'majestic_tf': majestic_tf,
                            'majestic_cf': majestic_cf
                        }
                        domains.append(domain_data)
                        
                except Exception as e:
                    logging.warning(f"Erreur parsing ligne: {e}")
                    continue
        
        return domains
    
    def parse_pendingdelete_com(self, content: str) -> List:
        """Parse PendingDelete.com"""
        domains = []
        soup = BeautifulSoup(content, 'html.parser')
        
        # Recherche des domaines en attente
        domain_rows = soup.find_all('tr', {'class': 'domain-row'})
        
        for row in domain_rows:
            try:
                domain_cell = row.find('td', {'class': 'domain'})
                if domain_cell:
                    domain_name = domain_cell.get_text(strip=True)
                    
                    # Métriques additionnelles
                    metrics = row.find_all('td')
                    if len(metrics) >= 8:
                        backlinks = self.safe_int(metrics[3].get_text(strip=True))
                        tf = self.safe_int(metrics[4].get_text(strip=True))
                        cf = self.safe_int(metrics[5].get_text(strip=True))
                        price = self.extract_price(metrics[6].get_text(strip=True))
                        
                        if domain_name and self.is_quality_domain(domain_name):
                            domain_data = {
                                'domain': domain_name,
                                'source': 'pendingdelete.com',
                                'tf': tf,
                                'cf': cf,
                                'backlinks': backlinks,
                                'price': price
                            }
                            domains.append(domain_data)
                            
            except Exception as e:
                logging.warning(f"Erreur parsing PendingDelete: {e}")
                continue
        
        return domains
    
    def parse_deleteddomains_com(self, content: str) -> List:
        """Parse DeletedDomains.com"""
        domains = []
        soup = BeautifulSoup(content, 'html.parser')
        
        # Structure spécifique au site
        domain_table = soup.find('table', {'id': 'domain-table'})
        if domain_table:
            rows = domain_table.find_all('tr')[1:]
            
            for row in rows:
                cells = row.find_all('td')
                if len(cells) >= 6:
                    try:
                        domain_name = cells[0].get_text(strip=True)
                        da = self.safe_int(cells[2].get_text(strip=True))
                        dr = self.safe_int(cells[3].get_text(strip=True))
                        backlinks = self.safe_int(cells[4].get_text(strip=True))
                        
                        if domain_name and self.is_quality_domain(domain_name):
                            domain_data = {
                                'domain': domain_name,
                                'source': 'deleteddomains.com',
                                'da': da,
                                'dr': dr,
                                'backlinks': backlinks
                            }
                            domains.append(domain_data)
                            
                    except Exception as e:
                        continue
        
        return domains
    
    def parse_justdropped_com(self, content: str) -> List:
        """Parse JustDropped.com"""
        domains = []
        soup = BeautifulSoup(content, 'html.parser')
        
        # Recherche des cartes de domaines
        domain_cards = soup.find_all('div', {'class': 'domain-card'})
        
        for card in domain_cards:
            try:
                domain_elem = card.find('h3')
                if domain_elem:
                    domain_name = domain_elem.get_text(strip=True)
                    
                    # Métriques dans la carte
                    metrics_div = card.find('div', {'class': 'metrics'})
                    da = None
                    backlinks = None
                    price = None
                    
                    if metrics_div:
                        metrics_text = metrics_div.get_text()
                        da = self.extract_metric(metrics_text, r'DA[:\s]*(\d+)')
                        backlinks = self.extract_metric(metrics_text, r'BL[:\s]*(\d+)')
                    
                    # Prix dans le footer
                    price_elem = card.find('span', {'class': 'price'})
                    if price_elem:
                        price = self.extract_price(price_elem.get_text(strip=True))
                    
                    if domain_name and self.is_quality_domain(domain_name):
                        domain_data = {
                            'domain': domain_name,
                            'source': 'justdropped.com',
                            'da': da,
                            'backlinks': backlinks,
                            'price': price
                        }
                        domains.append(domain_data)
                        
            except Exception as e:
                continue
        
        return domains
    
    def parse_snapnames_com(self, content: str) -> List:
        """Parse SnapNames.com"""
        domains = []
        soup = BeautifulSoup(content, 'html.parser')
        
        # API JSON si disponible
        script_tags = soup.find_all('script')
        for script in script_tags:
            if script.string and 'domainData' in script.string:
                try:
                    # Extraction des données JSON
                    json_match = re.search(r'domainData\s*=\s*(\[.*?\]);', script.string, re.DOTALL)
                    if json_match:
                        domain_data = json.loads(json_match.group(1))
                        
                        for item in domain_data:
                            domain_name = item.get('domain')
                            price = item.get('currentBid', 0)
                            auction_end = item.get('endTime')
                            
                            if domain_name and self.is_quality_domain(domain_name):
                                domain_info = {
                                    'domain': domain_name,
                                    'source': 'snapnames.com',
                                    'price': price,
                                    'auction_end': auction_end
                                }
                                domains.append(domain_info)
                except:
                    pass
        
        return domains
    
    def is_quality_domain(self, domain: str) -> bool:
        """Filtre avancé pour la qualité des domaines"""
        domain_lower = domain.lower()
        
        # Longueur
        if len(domain_lower) < 4 or len(domain_lower) > 25:
            return False
        
        # Extension
        try:
            domain_ext = tld.get_tld(domain, as_object=True)
            if domain_ext.suffix not in ['.com', '.net', '.org', '.info', '.biz']:
                return False
        except:
            return False
        
        # Patterns à éviter
        bad_patterns = [
            r'\d{4,}',  # 4+ chiffres consécutifs
            r'--+',     # Double tirets
            r'^\d',     # Commence par un chiffre
            r'\d$',     # Finit par un chiffre
            r'[0-9]{2,}[a-z]{1,2}$',  # Pattern 123ab
        ]
        
        for pattern in bad_patterns:
            if re.search(pattern, domain_lower):
                return False
        
        # Mots-clés interdits
        banned_keywords = [
            'porn', 'sex', 'adult', 'xxx', 'casino', 'gambling', 'poker',
            'viagra', 'cialis', 'pharmacy', 'pills', 'drugs', 'loan',
            'debt', 'credit', 'mortgage', 'insurance', 'lawyer', 'attorney'
        ]
        
        for keyword in banned_keywords:
            if keyword in domain_lower:
                return False
        
        # Mots-clés valorisés
        valuable_keywords = [
            'tech', 'digital', 'online', 'web', 'app', 'software', 'cloud',
            'data', 'ai', 'crypto', 'blockchain', 'fintech', 'startup',
            'business', 'marketing', 'seo', 'social', 'mobile', 'ecommerce',
            'shop', 'store', 'buy', 'sell', 'trade', 'market', 'finance',
            'health', 'fitness', 'beauty', 'fashion', 'travel', 'food',
            'education', 'learning', 'course', 'training', 'consulting'
        ]
        
        has_valuable_keyword = any(kw in domain_lower for kw in valuable_keywords)
        
        # Accepter si mot-clé valorisé ou longueur courte
        if has_valuable_keyword or len(domain_lower.split('.')[0]) <= 8:
            return True
        
        return False
    
    def extract_metric(self, text: str, pattern: str) -> Optional[int]:
        """Extrait une métrique depuis un texte avec regex"""
        match = re.search(pattern, text, re.IGNORECASE)
        return int(match.group(1)) if match else None
    
    def safe_int(self, value: str) -> Optional[int]:
        """Conversion sécurisée en entier"""
        try:
            cleaned = re.sub(r'[^\d]', '', str(value))
            return int(cleaned) if cleaned else None
        except:
            return None
    
    def extract_price(self, price_text: str) -> Optional[float]:
        """Extrait le prix d'un texte"""
        try:
            price_match = re.search(r'[\$€£]?([\d,]+(?:\.\d{2})?)', price_text)
            if price_match:
                price_str = price_match.group(1).replace(',', '')
                return float(price_str)
        except:
            pass
        return None
    
    def scrape_all_advanced_sources(self) -> List[Dict]:
        """Scrape toutes les sources avec méthodes avancées"""
        logging.info("🚀 Démarrage du scraping avancé...")
        
        all_domains = []
        
        for source_name, config in self.advanced_sources.items():
            logging.info(f"🔍 Scraping {source_name}...")
            
            try:
                if config['method'] == 'selenium':
                    domains = self.scrape_with_selenium(config['url'], config['parser'])
                else:
                    response = self.make_request_with_retry(config['url'])
                    if response:
                        domains = config['parser'](response.text)
                    else:
                        domains = []
                
                all_domains.extend(domains)
                logging.info(f"✅ {len(domains)} domaines trouvés sur {source_name}")
                
                # Délai entre sources
                time.sleep(random.uniform(*self.config.request_delay))
                
            except Exception as e:
                logging.error(f"❌ Erreur scraping {source_name}: {e}")
                continue
        
        logging.info(f"📊 Total: {len(all_domains)} domaines collectés")
        return all_domains
    
    def save_advanced_domains(self, domains: List[Dict]):
        """Sauvegarde avancée en base de données"""
        with sqlite3.connect('advanced_scraped_domains.db') as conn:
            for domain_data in domains:
                try:
                    conn.execute("""
                        INSERT OR REPLACE INTO scraped_domains 
                        (domain, source, da, pa, dr, ur, tf, cf, backlinks, 
                         referring_domains, price, auction_end, alexa_rank, 
                         majestic_tf, majestic_cf, discovered_at, scraped_with_proxy)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        domain_data.get('domain'),
                        domain_data.get('source'),
                        domain_data.get('da'),
                        domain_data.get('pa'),
                        domain_data.get('dr'),
                        domain_data.get('ur'),
                        domain_data.get('tf'),
                        domain_data.get('cf'),
                        domain_data.get('backlinks'),
                        domain_data.get('referring_domains'),
                        domain_data.get('price'),
                        domain_data.get('auction_end'),
                        domain_data.get('alexa_rank'),
                        domain_data.get('majestic_tf'),
                        domain_data.get('majestic_cf'),
                        datetime.now().isoformat(),
                        self.config.use_proxies
                    ))
                except Exception as e:
                    logging.warning(f"Erreur sauvegarde {domain_data.get('domain', 'unknown')}: {e}")
            
            conn.commit()
        
        logging.info(f"💾 {len(domains)} domaines sauvegardés")

def main():
    """Fonction principale du scraper avancé"""
    print("🕷️  DOMAIN HUNTER PRO - SCRAPER AVANCÉ")
    print("=" * 50)
    
    # Configuration avancée
    config = ScrapingConfig(
        use_proxies=True,
        use_selenium=True,
        max_workers=3,
        request_delay=(3, 7),
        retry_attempts=3,
        headless=True
    )
    
    scraper = AdvancedExpiredDomainScraper(config)
    
    import sys
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "--scrape":
            # Scraping complet avancé
            domains = scraper.scrape_all_advanced_sources()
            scraper.save_advanced_domains(domains)
            
            print(f"\n✅ Scraping avancé terminé:")
            print(f"   📊 {len(domains)} domaines premium collectés")
            print(f"   🛡️  Utilisation de proxies: {config.use_proxies}")
            print(f"   🤖 Selenium activé: {config.use_selenium}")
            
        elif command == "--test-proxy":
            # Test des proxies
            print("🧪 Test des proxies...")
            working_proxies = 0
            
            for proxy in scraper.proxy_pool:
                if scraper.test_proxy(proxy):
                    print(f"✅ {proxy.host}:{proxy.port} - OK")
                    working_proxies += 1
                else:
                    print(f"❌ {proxy.host}:{proxy.port} - FAILED")
            
            print(f"\n📊 {working_proxies}/{len(scraper.proxy_pool)} proxies fonctionnels")
    
    else:
        print("Usage:")
        print("  python3 advanced_scraper.py --scrape       # Scraping avancé")
        print("  python3 advanced_scraper.py --test-proxy   # Test proxies")

if __name__ == "__main__":
    main()

