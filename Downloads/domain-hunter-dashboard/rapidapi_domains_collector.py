#!/usr/bin/env python3
"""
Collecteur de domaines expirés via RapidAPI
Utilise les APIs disponibles sur RapidAPI pour collecter de vrais domaines expirés
"""

import requests
import json
import csv
import time
import logging
from typing import List, Dict, Optional
from datetime import datetime
import sqlite3

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class RapidAPIDomainCollector:
    def __init__(self):
        self.rapidapi_key = "d74a8f1a67msh16f0066ca8073d0p12b39ajsndd08d6fd2d47"
        self.rapidapi_host = "expired-domain-search.p.rapidapi.com"
        self.session = requests.Session()
        self.session.headers.update({
            'X-RapidAPI-Key': self.rapidapi_key,
            'X-RapidAPI-Host': self.rapidapi_host,
            'User-Agent': 'DomainHunter/1.0'
        })
        self.api_endpoints = {
            'majestic': 'majestic-seo-api.p.rapidapi.com',
            'domain_da_pa': 'domain-da-pa-checker.p.rapidapi.com',
            'domain_price': 'domain-price-estimator.p.rapidapi.com',
            'domain_whois': 'whois-api.p.rapidapi.com',
            'domain_metrics': 'domain-metrics-checker.p.rapidapi.com',
            'expired_domains': 'expired-domain-search.p.rapidapi.com',
            'auctions': 'domain-auction-api.p.rapidapi.com',
            'moz_api': 'moz-api.p.rapidapi.com',
            'alexa_rank': 'alexa-rank-checker.p.rapidapi.com',
            'trust_flow': 'trust-flow-checker.p.rapidapi.com',
            'wayback': 'wayback-machine-api.p.rapidapi.com',
            'social_metrics': 'social-metrics-api.p.rapidapi.com'
        }
        self.db_path = 'rapidapi_domains.db'
        self.init_database()
    
    def init_database(self):
        """Initialise la base de données pour les domaines RapidAPI"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS rapidapi_domains (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    domain TEXT UNIQUE,
                    tld TEXT,
                    length INTEGER,
                    domain_authority INTEGER,
                    backlinks INTEGER,
                    price_estimate REAL,
                    auction_type TEXT,
                    auction_end DATETIME,
                    source_api TEXT,
                    keywords TEXT,
                    commercial_score REAL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()
    
    def search_expired_domains(self, limit: int = 50) -> List[Dict]:
        """Recherche de domaines expirés via RapidAPI"""
        logging.info(f"🔍 Recherche de {limit} domaines expirés via RapidAPI")
        domains = []
        
        try:
            # Endpoint pour domaines expirés
            url = "https://expired-domain-search.p.rapidapi.com/v1/search"
            
            params = {
                'limit': limit,
                'tld': 'com,net,org',
                'min_length': 4,
                'max_length': 15,
                'has_backlinks': 'true',
                'min_domain_rating': 10,
                'exclude_adult': 'true'
            }
            
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if 'domains' in data:
                for domain_info in data['domains']:
                    domain_data = self._parse_rapidapi_domain(domain_info)
                    if domain_data and self._is_valuable_domain(domain_data):
                        domains.append(domain_data)
                        logging.info(f"✅ Domaine RapidAPI: {domain_data['domain']}")
            
            logging.info(f"📊 {len(domains)} domaines collectés via RapidAPI")
            
        except requests.exceptions.RequestException as e:
            logging.error(f"❌ Erreur API RapidAPI: {e}")
        except Exception as e:
            logging.error(f"❌ Erreur générale: {e}")
        
        return domains
    
    def get_domain_auctions(self, limit: int = 30) -> List[Dict]:
        """Récupère les enchères en cours via RapidAPI"""
        logging.info(f"🏺 Recherche d'enchères via RapidAPI")
        auctions = []
        
        try:
            url = "https://domain-auction-api.p.rapidapi.com/v1/auctions"
            
            params = {
                'limit': limit,
                'status': 'active',
                'min_bid': 50,
                'max_bid': 2000,
                'tld': 'com,net'
            }
            
            # Changement d'host pour les enchères
            headers = self.session.headers.copy()
            headers['X-RapidAPI-Host'] = 'domain-auction-api.p.rapidapi.com'
            
            response = requests.get(url, params=params, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if 'auctions' in data:
                for auction in data['auctions']:
                    auction_data = self._parse_auction_data(auction)
                    if auction_data:
                        auctions.append(auction_data)
                        logging.info(f"✅ Enchère: {auction_data['domain']}")
            
        except Exception as e:
            logging.error(f"❌ Erreur enchères RapidAPI: {e}")
        
        return auctions
    
    def get_whois_data(self, domain: str) -> Dict:
        """Récupère les données WHOIS via RapidAPI"""
        try:
            url = "https://whois-api.p.rapidapi.com/v1/whois"
            
            params = {'domain': domain}
            
            headers = self.session.headers.copy()
            headers['X-RapidAPI-Host'] = 'whois-api.p.rapidapi.com'
            
            response = requests.get(url, params=params, headers=headers, timeout=15)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logging.error(f"❌ Erreur WHOIS pour {domain}: {e}")
            return {}
    
    def _parse_rapidapi_domain(self, domain_info: Dict) -> Optional[Dict]:
        """Parse les données de domaine depuis RapidAPI"""
        try:
            domain_name = domain_info.get('domain', '')
            if not domain_name:
                return None
            
            return {
                'domain': domain_name,
                'tld': domain_name.split('.')[-1],
                'length': len(domain_name.split('.')[0]),
                'domain_authority': domain_info.get('domain_rating', 0),
                'backlinks': domain_info.get('backlinks', 0),
                'price_estimate': domain_info.get('estimated_value', 0),
                'auction_type': domain_info.get('auction_type', 'expired'),
                'auction_end': domain_info.get('auction_end'),
                'source_api': 'rapidapi_expired_search',
                'keywords': self._extract_keywords(domain_name),
                'commercial_score': self._calculate_commercial_score(domain_name, domain_info)
            }
            
        except Exception as e:
            logging.error(f"❌ Erreur parsing domaine: {e}")
            return None
    
    def _parse_auction_data(self, auction: Dict) -> Optional[Dict]:
        """Parse les données d'enchère"""
        try:
            domain_name = auction.get('domain', '')
            if not domain_name:
                return None
            
            return {
                'domain': domain_name,
                'tld': domain_name.split('.')[-1],
                'length': len(domain_name.split('.')[0]),
                'domain_authority': auction.get('metrics', {}).get('da', 0),
                'backlinks': auction.get('metrics', {}).get('backlinks', 0),
                'price_estimate': auction.get('current_bid', 0),
                'auction_type': 'live_auction',
                'auction_end': auction.get('end_time'),
                'source_api': 'rapidapi_auctions',
                'keywords': self._extract_keywords(domain_name),
                'commercial_score': self._calculate_commercial_score(domain_name, auction)
            }
            
        except Exception as e:
            logging.error(f"❌ Erreur parsing enchère: {e}")
            return None
    
    def _extract_keywords(self, domain: str) -> str:
        """Extrait les mots-clés commerciaux du domaine"""
        domain_lower = domain.lower().split('.')[0]
        
        commercial_keywords = [
            'shop', 'store', 'buy', 'sell', 'market', 'trade', 'deal',
            'tech', 'ai', 'crypto', 'digital', 'online', 'web', 'app',
            'business', 'finance', 'invest', 'money', 'pay', 'bank',
            'health', 'fitness', 'beauty', 'fashion', 'lifestyle',
            'travel', 'food', 'restaurant', 'hotel', 'booking',
            'education', 'course', 'training', 'learn', 'study',
            'news', 'blog', 'media', 'social', 'network', 'community',
            'game', 'gaming', 'sport', 'music', 'art', 'photo',
            'pro', 'expert', 'master', 'premium', 'plus', 'best', 'top'
        ]
        
        found_keywords = [kw for kw in commercial_keywords if kw in domain_lower]
        return ','.join(found_keywords) if found_keywords else 'generic'
    
    def _calculate_commercial_score(self, domain: str, data: Dict) -> float:
        """Calcule un score commercial basé sur les données"""
        score = 5.0  # Base score
        
        # Bonus pour métriques
        da = data.get('domain_rating', data.get('metrics', {}).get('da', 0))
        backlinks = data.get('backlinks', data.get('metrics', {}).get('backlinks', 0))
        
        if da > 20:
            score += min(da / 10, 3.0)
        
        if backlinks > 50:
            score += min(backlinks / 100, 2.0)
        
        # Bonus pour mots-clés
        keywords = self._extract_keywords(domain)
        if keywords != 'generic':
            keyword_count = len(keywords.split(','))
            score += min(keyword_count * 0.5, 2.0)
        
        # Bonus pour TLD
        if domain.endswith('.com'):
            score += 1.0
        elif domain.endswith('.net'):
            score += 0.5
        
        # Pénalité pour longueur
        domain_name = domain.split('.')[0]
        if len(domain_name) > 15:
            score -= 1.0
        elif len(domain_name) < 6:
            score += 0.5
        
        return min(10.0, max(1.0, score))
    
    def _is_valuable_domain(self, domain_data: Dict) -> bool:
        """Détermine si un domaine a de la valeur"""
        return (
            domain_data.get('commercial_score', 0) >= 6.0 and
            domain_data.get('length', 0) <= 20 and
            domain_data.get('tld', '') in ['com', 'net', 'org'] and
            not any(bad in domain_data.get('domain', '').lower() for bad in ['adult', 'xxx', 'porn', 'casino'])
        )
    
    def save_domains_to_db(self, domains: List[Dict]):
        """Sauvegarde les domaines en base"""
        with sqlite3.connect(self.db_path) as conn:
            for domain_data in domains:
                try:
                    conn.execute('''
                        INSERT OR REPLACE INTO rapidapi_domains 
                        (domain, tld, length, domain_authority, backlinks, price_estimate,
                         auction_type, source_api, keywords, commercial_score)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        domain_data.get('domain'),
                        domain_data.get('tld'),
                        domain_data.get('length'),
                        domain_data.get('domain_authority', 0),
                        domain_data.get('backlinks', 0),
                        domain_data.get('price_estimate', 0),
                        domain_data.get('auction_type'),
                        domain_data.get('source_api'),
                        domain_data.get('keywords'),
                        domain_data.get('commercial_score', 0)
                    ))
                except Exception as e:
                    logging.error(f"❌ Erreur sauvegarde {domain_data.get('domain')}: {e}")
            conn.commit()
    
    def get_collected_domains(self, limit: int = 50) -> List[str]:
        """Récupère les domaines collectés"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT domain FROM rapidapi_domains 
                WHERE commercial_score >= 6.0
                ORDER BY commercial_score DESC, domain_authority DESC
                LIMIT ?
            ''', (limit,))
            
            return [row[0] for row in cursor.fetchall()]
    
    def export_to_csv(self, filename: str = None) -> str:
        """Exporte en CSV"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"rapidapi_domains_{timestamp}.csv"
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT domain, tld, length, domain_authority, backlinks, price_estimate,
                       auction_type, commercial_score, keywords, created_at
                FROM rapidapi_domains
                ORDER BY commercial_score DESC, domain_authority DESC
            ''')
            
            domains = cursor.fetchall()
        
        if domains:
            fieldnames = [
                'domain', 'tld', 'length', 'domain_authority', 'backlinks',
                'price_estimate', 'auction_type', 'commercial_score', 'keywords', 'created_at'
            ]
            
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                
                for domain in domains:
                    writer.writerow(dict(zip(fieldnames, domain)))
            
            logging.info(f"📊 {len(domains)} domaines RapidAPI exportés vers {filename}")
            return filename
        
        return ""
    
    def collect_all_rapidapi_sources(self, limit_per_source: int = 25) -> Dict:
        """Collecte depuis toutes les sources RapidAPI"""
        logging.info("🚀 Début collecte RapidAPI multi-sources")
        
        all_domains = []
        results = {}
        
        # Domaines expirés
        try:
            expired_domains = self.search_expired_domains(limit_per_source)
            all_domains.extend(expired_domains)
            results['expired_search'] = len(expired_domains)
        except Exception as e:
            logging.error(f"❌ Erreur recherche expirés: {e}")
            results['expired_search'] = 0
        
        # Enchères
        try:
            auction_domains = self.get_domain_auctions(limit_per_source)
            all_domains.extend(auction_domains)
            results['auctions'] = len(auction_domains)
        except Exception as e:
            logging.error(f"❌ Erreur enchères: {e}")
            results['auctions'] = 0
        
        # Sauvegarde
        if all_domains:
            self.save_domains_to_db(all_domains)
            logging.info(f"💾 {len(all_domains)} domaines RapidAPI sauvegardés")
        
        results['total_collected'] = len(all_domains)
        return results

def main():
    """Fonction principale"""
    collector = RapidAPIDomainCollector()
    
    print("🌐 Collecteur RapidAPI - Domaines Expirés")
    print("=" * 50)
    print(f"🔑 Clé API: {collector.rapidapi_key[:20]}...")
    
    # Test de connexion
    try:
        results = collector.collect_all_rapidapi_sources(limit_per_source=20)
        
        print(f"\n📊 Résultats RapidAPI:")
        for source, count in results.items():
            if source != 'total_collected':
                print(f"  • {source}: {count} domaines")
        
        print(f"\n✅ Total collecté: {results['total_collected']} domaines")
        
        # Export CSV
        if results['total_collected'] > 0:
            csv_file = collector.export_to_csv()
            print(f"📁 Export CSV: {csv_file}")
            
            # Top domaines
            domains = collector.get_collected_domains(10)
            if domains:
                print(f"\n⭐ Top 10 domaines RapidAPI:")
                for i, domain in enumerate(domains, 1):
                    print(f"  {i:2d}. {domain}")
        
        print("\n🎯 Prêt pour l'analyse avec integrated_real_scraper.py !")
        
    except Exception as e:
        print(f"❌ Erreur de connexion RapidAPI: {e}")
        print("💡 Vérifiez votre clé API et votre connexion internet")

if __name__ == "__main__":
    main()

