#!/usr/bin/env python3
"""
Collecteur de vraies données de domaines expirés
Utilise des sources réelles : ExpiredDomains.net, Archive.org, APIs publiques
"""

import requests
import json
import csv
import time
import logging
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import re
from bs4 import BeautifulSoup
import sqlite3

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class RealDataCollector:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.db_path = 'real_domains.db'
        self.init_database()
    
    def init_database(self):
        """Initialise la base de données pour stocker les vrais domaines"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS expired_domains (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    domain TEXT UNIQUE,
                    tld TEXT,
                    length INTEGER,
                    age_years INTEGER,
                    backlinks INTEGER,
                    domain_authority INTEGER,
                    price_estimate REAL,
                    auction_end DATETIME,
                    source TEXT,
                    keywords TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()
    
    def fetch_from_expireddomains_net(self, limit: int = 50) -> List[Dict]:
        """Scrape ExpiredDomains.net pour obtenir de vraies données"""
        logging.info("🌐 Récupération depuis ExpiredDomains.net")
        domains = []
        
        try:
            # URL pour les domaines avec backlinks
            url = "https://www.expireddomains.net/domain-name-search/"
            params = {
                'q': '',
                'ftld[]': ['com', 'net', 'org'],
                'fbl': '1',  # Au moins 1 backlink
                'fage': '1', # Au moins 1 an
                'flength': '4-15', # Longueur 4-15 caractères
                'o': 'dateadded',
                'd': 'desc'
            }
            
            response = self.session.get(url, params=params, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Parser le tableau des domaines
                table = soup.find('table', class_='base1')
                if table:
                    rows = table.find_all('tr')[1:]  # Skip header
                    
                    for row in rows[:limit]:
                        cells = row.find_all('td')
                        if len(cells) >= 10:
                            domain_data = {
                                'domain': cells[1].get_text(strip=True),
                                'tld': cells[1].get_text(strip=True).split('.')[-1],
                                'length': len(cells[1].get_text(strip=True).split('.')[0]),
                                'age_years': self._parse_age(cells[3].get_text(strip=True)),
                                'backlinks': self._parse_number(cells[4].get_text(strip=True)),
                                'domain_authority': self._parse_number(cells[5].get_text(strip=True)),
                                'price_estimate': self._estimate_price(cells),
                                'source': 'expireddomains.net',
                                'keywords': self._extract_keywords(cells[1].get_text(strip=True))
                            }
                            
                            if self._is_valid_domain(domain_data):
                                domains.append(domain_data)
                                logging.info(f"✅ Domaine collecté: {domain_data['domain']}")
            
            time.sleep(2)  # Respecter le serveur
            
        except Exception as e:
            logging.error(f"❌ Erreur ExpiredDomains.net: {e}")
        
        return domains
    
    def fetch_from_namejet(self, limit: int = 30) -> List[Dict]:
        """Récupère les données depuis NameJet (enchères publiques)"""
        logging.info("🏺 Récupération depuis NameJet")
        domains = []
        
        try:
            url = "https://www.namejet.com/Pages/Auctions/BackorderAuctions.aspx"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Parser les enchères en cours
                auction_rows = soup.find_all('tr', class_=['row', 'alternaterow'])
                
                for row in auction_rows[:limit]:
                    cells = row.find_all('td')
                    if len(cells) >= 5:
                        domain_name = cells[0].get_text(strip=True)
                        if '.' in domain_name:
                            domain_data = {
                                'domain': domain_name,
                                'tld': domain_name.split('.')[-1],
                                'length': len(domain_name.split('.')[0]),
                                'backlinks': self._parse_number(cells[2].get_text(strip=True)) if len(cells) > 2 else 0,
                                'price_estimate': self._parse_price(cells[3].get_text(strip=True)) if len(cells) > 3 else 0,
                                'auction_end': self._parse_auction_time(cells[4].get_text(strip=True)) if len(cells) > 4 else None,
                                'source': 'namejet.com',
                                'keywords': self._extract_keywords(domain_name)
                            }
                            
                            if self._is_valid_domain(domain_data):
                                domains.append(domain_data)
                                logging.info(f"✅ Enchère collectée: {domain_data['domain']}")
            
            time.sleep(2)
            
        except Exception as e:
            logging.error(f"❌ Erreur NameJet: {e}")
        
        return domains
    
    def fetch_from_godaddy_auctions(self, limit: int = 30) -> List[Dict]:
        """Récupère depuis GoDaddy Auctions (API publique)"""
        logging.info("🏪 Récupération depuis GoDaddy Auctions")
        domains = []
        
        try:
            # GoDaddy a une API publique pour les enchères
            url = "https://auctions.godaddy.com/trp.aspx"
            params = {
                'k': '',
                'ft': 'a',  # Auctions
                'o': 'ed',  # Order by end date
                'isc': 'true'
            }
            
            response = self.session.get(url, params=params, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Parser les résultats d'enchères
                results = soup.find_all('div', class_='results-row')
                
                for result in results[:limit]:
                    domain_link = result.find('a', class_='domainname')
                    if domain_link:
                        domain_name = domain_link.get_text(strip=True)
                        
                        # Extraire les métriques si disponibles
                        metrics = result.find('div', class_='metrics')
                        price_elem = result.find('span', class_='price')
                        
                        domain_data = {
                            'domain': domain_name,
                            'tld': domain_name.split('.')[-1],
                            'length': len(domain_name.split('.')[0]),
                            'price_estimate': self._parse_price(price_elem.get_text() if price_elem else '0'),
                            'source': 'godaddy.com',
                            'keywords': self._extract_keywords(domain_name)
                        }
                        
                        if self._is_valid_domain(domain_data):
                            domains.append(domain_data)
                            logging.info(f"✅ GoDaddy collecté: {domain_data['domain']}")
            
            time.sleep(2)
            
        except Exception as e:
            logging.error(f"❌ Erreur GoDaddy: {e}")
        
        return domains
    
    def fetch_from_dropcatch(self, limit: int = 20) -> List[Dict]:
        """Récupère depuis DropCatch.com"""
        logging.info("🎣 Récupération depuis DropCatch")
        domains = []
        
        try:
            url = "https://www.dropcatch.com/domain/search"
            params = {
                'query': '',
                'tlds[]': ['com', 'net', 'org'],
                'min_length': 4,
                'max_length': 15,
                'has_backlinks': 1
            }
            
            response = self.session.get(url, params=params, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                domain_rows = soup.find_all('tr', class_='domain-row')
                
                for row in domain_rows[:limit]:
                    domain_cell = row.find('td', class_='domain')
                    if domain_cell:
                        domain_name = domain_cell.get_text(strip=True)
                        
                        backlinks_cell = row.find('td', class_='backlinks')
                        price_cell = row.find('td', class_='price')
                        
                        domain_data = {
                            'domain': domain_name,
                            'tld': domain_name.split('.')[-1],
                            'length': len(domain_name.split('.')[0]),
                            'backlinks': self._parse_number(backlinks_cell.get_text() if backlinks_cell else '0'),
                            'price_estimate': self._parse_price(price_cell.get_text() if price_cell else '0'),
                            'source': 'dropcatch.com',
                            'keywords': self._extract_keywords(domain_name)
                        }
                        
                        if self._is_valid_domain(domain_data):
                            domains.append(domain_data)
                            logging.info(f"✅ DropCatch collecté: {domain_data['domain']}")
            
            time.sleep(2)
            
        except Exception as e:
            logging.error(f"❌ Erreur DropCatch: {e}")
        
        return domains
    
    def get_domain_history_archive_org(self, domain: str) -> Dict:
        """Récupère l'historique du domaine depuis Archive.org"""
        try:
            url = f"https://web.archive.org/cdx/search/cdx?url={domain}&output=json&fl=timestamp,original&limit=100"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if len(data) > 1:  # Skip header
                    first_capture = data[1][0] if len(data) > 1 else None
                    total_captures = len(data) - 1
                    
                    if first_capture:
                        first_year = int(first_capture[:4])
                        age_years = datetime.now().year - first_year
                        
                        return {
                            'age_years': age_years,
                            'total_captures': total_captures,
                            'first_seen': first_capture,
                            'has_history': True
                        }
            
            return {'has_history': False, 'age_years': 0, 'total_captures': 0}
            
        except Exception as e:
            logging.error(f"❌ Erreur Archive.org pour {domain}: {e}")
            return {'has_history': False, 'age_years': 0, 'total_captures': 0}
    
    def _parse_age(self, age_text: str) -> int:
        """Parse l'âge du domaine"""
        try:
            numbers = re.findall(r'\d+', age_text)
            return int(numbers[0]) if numbers else 0
        except:
            return 0
    
    def _parse_number(self, text: str) -> int:
        """Parse un nombre depuis le texte"""
        try:
            numbers = re.findall(r'\d+', text.replace(',', ''))
            return int(numbers[0]) if numbers else 0
        except:
            return 0
    
    def _parse_price(self, price_text: str) -> float:
        """Parse le prix"""
        try:
            # Enlever les symboles monétaires et parser
            clean_price = re.sub(r'[^\d.]', '', price_text)
            return float(clean_price) if clean_price else 0.0
        except:
            return 0.0
    
    def _parse_auction_time(self, time_text: str) -> Optional[datetime]:
        """Parse le temps de fin d'enchère"""
        try:
            # Logique de parsing selon le format
            # Implémentation basique - à adapter selon les formats
            return datetime.now() + timedelta(days=1)
        except:
            return None
    
    def _extract_keywords(self, domain: str) -> str:
        """Extrait les mots-clés potentiels du domaine"""
        domain_name = domain.split('.')[0].lower()
        
        # Mots-clés commerciaux communs
        commercial_keywords = [
            'shop', 'buy', 'sell', 'store', 'market', 'trade', 'deal',
            'tech', 'digital', 'online', 'web', 'app', 'software', 'ai',
            'seo', 'marketing', 'business', 'finance', 'crypto', 'invest',
            'health', 'fitness', 'beauty', 'fashion', 'travel', 'food',
            'education', 'learning', 'course', 'training', 'expert', 'pro',
            'blog', 'news', 'media', 'social', 'network', 'community'
        ]
        
        found_keywords = [kw for kw in commercial_keywords if kw in domain_name]
        return ','.join(found_keywords)
    
    def _estimate_price(self, cells) -> float:
        """Estime le prix basé sur les métriques"""
        try:
            # Logique d'estimation basée sur les backlinks, DA, etc.
            backlinks = self._parse_number(cells[4].get_text(strip=True)) if len(cells) > 4 else 0
            da = self._parse_number(cells[5].get_text(strip=True)) if len(cells) > 5 else 0
            
            base_price = 50
            if backlinks > 100:
                base_price += backlinks * 0.5
            if da > 20:
                base_price += da * 10
                
            return min(base_price, 5000)  # Cap à 5000€
        except:
            return 50.0
    
    def _is_valid_domain(self, domain_data: Dict) -> bool:
        """Valide si le domaine mérite d'être analysé"""
        domain = domain_data.get('domain', '')
        
        # Filtres de base
        if not domain or '.' not in domain:
            return False
        
        if domain_data.get('length', 0) < 4 or domain_data.get('length', 0) > 20:
            return False
        
        if domain_data.get('tld', '') not in ['com', 'net', 'org']:
            return False
        
        # Éviter les domaines avec des patterns indésirables
        bad_patterns = ['xxx', 'adult', 'porn', 'casino', 'gambling', 'loan']
        if any(pattern in domain.lower() for pattern in bad_patterns):
            return False
        
        return True
    
    def save_domains_to_db(self, domains: List[Dict]):
        """Sauvegarde les domaines en base"""
        with sqlite3.connect(self.db_path) as conn:
            for domain_data in domains:
                try:
                    conn.execute('''
                        INSERT OR REPLACE INTO expired_domains 
                        (domain, tld, length, age_years, backlinks, domain_authority, 
                         price_estimate, source, keywords)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        domain_data.get('domain'),
                        domain_data.get('tld'),
                        domain_data.get('length'),
                        domain_data.get('age_years', 0),
                        domain_data.get('backlinks', 0),
                        domain_data.get('domain_authority', 0),
                        domain_data.get('price_estimate', 0),
                        domain_data.get('source'),
                        domain_data.get('keywords', '')
                    ))
                except Exception as e:
                    logging.error(f"❌ Erreur sauvegarde {domain_data.get('domain')}: {e}")
            conn.commit()
    
    def export_to_csv(self, filename: str = None) -> str:
        """Exporte les domaines collectés en CSV"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"real_domains_{timestamp}.csv"
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT domain, tld, length, age_years, backlinks, domain_authority,
                       price_estimate, source, keywords, created_at
                FROM expired_domains
                ORDER BY backlinks DESC, domain_authority DESC
            ''')
            
            domains = cursor.fetchall()
        
        if domains:
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = [
                    'domain', 'tld', 'length', 'age_years', 'backlinks', 
                    'domain_authority', 'price_estimate', 'source', 'keywords', 'created_at'
                ]
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                
                for domain in domains:
                    writer.writerow(dict(zip(fieldnames, domain)))
            
            logging.info(f"📊 {len(domains)} domaines exportés vers {filename}")
            return filename
        
        return ""
    
    def get_collected_domains(self, limit: int = 100) -> List[str]:
        """Récupère la liste des domaines collectés"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT domain FROM expired_domains 
                WHERE backlinks > 0 OR domain_authority > 0
                ORDER BY backlinks DESC, domain_authority DESC
                LIMIT ?
            ''', (limit,))
            
            return [row[0] for row in cursor.fetchall()]
    
    def collect_all_sources(self, limit_per_source: int = 20) -> Dict:
        """Collecte depuis toutes les sources disponibles"""
        logging.info("🚀 Début de la collecte multi-sources")
        
        all_domains = []
        results = {}
        
        # ExpiredDomains.net
        try:
            expired_domains = self.fetch_from_expireddomains_net(limit_per_source)
            all_domains.extend(expired_domains)
            results['expireddomains.net'] = len(expired_domains)
        except Exception as e:
            logging.error(f"❌ Erreur ExpiredDomains.net: {e}")
            results['expireddomains.net'] = 0
        
        # NameJet
        try:
            namejet_domains = self.fetch_from_namejet(limit_per_source)
            all_domains.extend(namejet_domains)
            results['namejet.com'] = len(namejet_domains)
        except Exception as e:
            logging.error(f"❌ Erreur NameJet: {e}")
            results['namejet.com'] = 0
        
        # GoDaddy
        try:
            godaddy_domains = self.fetch_from_godaddy_auctions(limit_per_source)
            all_domains.extend(godaddy_domains)
            results['godaddy.com'] = len(godaddy_domains)
        except Exception as e:
            logging.error(f"❌ Erreur GoDaddy: {e}")
            results['godaddy.com'] = 0
        
        # DropCatch
        try:
            dropcatch_domains = self.fetch_from_dropcatch(limit_per_source)
            all_domains.extend(dropcatch_domains)
            results['dropcatch.com'] = len(dropcatch_domains)
        except Exception as e:
            logging.error(f"❌ Erreur DropCatch: {e}")
            results['dropcatch.com'] = 0
        
        # Sauvegarde en base
        if all_domains:
            self.save_domains_to_db(all_domains)
            logging.info(f"💾 {len(all_domains)} domaines sauvegardés")
        
        results['total_collected'] = len(all_domains)
        return results

def main():
    """Fonction principale pour tester le collecteur"""
    collector = RealDataCollector()
    
    print("🌐 Collecteur de Vraies Données de Domaines Expirés")
    print("=" * 50)
    
    # Collecte depuis toutes les sources
    results = collector.collect_all_sources(limit_per_source=15)
    
    print(f"\n📊 Résultats de la collecte:")
    for source, count in results.items():
        if source != 'total_collected':
            print(f"  • {source}: {count} domaines")
    
    print(f"\n✅ Total collecté: {results['total_collected']} domaines")
    
    # Export CSV
    if results['total_collected'] > 0:
        csv_file = collector.export_to_csv()
        print(f"📁 Fichier CSV généré: {csv_file}")
        
        # Affichage des meilleurs domaines
        domains = collector.get_collected_domains(10)
        if domains:
            print(f"\n⭐ Top 10 domaines collectés:")
            for i, domain in enumerate(domains, 1):
                print(f"  {i:2d}. {domain}")
    
    print("\n🎯 Prêt pour l'analyse avec optimized_scraper.py !")

if __name__ == "__main__":
    main()

