#!/usr/bin/env python3
"""
Domain Hunter Pro - Gestionnaire de Proxies
Script pour gérer, tester et optimiser les proxies pour le scraping
"""

import json
import requests
import time
import sqlite3
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
import concurrent.futures
import threading
from urllib.parse import urlparse

@dataclass
class ProxyConfig:
    host: str
    port: int
    username: Optional[str] = None
    password: Optional[str] = None
    protocol: str = 'http'
    country: Optional[str] = None
    provider: Optional[str] = None
    
    def to_dict(self) -> dict:
        proxy_url = f"{self.protocol}://"
        if self.username and self.password:
            proxy_url += f"{self.username}:{self.password}@"
        proxy_url += f"{self.host}:{self.port}"
        
        return {
            'http': proxy_url,
            'https': proxy_url
        }
    
    def __str__(self):
        return f"{self.host}:{self.port}"

class ProxyManager:
    def __init__(self, db_path: str = 'proxies.db'):
        self.db_path = db_path
        self.init_database()
        self.working_proxies = []
        self.failed_proxies = []
        self.lock = threading.Lock()
        
        # URLs pour tester les proxies
        self.test_urls = [
            'http://httpbin.org/ip',
            'https://ipapi.co/json/',
            'http://icanhazip.com'
        ]
    
    def init_database(self):
        """Initialise la base de données des proxies"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS proxies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    host TEXT,
                    port INTEGER,
                    username TEXT,
                    password TEXT,
                    protocol TEXT DEFAULT 'http',
                    country TEXT,
                    provider TEXT,
                    is_working BOOLEAN DEFAULT 1,
                    last_tested DATETIME,
                    response_time REAL,
                    success_count INTEGER DEFAULT 0,
                    failure_count INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(host, port)
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS proxy_tests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    proxy_id INTEGER,
                    test_url TEXT,
                    success BOOLEAN,
                    response_time REAL,
                    error_message TEXT,
                    tested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (proxy_id) REFERENCES proxies (id)
                )
            """)
            
            conn.commit()
    
    def add_proxy(self, proxy: ProxyConfig) -> bool:
        """Ajoute un proxy à la base de données"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO proxies 
                    (host, port, username, password, protocol, country, provider)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    proxy.host, proxy.port, proxy.username, proxy.password,
                    proxy.protocol, proxy.country, proxy.provider
                ))
                conn.commit()
                return True
        except Exception as e:
            logging.error(f"Erreur ajout proxy {proxy}: {e}")
            return False
    
    def load_proxies_from_file(self, filename: str) -> int:
        """Charge les proxies depuis un fichier JSON"""
        try:
            with open(filename, 'r') as f:
                proxy_data = json.load(f)
            
            added_count = 0
            for proxy_info in proxy_data:
                proxy = ProxyConfig(**proxy_info)
                if self.add_proxy(proxy):
                    added_count += 1
            
            logging.info(f"📎 {added_count} proxies ajoutés depuis {filename}")
            return added_count
            
        except Exception as e:
            logging.error(f"Erreur chargement fichier {filename}: {e}")
            return 0
    
    def load_free_proxies(self) -> List[ProxyConfig]:
        """Charge une liste de proxies gratuits (pour démo)"""
        free_proxies = [
            {'host': '8.210.76.207', 'port': 3128, 'country': 'SG', 'provider': 'free'},
            {'host': '103.152.112.162', 'port': 80, 'country': 'IN', 'provider': 'free'},
            {'host': '185.162.231.106', 'port': 80, 'country': 'RU', 'provider': 'free'},
            {'host': '20.111.54.16', 'port': 8123, 'country': 'US', 'provider': 'free'},
            {'host': '103.149.162.194', 'port': 80, 'country': 'BD', 'provider': 'free'},
            {'host': '27.147.209.215', 'port': 8080, 'country': 'TH', 'provider': 'free'},
            {'host': '103.167.171.150', 'port': 80, 'country': 'KH', 'provider': 'free'},
            {'host': '165.154.227.188', 'port': 80, 'country': 'US', 'provider': 'free'},
            {'host': '103.156.15.25', 'port': 80, 'country': 'ID', 'provider': 'free'},
            {'host': '103.161.164.137', 'port': 8181, 'country': 'BD', 'provider': 'free'}
        ]
        
        proxies = []
        for proxy_data in free_proxies:
            proxy = ProxyConfig(**proxy_data)
            self.add_proxy(proxy)
            proxies.append(proxy)
        
        return proxies
    
    def test_single_proxy(self, proxy: ProxyConfig, timeout: int = 10) -> Dict:
        """Teste un proxy individuel"""
        result = {
            'proxy': proxy,
            'working': False,
            'response_time': None,
            'error': None
        }
        
        try:
            start_time = time.time()
            
            response = requests.get(
                self.test_urls[0],
                proxies=proxy.to_dict(),
                timeout=timeout,
                headers={'User-Agent': 'Mozilla/5.0 (compatible; ProxyTester/1.0)'}
            )
            
            end_time = time.time()
            response_time = end_time - start_time
            
            if response.status_code == 200:
                result['working'] = True
                result['response_time'] = response_time
                
                # Vérifier si l'IP a changé
                try:
                    ip_data = response.json()
                    proxy_ip = ip_data.get('origin', '')
                    logging.debug(f"Proxy {proxy} - IP: {proxy_ip}")
                except:
                    pass
            
        except Exception as e:
            result['error'] = str(e)
            logging.debug(f"Proxy {proxy} failed: {e}")
        
        return result
    
    def test_all_proxies(self, max_workers: int = 20, timeout: int = 10) -> Dict:
        """Teste tous les proxies en parallèle"""
        logging.info("🧪 Démarrage des tests de proxies...")
        
        # Récupérer tous les proxies
        proxies = self.get_all_proxies()
        
        working_proxies = []
        failed_proxies = []
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Soumettre tous les tests
            future_to_proxy = {
                executor.submit(self.test_single_proxy, proxy, timeout): proxy 
                for proxy in proxies
            }
            
            # Collecter les résultats
            for future in concurrent.futures.as_completed(future_to_proxy):
                result = future.result()
                
                if result['working']:
                    working_proxies.append(result)
                    self.update_proxy_status(result['proxy'], True, result['response_time'])
                else:
                    failed_proxies.append(result)
                    self.update_proxy_status(result['proxy'], False, None, result['error'])
        
        # Mise à jour des listes
        with self.lock:
            self.working_proxies = [r['proxy'] for r in working_proxies]
            self.failed_proxies = [r['proxy'] for r in failed_proxies]
        
        stats = {
            'total_tested': len(proxies),
            'working': len(working_proxies),
            'failed': len(failed_proxies),
            'success_rate': len(working_proxies) / len(proxies) * 100 if proxies else 0,
            'working_proxies': working_proxies,
            'failed_proxies': failed_proxies
        }
        
        logging.info(f"✅ Tests terminés: {stats['working']}/{stats['total_tested']} fonctionnels ({stats['success_rate']:.1f}%)")
        
        return stats
    
    def get_all_proxies(self) -> List[ProxyConfig]:
        """Récupère tous les proxies de la base"""
        proxies = []
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT host, port, username, password, protocol, country, provider
                FROM proxies
                ORDER BY success_count DESC, response_time ASC
            """)
            
            for row in cursor.fetchall():
                proxy = ProxyConfig(
                    host=row[0],
                    port=row[1],
                    username=row[2],
                    password=row[3],
                    protocol=row[4] or 'http',
                    country=row[5],
                    provider=row[6]
                )
                proxies.append(proxy)
        
        return proxies
    
    def get_working_proxies(self, limit: int = None) -> List[ProxyConfig]:
        """Récupère les proxies fonctionnels"""
        with sqlite3.connect(self.db_path) as conn:
            query = """
                SELECT host, port, username, password, protocol, country, provider
                FROM proxies
                WHERE is_working = 1 AND last_tested > datetime('now', '-1 day')
                ORDER BY response_time ASC, success_count DESC
            """
            
            if limit:
                query += f" LIMIT {limit}"
            
            cursor = conn.execute(query)
            
            proxies = []
            for row in cursor.fetchall():
                proxy = ProxyConfig(
                    host=row[0],
                    port=row[1],
                    username=row[2],
                    password=row[3],
                    protocol=row[4] or 'http',
                    country=row[5],
                    provider=row[6]
                )
                proxies.append(proxy)
        
        return proxies
    
    def update_proxy_status(self, proxy: ProxyConfig, is_working: bool, 
                          response_time: Optional[float] = None, 
                          error: Optional[str] = None):
        """Met à jour le statut d'un proxy"""
        with sqlite3.connect(self.db_path) as conn:
            # Mettre à jour le proxy
            if is_working:
                conn.execute("""
                    UPDATE proxies 
                    SET is_working = 1, last_tested = ?, response_time = ?,
                        success_count = success_count + 1
                    WHERE host = ? AND port = ?
                """, (datetime.now().isoformat(), response_time, proxy.host, proxy.port))
            else:
                conn.execute("""
                    UPDATE proxies 
                    SET is_working = 0, last_tested = ?,
                        failure_count = failure_count + 1
                    WHERE host = ? AND port = ?
                """, (datetime.now().isoformat(), proxy.host, proxy.port))
            
            # Enregistrer le test
            proxy_id = conn.execute(
                "SELECT id FROM proxies WHERE host = ? AND port = ?",
                (proxy.host, proxy.port)
            ).fetchone()
            
            if proxy_id:
                conn.execute("""
                    INSERT INTO proxy_tests 
                    (proxy_id, test_url, success, response_time, error_message)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    proxy_id[0], self.test_urls[0], is_working, 
                    response_time, error
                ))
            
            conn.commit()
    
    def get_proxy_stats(self) -> Dict:
        """Obtient les statistiques des proxies"""
        with sqlite3.connect(self.db_path) as conn:
            stats = {}
            
            # Total proxies
            cursor = conn.execute("SELECT COUNT(*) FROM proxies")
            stats['total'] = cursor.fetchone()[0]
            
            # Proxies fonctionnels
            cursor = conn.execute(
                "SELECT COUNT(*) FROM proxies WHERE is_working = 1"
            )
            stats['working'] = cursor.fetchone()[0]
            
            # Par pays
            cursor = conn.execute("""
                SELECT country, COUNT(*) 
                FROM proxies 
                WHERE is_working = 1 AND country IS NOT NULL
                GROUP BY country 
                ORDER BY COUNT(*) DESC
            """)
            stats['by_country'] = dict(cursor.fetchall())
            
            # Par fournisseur
            cursor = conn.execute("""
                SELECT provider, COUNT(*) 
                FROM proxies 
                WHERE is_working = 1 AND provider IS NOT NULL
                GROUP BY provider 
                ORDER BY COUNT(*) DESC
            """)
            stats['by_provider'] = dict(cursor.fetchall())
            
            # Temps de réponse moyen
            cursor = conn.execute("""
                SELECT AVG(response_time) 
                FROM proxies 
                WHERE is_working = 1 AND response_time IS NOT NULL
            """)
            avg_response = cursor.fetchone()[0]
            stats['avg_response_time'] = round(avg_response, 3) if avg_response else 0
            
            # Tests récents
            cursor = conn.execute("""
                SELECT COUNT(*) FROM proxy_tests 
                WHERE tested_at > datetime('now', '-1 hour')
            """)
            stats['recent_tests'] = cursor.fetchone()[0]
        
        return stats
    
    def cleanup_old_tests(self, days: int = 7):
        """Nettoie les anciens tests"""
        with sqlite3.connect(self.db_path) as conn:
            cutoff = datetime.now() - timedelta(days=days)
            
            cursor = conn.execute(
                "DELETE FROM proxy_tests WHERE tested_at < ?",
                (cutoff.isoformat(),)
            )
            
            deleted = cursor.rowcount
            conn.commit()
            
            logging.info(f"🧹 {deleted} anciens tests supprimés")
    
    def export_working_proxies(self, filename: str = 'working_proxies.json'):
        """Exporte les proxies fonctionnels"""
        working_proxies = self.get_working_proxies()
        
        export_data = []
        for proxy in working_proxies:
            export_data.append({
                'host': proxy.host,
                'port': proxy.port,
                'username': proxy.username,
                'password': proxy.password,
                'protocol': proxy.protocol,
                'country': proxy.country,
                'provider': proxy.provider
            })
        
        with open(filename, 'w') as f:
            json.dump(export_data, f, indent=2)
        
        logging.info(f"💾 {len(export_data)} proxies exportés vers {filename}")
        return filename

def main():
    """Fonction principale du gestionnaire de proxies"""
    print("📡 DOMAIN HUNTER PRO - GESTIONNAIRE DE PROXIES")
    print("=" * 55)
    
    manager = ProxyManager()
    
    import sys
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "--load-free":
            # Charger des proxies gratuits
            print("📎 Chargement de proxies gratuits...")
            proxies = manager.load_free_proxies()
            print(f"✅ {len(proxies)} proxies gratuits ajoutés")
            
        elif command == "--test":
            # Tester tous les proxies
            stats = manager.test_all_proxies(max_workers=10, timeout=15)
            
            print(f"\n📊 RÉSULTATS DES TESTS:")
            print(f"   Total testé: {stats['total_tested']}")
            print(f"   Fonctionnels: {stats['working']}")
            print(f"   Échoués: {stats['failed']}")
            print(f"   Taux de succès: {stats['success_rate']:.1f}%")
            
            if stats['working_proxies']:
                print(f"\n🏆 TOP 5 PROXIES RAPIDES:")
                sorted_proxies = sorted(
                    stats['working_proxies'], 
                    key=lambda x: x['response_time']
                )
                
                for i, proxy_result in enumerate(sorted_proxies[:5], 1):
                    proxy = proxy_result['proxy']
                    time_ms = proxy_result['response_time'] * 1000
                    print(f"   {i}. {proxy.host}:{proxy.port} - {time_ms:.0f}ms")
        
        elif command == "--stats":
            # Afficher les statistiques
            stats = manager.get_proxy_stats()
            
            print(f"📊 STATISTIQUES DES PROXIES:")
            print(f"   Total: {stats['total']}")
            print(f"   Fonctionnels: {stats['working']}")
            print(f"   Temps moyen: {stats['avg_response_time']}s")
            print(f"   Tests récents: {stats['recent_tests']}")
            
            if stats['by_country']:
                print(f"\n🌍 PAR PAYS:")
                for country, count in list(stats['by_country'].items())[:5]:
                    print(f"   {country}: {count}")
            
            if stats['by_provider']:
                print(f"\n🏢 PAR FOURNISSEUR:")
                for provider, count in stats['by_provider'].items():
                    print(f"   {provider}: {count}")
        
        elif command == "--export":
            # Exporter les proxies fonctionnels
            filename = manager.export_working_proxies()
            print(f"✅ Proxies exportés vers {filename}")
        
        elif command == "--cleanup":
            # Nettoyer les anciens tests
            manager.cleanup_old_tests()
            print("✅ Nettoyage terminé")
        
        elif command == "--load" and len(sys.argv) > 2:
            # Charger depuis un fichier
            filename = sys.argv[2]
            count = manager.load_proxies_from_file(filename)
            print(f"✅ {count} proxies chargés depuis {filename}")
    
    else:
        print("Usage:")
        print("  python3 proxy_manager.py --load-free        # Charger proxies gratuits")
        print("  python3 proxy_manager.py --test             # Tester tous les proxies")
        print("  python3 proxy_manager.py --stats            # Afficher statistiques")
        print("  python3 proxy_manager.py --export           # Exporter proxies OK")
        print("  python3 proxy_manager.py --cleanup          # Nettoyer anciens tests")
        print("  python3 proxy_manager.py --load <file>      # Charger depuis fichier")
        print("\nExemple de fichier JSON:")
        print('[{"host": "1.2.3.4", "port": 8080, "country": "US", "provider": "premium"}]')

if __name__ == "__main__":
    main()

