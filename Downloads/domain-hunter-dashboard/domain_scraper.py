#!/usr/bin/env python3
"""
Domain Hunter Pro - Scraper de Domaines Expirés
Script pour collecter automatiquement les domaines expirés depuis les meilleurs sites
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

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('domain_scraper.log'),
        logging.StreamHandler()
    ]
)

@dataclass
class ExpiredDomain:
    domain: str
    source: str
    da: Optional[int] = None
    pa: Optional[int] = None
    backlinks: Optional[int] = None
    price: Optional[float] = None
    auction_end: Optional[str] = None
    registrar: Optional[str] = None
    category: Optional[str] = None
    length: Optional[int] = None
    extension: Optional[str] = None
    discovered_at: str = None

    def __post_init__(self):
        if self.discovered_at is None:
            self.discovered_at = datetime.now().isoformat()
        if self.length is None:
            self.length = len(self.domain.split('.')[0])
        if self.extension is None:
            self.extension = '.' + self.domain.split('.')[-1]

class ExpiredDomainScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Configuration des délais
        self.delays = {
            'between_requests': (1, 3),
            'between_sites': (5, 10),
            'on_error': (30, 60)
        }
        
        # Base de données pour éviter les doublons
        self.init_database()
        
        # Sources de domaines expirés
        self.sources = {
            'expireddomains': {
                'url': 'https://www.expireddomains.net',
                'enabled': True,
                'priority': 1
            },
            'freedrop': {
                'url': 'https://freedrop.io',
                'enabled': True,
                'priority': 2
            },
            'dropcatch': {
                'url': 'https://www.dropcatch.com',
                'enabled': True,
                'priority': 3
            },
            'godaddy_auctions': {
                'url': 'https://auctions.godaddy.com',
                'enabled': True,
                'priority': 4
            },
            'namecheap_market': {
                'url': 'https://www.namecheap.com/market',
                'enabled': True,
                'priority': 5
            }
        }
    
    def init_database(self):
        """Initialise la base de données pour stocker les domaines"""
        with sqlite3.connect('scraped_domains.db') as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS scraped_domains (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    domain TEXT UNIQUE,
                    source TEXT,
                    da INTEGER,
                    pa INTEGER,
                    backlinks INTEGER,
                    price REAL,
                    auction_end TEXT,
                    registrar TEXT,
                    category TEXT,
                    length INTEGER,
                    extension TEXT,
                    discovered_at DATETIME,
                    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()
    
    def save_domain(self, domain: ExpiredDomain):
        """Sauvegarde un domaine en base"""
        with sqlite3.connect('scraped_domains.db') as conn:
            conn.execute("""
                INSERT OR REPLACE INTO scraped_domains 
                (domain, source, da, pa, backlinks, price, auction_end, 
                 registrar, category, length, extension, discovered_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                domain.domain, domain.source, domain.da, domain.pa,
                domain.backlinks, domain.price, domain.auction_end,
                domain.registrar, domain.category, domain.length,
                domain.extension, domain.discovered_at
            ))
            conn.commit()
    
    def is_domain_recent(self, domain: str, hours: int = 24) -> bool:
        """Vérifie si un domaine a été vu récemment"""
        cutoff = datetime.now() - timedelta(hours=hours)
        
        with sqlite3.connect('scraped_domains.db') as conn:
            cursor = conn.execute(
                "SELECT last_seen FROM scraped_domains WHERE domain = ?",
                (domain,)
            )
            result = cursor.fetchone()
            
            if result:
                last_seen = datetime.fromisoformat(result[0])
                return last_seen > cutoff
            return False
    
    def filter_quality_domains(self, domains: List[ExpiredDomain]) -> List[ExpiredDomain]:
        """Filtre les domaines selon des critères de qualité"""
        filtered = []
        
        for domain in domains:
            # Critères de base
            domain_name = domain.domain.lower()
            
            # Longueur acceptable
            if domain.length and (domain.length < 4 or domain.length > 20):
                continue
            
            # Extensions premium
            if domain.extension not in ['.com', '.net', '.org', '.info']:
                continue
            
            # Pas de chiffres ou traits d'union excessifs
            if re.search(r'\d{3,}|--', domain_name):
                continue
            
            # Mots-clés intéressants
            good_keywords = [
                'tech', 'digital', 'seo', 'marketing', 'blog', 'web',
                'business', 'online', 'app', 'dev', 'design', 'media',
                'shop', 'store', 'service', 'pro', 'expert', 'consultant'
            ]
            
            # Mots-clés à éviter
            bad_keywords = [
                'porn', 'sex', 'adult', 'casino', 'gambling', 'loan',
                'pharmacy', 'viagra', 'pill', 'debt', 'credit'
            ]
            
            # Vérification des mots-clés
            has_good_keyword = any(kw in domain_name for kw in good_keywords)
            has_bad_keyword = any(kw in domain_name for kw in bad_keywords)
            
            if has_bad_keyword:
                continue
            
            # Accepter si bon mot-clé ou métriques intéressantes
            if has_good_keyword or (domain.da and domain.da > 10) or (domain.backlinks and domain.backlinks > 100):
                filtered.append(domain)
        
        return filtered
    
    def scrape_expireddomains_net(self) -> List[ExpiredDomain]:
        """Scrape ExpiredDomains.net"""
        logging.info("🔍 Scraping ExpiredDomains.net...")
        domains = []
        
        try:
            # URL pour les domaines récemment expirés
            url = "https://www.expireddomains.net/domain-name-search"
            
            # Paramètres de recherche
            params = {
                'q': '',
                'ftld[]': ['com', 'net', 'org'],
                'falexa': '1000000',
                'fdomainpop': '1',
                'fdomain': '',
                'ftraffic': '0'
            }
            
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Recherche du tableau de domaines
            table = soup.find('table', {'class': 'base1'})
            if not table:
                logging.warning("Table de domaines non trouvée sur ExpiredDomains.net")
                return domains
            
            rows = table.find_all('tr')[1:]  # Skip header
            
            for row in rows:
                cells = row.find_all('td')
                if len(cells) >= 10:
                    try:
                        domain_name = cells[1].get_text(strip=True)
                        da = self.safe_int(cells[4].get_text(strip=True))
                        pa = self.safe_int(cells[5].get_text(strip=True))
                        backlinks = self.safe_int(cells[6].get_text(strip=True))
                        
                        if domain_name and not self.is_domain_recent(domain_name):
                            domain = ExpiredDomain(
                                domain=domain_name,
                                source='expireddomains.net',
                                da=da,
                                pa=pa,
                                backlinks=backlinks
                            )
                            domains.append(domain)
                            
                    except Exception as e:
                        logging.warning(f"Erreur parsing ligne ExpiredDomains.net: {e}")
                        continue
            
            logging.info(f"✅ {len(domains)} domaines trouvés sur ExpiredDomains.net")
            
        except Exception as e:
            logging.error(f"❌ Erreur scraping ExpiredDomains.net: {e}")
        
        return domains
    
    def scrape_freedrop_io(self) -> List[ExpiredDomain]:
        """Scrape FreeDrop.io"""
        logging.info("🔍 Scraping FreeDrop.io...")
        domains = []
        
        try:
            url = "https://freedrop.io/"
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Recherche des domaines listés
            domain_elements = soup.find_all('div', {'class': 'domain-item'})
            
            for element in domain_elements:
                try:
                    domain_link = element.find('a', {'class': 'domain-name'})
                    if domain_link:
                        domain_name = domain_link.get_text(strip=True)
                        
                        # Extraction des métriques si disponibles
                        metrics = element.find('div', {'class': 'metrics'})
                        da = None
                        backlinks = None
                        
                        if metrics:
                            da_elem = metrics.find('span', {'class': 'da'})
                            bl_elem = metrics.find('span', {'class': 'backlinks'})
                            
                            if da_elem:
                                da = self.safe_int(da_elem.get_text(strip=True))
                            if bl_elem:
                                backlinks = self.safe_int(bl_elem.get_text(strip=True))
                        
                        if domain_name and not self.is_domain_recent(domain_name):
                            domain = ExpiredDomain(
                                domain=domain_name,
                                source='freedrop.io',
                                da=da,
                                backlinks=backlinks
                            )
                            domains.append(domain)
                            
                except Exception as e:
                    logging.warning(f"Erreur parsing FreeDrop.io: {e}")
                    continue
            
            logging.info(f"✅ {len(domains)} domaines trouvés sur FreeDrop.io")
            
        except Exception as e:
            logging.error(f"❌ Erreur scraping FreeDrop.io: {e}")
        
        return domains
    
    def scrape_dropcatch_com(self) -> List[ExpiredDomain]:
        """Scrape DropCatch.com"""
        logging.info("🔍 Scraping DropCatch.com...")
        domains = []
        
        try:
            url = "https://www.dropcatch.com/domain/search"
            
            # Paramètres pour rechercher les domaines disponibles
            params = {
                'query': '',
                'tld': 'com,net,org',
                'status': 'available'
            }
            
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Recherche des résultats de domaines
            domain_rows = soup.find_all('tr', {'class': 'domain-row'})
            
            for row in domain_rows:
                try:
                    domain_cell = row.find('td', {'class': 'domain-name'})
                    if domain_cell:
                        domain_name = domain_cell.get_text(strip=True)
                        
                        # Prix si disponible
                        price_cell = row.find('td', {'class': 'price'})
                        price = None
                        if price_cell:
                            price_text = price_cell.get_text(strip=True)
                            price = self.extract_price(price_text)
                        
                        if domain_name and not self.is_domain_recent(domain_name):
                            domain = ExpiredDomain(
                                domain=domain_name,
                                source='dropcatch.com',
                                price=price
                            )
                            domains.append(domain)
                            
                except Exception as e:
                    logging.warning(f"Erreur parsing DropCatch.com: {e}")
                    continue
            
            logging.info(f"✅ {len(domains)} domaines trouvés sur DropCatch.com")
            
        except Exception as e:
            logging.error(f"❌ Erreur scraping DropCatch.com: {e}")
        
        return domains
    
    def scrape_godaddy_auctions(self) -> List[ExpiredDomain]:
        """Scrape GoDaddy Auctions"""
        logging.info("🔍 Scraping GoDaddy Auctions...")
        domains = []
        
        try:
            # API endpoint pour les enchères
            url = "https://auctions.godaddy.com/trp"
            
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
            
            # Paramètres de recherche
            params = {
                'listingType': 'auction',
                'sort': 'endTimeAsc',
                'pageSize': 100
            }
            
            response = self.session.get(url, headers=headers, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'results' in data:
                    for item in data['results']:
                        try:
                            domain_name = item.get('domainName')
                            price = item.get('currentBid', 0)
                            auction_end = item.get('auctionEndTime')
                            
                            if domain_name and not self.is_domain_recent(domain_name):
                                domain = ExpiredDomain(
                                    domain=domain_name,
                                    source='godaddy_auctions',
                                    price=price,
                                    auction_end=auction_end
                                )
                                domains.append(domain)
                                
                        except Exception as e:
                            logging.warning(f"Erreur parsing GoDaddy auction: {e}")
                            continue
            
            logging.info(f"✅ {len(domains)} domaines trouvés sur GoDaddy Auctions")
            
        except Exception as e:
            logging.error(f"❌ Erreur scraping GoDaddy Auctions: {e}")
        
        return domains
    
    def scrape_namecheap_market(self) -> List[ExpiredDomain]:
        """Scrape Namecheap Marketplace"""
        logging.info("🔍 Scraping Namecheap Marketplace...")
        domains = []
        
        try:
            url = "https://www.namecheap.com/market/search-domains"
            
            params = {
                'category': 'expired',
                'tld': 'com,net,org',
                'minPrice': 0,
                'maxPrice': 1000
            }
            
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Recherche des domaines listés
            domain_cards = soup.find_all('div', {'class': 'domain-card'})
            
            for card in domain_cards:
                try:
                    domain_elem = card.find('h3', {'class': 'domain-name'})
                    if domain_elem:
                        domain_name = domain_elem.get_text(strip=True)
                        
                        # Prix
                        price_elem = card.find('span', {'class': 'price'})
                        price = None
                        if price_elem:
                            price = self.extract_price(price_elem.get_text(strip=True))
                        
                        if domain_name and not self.is_domain_recent(domain_name):
                            domain = ExpiredDomain(
                                domain=domain_name,
                                source='namecheap_market',
                                price=price
                            )
                            domains.append(domain)
                            
                except Exception as e:
                    logging.warning(f"Erreur parsing Namecheap: {e}")
                    continue
            
            logging.info(f"✅ {len(domains)} domaines trouvés sur Namecheap")
            
        except Exception as e:
            logging.error(f"❌ Erreur scraping Namecheap: {e}")
        
        return domains
    
    def safe_int(self, value: str) -> Optional[int]:
        """Conversion sécurisée en entier"""
        try:
            # Nettoie la valeur (supprime espaces, virgules, etc.)
            cleaned = re.sub(r'[^\d]', '', str(value))
            return int(cleaned) if cleaned else None
        except:
            return None
    
    def extract_price(self, price_text: str) -> Optional[float]:
        """Extrait le prix d'un texte"""
        try:
            # Recherche de patterns de prix
            price_match = re.search(r'[\$€£]?([\d,]+(?:\.\d{2})?)', price_text)
            if price_match:
                price_str = price_match.group(1).replace(',', '')
                return float(price_str)
        except:
            pass
        return None
    
    def random_delay(self, delay_type: str):
        """Applique un délai aléatoire"""
        if delay_type in self.delays:
            min_delay, max_delay = self.delays[delay_type]
            delay = random.uniform(min_delay, max_delay)
            time.sleep(delay)
    
    def scrape_all_sources(self, max_workers: int = 3) -> List[ExpiredDomain]:
        """Scrape toutes les sources en parallèle"""
        logging.info("🚀 Démarrage du scraping de toutes les sources...")
        
        all_domains = []
        scrapers = {
            'expireddomains': self.scrape_expireddomains_net,
            'freedrop': self.scrape_freedrop_io,
            'dropcatch': self.scrape_dropcatch_com,
            'godaddy_auctions': self.scrape_godaddy_auctions,
            'namecheap_market': self.scrape_namecheap_market
        }
        
        # Scraping séquentiel pour éviter de surcharger les serveurs
        for source_name, scraper_func in scrapers.items():
            if self.sources[source_name]['enabled']:
                try:
                    domains = scraper_func()
                    all_domains.extend(domains)
                    
                    # Délai entre les sources
                    if source_name != list(scrapers.keys())[-1]:
                        self.random_delay('between_sites')
                        
                except Exception as e:
                    logging.error(f"❌ Erreur source {source_name}: {e}")
                    self.random_delay('on_error')
        
        # Filtrage des domaines de qualité
        filtered_domains = self.filter_quality_domains(all_domains)
        
        logging.info(f"📊 Résumé du scraping:")
        logging.info(f"   - Total trouvé: {len(all_domains)}")
        logging.info(f"   - Après filtrage: {len(filtered_domains)}")
        logging.info(f"   - Taux de qualité: {len(filtered_domains)/max(len(all_domains), 1)*100:.1f}%")
        
        return filtered_domains
    
    def save_to_csv(self, domains: List[ExpiredDomain], filename: str = None):
        """Sauvegarde les domaines en CSV"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"scraped_domains_{timestamp}.csv"
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = [
                'domain', 'source', 'da', 'pa', 'backlinks', 'price',
                'auction_end', 'registrar', 'category', 'length',
                'extension', 'discovered_at'
            ]
            
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for domain in domains:
                writer.writerow({
                    'domain': domain.domain,
                    'source': domain.source,
                    'da': domain.da,
                    'pa': domain.pa,
                    'backlinks': domain.backlinks,
                    'price': domain.price,
                    'auction_end': domain.auction_end,
                    'registrar': domain.registrar,
                    'category': domain.category,
                    'length': domain.length,
                    'extension': domain.extension,
                    'discovered_at': domain.discovered_at
                })
        
        logging.info(f"💾 Domaines sauvegardés dans {filename}")
        return filename
    
    def get_statistics(self) -> Dict:
        """Obtient les statistiques de scraping"""
        with sqlite3.connect('scraped_domains.db') as conn:
            stats = {}
            
            # Total de domaines
            cursor = conn.execute("SELECT COUNT(*) FROM scraped_domains")
            stats['total_domains'] = cursor.fetchone()[0]
            
            # Par source
            cursor = conn.execute("""
                SELECT source, COUNT(*) 
                FROM scraped_domains 
                GROUP BY source
            """)
            stats['by_source'] = dict(cursor.fetchall())
            
            # Par extension
            cursor = conn.execute("""
                SELECT extension, COUNT(*) 
                FROM scraped_domains 
                GROUP BY extension 
                ORDER BY COUNT(*) DESC
            """)
            stats['by_extension'] = dict(cursor.fetchall())
            
            # Domaines avec métriques
            cursor = conn.execute("""
                SELECT COUNT(*) FROM scraped_domains 
                WHERE da IS NOT NULL AND da > 10
            """)
            stats['high_da_domains'] = cursor.fetchone()[0]
            
            # Domaines récents (24h)
            yesterday = datetime.now() - timedelta(days=1)
            cursor = conn.execute("""
                SELECT COUNT(*) FROM scraped_domains 
                WHERE discovered_at > ?
            """, (yesterday.isoformat(),))
            stats['recent_domains'] = cursor.fetchone()[0]
        
        return stats

def main():
    """Fonction principale"""
    print("🕷️  DOMAIN HUNTER PRO - SCRAPER DE DOMAINES EXPIRÉS")
    print("=" * 60)
    
    scraper = ExpiredDomainScraper()
    
    import sys
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "--scrape":
            # Scraping complet
            domains = scraper.scrape_all_sources()
            
            # Sauvegarde des domaines en base et CSV
            for domain in domains:
                scraper.save_domain(domain)
            
            csv_file = scraper.save_to_csv(domains)
            
            print(f"\n✅ Scraping terminé:")
            print(f"   📊 {len(domains)} domaines de qualité trouvés")
            print(f"   💾 Sauvegardés en base de données")
            print(f"   📄 Export CSV: {csv_file}")
            
        elif command == "--stats":
            # Affichage des statistiques
            stats = scraper.get_statistics()
            
            print("📊 STATISTIQUES DE SCRAPING:")
            print(f"   Total domaines: {stats['total_domains']}")
            print(f"   Domaines récents (24h): {stats['recent_domains']}")
            print(f"   Domaines DA > 10: {stats['high_da_domains']}")
            
            print("\n📈 PAR SOURCE:")
            for source, count in stats['by_source'].items():
                print(f"   {source}: {count}")
            
            print("\n🔗 PAR EXTENSION:")
            for ext, count in list(stats['by_extension'].items())[:5]:
                print(f"   {ext}: {count}")
        
        elif command == "--export":
            # Export des domaines récents
            with sqlite3.connect('scraped_domains.db') as conn:
                cursor = conn.execute("""
                    SELECT * FROM scraped_domains 
                    WHERE discovered_at > datetime('now', '-24 hours')
                    ORDER BY da DESC, backlinks DESC
                """)
                
                domains = []
                for row in cursor.fetchall():
                    domain = ExpiredDomain(
                        domain=row[1],
                        source=row[2],
                        da=row[3],
                        pa=row[4],
                        backlinks=row[5],
                        price=row[6],
                        auction_end=row[7],
                        registrar=row[8],
                        category=row[9],
                        length=row[10],
                        extension=row[11],
                        discovered_at=row[12]
                    )
                    domains.append(domain)
                
                if domains:
                    csv_file = scraper.save_to_csv(domains)
                    print(f"✅ {len(domains)} domaines exportés vers {csv_file}")
                else:
                    print("ℹ️  Aucun domaine récent à exporter")
        
        elif command == "--test":
            # Test d'une source
            print("🧪 Test de scraping ExpiredDomains.net...")
            domains = scraper.scrape_expireddomains_net()
            
            print(f"\n📊 Résultats du test:")
            print(f"   Domaines trouvés: {len(domains)}")
            
            if domains:
                print("\n🏆 Top 5 des domaines:")
                for i, domain in enumerate(domains[:5], 1):
                    print(f"   {i}. {domain.domain} (DA: {domain.da}, BL: {domain.backlinks})")
    
    else:
        print("Usage:")
        print("  python3 domain_scraper.py --scrape    # Scraping complet")
        print("  python3 domain_scraper.py --stats     # Statistiques")
        print("  python3 domain_scraper.py --export    # Export CSV")
        print("  python3 domain_scraper.py --test      # Test d'une source")

if __name__ == "__main__":
    main()

