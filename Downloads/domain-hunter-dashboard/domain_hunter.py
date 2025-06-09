#!/usr/bin/env python3
"""
Script d'automatisation de recherche de domaines expirés avec l'API Perplexity
"""

import requests
import json
import schedule
import time
import csv
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import sqlite3
import os
from dataclasses import dataclass, asdict
import argparse
import random
import re

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('domain_hunter.log'),
        logging.StreamHandler()
    ]
)

@dataclass
class DomainAnalysis:
    domain: str
    score_seo: int
    score_commercial: int
    score_concurrence: int
    score_risque: int
    score_global: int
    prix_recommande: float
    potentiel_revente: float
    roi_projete: float
    recommandation: str
    timestamp: str

class PerplexityAPI:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.perplexity.ai/chat/completions"
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def analyze_domain(self, domain_name: str) -> Optional[DomainAnalysis]:
        """Analyse un domaine avec l'API Perplexity"""
        prompt = f"""
        En tant qu'expert SEO et domaines expirés, analysez le domaine: {domain_name}
        
        Fournissez une analyse structurée avec des scores sur 10 pour:
        
        1. AUTORITÉ SEO (score/10):
        - Âge et historique du domaine
        - Qualité des backlinks historiques  
        - Métriques de confiance (Trust Flow, Citation Flow)
        
        2. POTENTIEL COMMERCIAL (score/10):
        - Pertinence pour l'affiliation
        - Opportunités de monétisation
        - Volume de recherche des mots-clés
        
        3. ANALYSE CONCURRENTIELLE (score/10):
        - Saturation du marché
        - Opportunités de positionnement
        - Barrières à l'entrée
        
        4. ÉVALUATION DES RISQUES (score/10 inversé):
        - Historique de pénalités Google
        - Contenu problématique antérieur
        - Risques légaux
        
        5. ESTIMATION FINANCIÈRE:
        - Prix d'acquisition recommandé (€)
        - Potentiel de revente estimé (€)
        - ROI projeté sur 12 mois (%)
        
        Format de réponse JSON:
        {{
            "seo_score": X,
            "commercial_score": X,
            "competition_score": X,
            "risk_score": X,
            "global_score": X,
            "recommended_price": X,
            "resale_potential": X,
            "projected_roi": X,
            "recommendation": "ACHETER/ÉVITER/SURVEILLER"
        }}
        """
        
        payload = {
            "model": "llama-3.1-sonar-large-128k-online",
            "messages": [
                {"role": "system", "content": "Tu es un expert en domaines expirés et SEO avec 10 ans d'expérience."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
            "max_tokens": 1024 # Ajout pour s'assurer que la réponse JSON n'est pas tronquée
        }
        
        try:
            response = requests.post(self.base_url, headers=self.headers, json=payload, timeout=45) # Timeout augmenté
            response.raise_for_status()
            
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            # Extraction plus robuste du JSON
            try:
                json_match = re.search(r'(?s)\{.*\}', content)
                if json_match:
                    json_str = json_match.group(0)
                    analysis_data = json.loads(json_str)
                    
                    return DomainAnalysis(
                        domain=domain_name,
                        score_seo=int(analysis_data.get('seo_score', 0)),
                        score_commercial=int(analysis_data.get('commercial_score', 0)),
                        score_concurrence=int(analysis_data.get('competition_score', 0)),
                        score_risque=int(analysis_data.get('risk_score', 0)),
                        score_global=int(analysis_data.get('global_score', 0)),
                        prix_recommande=float(analysis_data.get('recommended_price', 0.0)),
                        potentiel_revente=float(analysis_data.get('resale_potential', 0.0)),
                        roi_projete=float(analysis_data.get('projected_roi', 0.0)),
                        recommandation=str(analysis_data.get('recommendation', 'INCONNU')),
                        timestamp=datetime.now().isoformat()
                    )
                else:
                    logging.error(f"Aucun JSON trouvé dans la réponse pour {domain_name}: {content}")
                    return None
            except json.JSONDecodeError as e:
                logging.error(f"Erreur parsing JSON pour {domain_name} ({e}): {content}")
                return None
                
        except requests.RequestException as e:
            logging.error(f"Erreur API pour {domain_name}: {e}")
            return None

class ExpiredDomainCollector:
    def __init__(self):
        # Pour le moment, nous utilisons une liste simulée.
        # Vous pouvez réactiver WhoisFreaks ou d'autres sources ici.
        pass
    
    def fetch_expired_domains(self, limit: int = 20) -> List[str]:
        """Simule la récupération de domaines expirés."""
        logging.info("Utilisation d'une liste simulée de domaines pour le collecteur.")
        sample_domains = [
            f'demodomain{i}.com' for i in range(limit)
        ] + [
            'tech-blog-example.com',
            'digital-agency-pro.net',
            'seo-tools-master.org',
            'affiliate-marketer-hub.com',
            'webdev-resources.net'
        ]
        return random.sample(sample_domains, min(limit, len(sample_domains)))

class DatabaseManager:
    def __init__(self, db_path: str = 'domain_analysis.db'):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialise la base de données"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS domain_analyses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    domain TEXT UNIQUE,
                    score_seo INTEGER,
                    score_commercial INTEGER,
                    score_concurrence INTEGER,
                    score_risque INTEGER,
                    score_global INTEGER,
                    prix_recommande REAL,
                    potentiel_revente REAL,
                    roi_projete REAL,
                    recommandation TEXT,
                    timestamp TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()
    
    def save_analysis(self, analysis: DomainAnalysis):
        """Sauvegarde une analyse en base"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT OR REPLACE INTO domain_analyses 
                (domain, score_seo, score_commercial, score_concurrence, score_risque, 
                 score_global, prix_recommande, potentiel_revente, roi_projete, 
                 recommandation, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                analysis.domain, analysis.score_seo, analysis.score_commercial,
                analysis.score_concurrence, analysis.score_risque, analysis.score_global,
                analysis.prix_recommande, analysis.potentiel_revente, analysis.roi_projete,
                analysis.recommandation, analysis.timestamp
            ))
            conn.commit()
    
    def get_top_opportunities(self, limit: int = 10) -> List[Dict]:
        """Récupère les meilleures opportunités"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT * FROM domain_analyses 
                WHERE recommandation LIKE '%ACHETER%' 
                ORDER BY score_global DESC, roi_projete DESC 
                LIMIT ?
            ''', (limit,))
            
            columns = [description[0] for description in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]

class DomainHunter:
    def __init__(self, perplexity_api_key: str):
        self.perplexity = PerplexityAPI(perplexity_api_key)
        self.collector = ExpiredDomainCollector() 
        self.db = DatabaseManager()

    def load_domains_from_csv(self, csv_filepath: str) -> List[str]:
        """Charge les noms de domaines depuis un fichier CSV."""
        domains = []
        try:
            with open(csv_filepath, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                header = [h.lower() for h in reader.fieldnames]
                domain_column_name = None
                if 'domain' in header:
                    domain_column_name = reader.fieldnames[header.index('domain')]
                elif 'nom_domaine' in header: # French alternative
                    domain_column_name = reader.fieldnames[header.index('nom_domaine')]
                
                if not domain_column_name:
                    logging.error(f"Colonne 'domain' ou 'nom_domaine' non trouvée dans {csv_filepath}")
                    return []

                for row in reader:
                    domain_name = row.get(domain_column_name)
                    if domain_name and '.' in domain_name: # Basic validation
                        domains.append(domain_name.strip())
            logging.info(f"📄 {len(domains)} domaines uniques chargés depuis {csv_filepath}")
        except FileNotFoundError:
            logging.error(f"Fichier CSV non trouvé: {csv_filepath}")
        except Exception as e:
            logging.error(f"Erreur lors de la lecture du CSV {csv_filepath}: {e}")
        return list(set(domains)) # Retourne une liste de domaines uniques
        
    def daily_hunt(self, csv_filepath: Optional[str] = None, limit_domains: Optional[int] = None):
        """Tâche de recherche de domaines, soit via collecteur, soit via CSV."""
        
        domains_to_analyze = []
        if csv_filepath:
            logging.info(f"🚀 Début de la chasse aux domaines depuis le fichier CSV: {csv_filepath}")
            domains_to_analyze = self.load_domains_from_csv(csv_filepath)
        else:
            logging.info("🚀 Début de la chasse quotidienne aux domaines via collecteur")
            domains_to_analyze = self.collector.fetch_expired_domains(limit=20) 
        
        if not domains_to_analyze:
            logging.warning("Aucun domaine à analyser.")
            return

        if limit_domains and limit_domains < len(domains_to_analyze):
            logging.info(f"Limitation à {limit_domains} domaines pour cette analyse.")
            domains_to_analyze = random.sample(domains_to_analyze, limit_domains)

        logging.info(f"📋 {len(domains_to_analyze)} domaines à analyser")
        
        try:
            high_value_domains = []
            processed_count = 0

            for domain in domains_to_analyze:
                logging.info(f"🔍 ({processed_count+1}/{len(domains_to_analyze)}) Analyse de {domain}")
                
                analysis = self.perplexity.analyze_domain(domain)
                
                if analysis:
                    self.db.save_analysis(analysis)
                    if 'ACHETER' in analysis.recommandation.upper() and analysis.score_global >= 60:
                        high_value_domains.append(analysis)
                        logging.info(f"✅ Opportunité trouvée: {domain} (Score: {analysis.score_global}, ROI: {analysis.roi_projete}%)")
                    time.sleep(random.uniform(1,3)) # Délai respectueux entre les appels API
                else:
                    logging.warning(f"❌ Échec analyse pour {domain}")
                    time.sleep(random.uniform(3,5)) # Délai plus long après un échec
                
                processed_count += 1
            
            self.generate_daily_report(high_value_domains)
            logging.info(f"🎯 {len(high_value_domains)} opportunités de haute valeur identifiées")
            
        except Exception as e:
            logging.error(f"❌ Erreur dans la chasse quotidienne: {e}", exc_info=True)
    
    def generate_daily_report(self, opportunities: List[DomainAnalysis]):
        """Génère un rapport quotidien"""
        if not opportunities:
            logging.info("Aucune opportunité à rapporter.")
            return
            
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"rapport_opportunites_{timestamp}.csv"
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = [
                'Domaine', 'Score_Global', 'ROI_Projeté', 'Prix_Recommandé', 
                'Recommandation', 'Score_SEO', 'Score_Commercial'
            ]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for opp in opportunities:
                writer.writerow({
                    'Domaine': opp.domain,
                    'Score_Global': opp.score_global,
                    'ROI_Projeté': f"{opp.roi_projete}%",
                    'Prix_Recommandé': f"{opp.prix_recommande}€",
                    'Recommandation': opp.recommandation,
                    'Score_SEO': opp.score_seo,
                    'Score_Commercial': opp.score_commercial
                })
        
        logging.info(f"📊 Rapport généré: {filename}")
    
    def start_scheduler(self):
        """Lance le planificateur automatique"""
        schedule.every().day.at("08:00").do(self.daily_hunt)
        schedule.every().day.at("14:00").do(self.daily_hunt, csv_filepath="domains_a_verifier.csv", limit_domains=10) # Exemple avec CSV
        schedule.every().monday.at("09:00").do(self.daily_hunt, limit_domains=50) # Analyse plus large le lundi
        
        logging.info("⏰ Planificateur démarré. Prochaines analyses programmées.")
        while True:
            schedule.run_pending()
            time.sleep(60)

def find_free_api_sources() -> Dict[str, str]:
    """Simule la recherche de sources d'API gratuites pour les domaines."""
    logging.info("🔍 Recherche de sources d'API gratuites...")
    # Ceci est une simulation. En réalité, il faudrait chercher des services comme:
    # - API publiques de registrars (rares pour les expirés)
    # - Projets open-source de listes de domaines
    # - Certains forums ou communautés partageant des listes (à utiliser avec prudence)
    
    # Exemple de sources (fictives ou nécessitant une clé gratuite)
    free_apis = {
        "OpenDomainProject": "https://api.opendomainproject.org/v1/expiring_soon?limit=100",
        "DomainListShare": "https://sharedlists.example.com/daily_drops.json",
        "PublicRegistrarFeed": "https://public.registrar.example/feeds/expiring.xml"
    }
    
    logging.info(f"💡 {len(free_apis)} sources d'API gratuites potentielles trouvées (simulation).")
    logging.warning("Note: La fiabilité et la qualité des API gratuites peuvent varier considérablement.")
    return free_apis

def main():
    """Fonction principale"""
    # Configuration
    PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY", "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")
    if not PERPLEXITY_API_KEY or PERPLEXITY_API_KEY == "YOUR_API_KEY_HERE":
        logging.error("Clé API Perplexity non configurée. Veuillez la définir dans la variable d'environnement PERPLEXITY_API_KEY ou directement dans le script.")
        return

    parser = argparse.ArgumentParser(description="Domain Hunter Pro - Automatisation de recherche de domaines")
    parser.add_argument("--once", action="store_true", help="Exécution unique de la chasse via collecteur simulé.")
    parser.add_argument("--scheduler", action="store_true", help="Lancer le planificateur automatique.")
    parser.add_argument("--report", action="store_true", help="Afficher le rapport des top opportunités.")
    parser.add_argument("--csv", type=str, help="Chemin vers un fichier CSV de domaines à analyser.")
    parser.add_argument("--limit", type=int, help="Nombre maximum de domaines à analyser (pour --once ou --csv).")
    parser.add_argument("--find-free-apis", action="store_true", help="Rechercher (simuler) des sources d'API gratuites.")

    args = parser.parse_args()
    hunter = DomainHunter(PERPLEXITY_API_KEY)

    if args.find_free_apis:
        free_api_sources = find_free_api_sources()
        print("\n🌐 Sources d'API gratuites potentielles (simulation):")
        for name, url in free_api_sources.items():
            print(f"  - {name}: {url}")
        return

    if args.csv:
        hunter.daily_hunt(csv_filepath=args.csv, limit_domains=args.limit)
    elif args.once:
        hunter.daily_hunt(limit_domains=args.limit or 5) # Analyse 5 domaines par défaut pour --once
    elif args.scheduler:
        hunter.start_scheduler()
    elif args.report:
        opportunities = hunter.db.get_top_opportunities(args.limit or 10)
        print(f"\n🏆 TOP {len(opportunities)} OPPORTUNITÉS:")
        if opportunities:
            for i, opp in enumerate(opportunities, 1):
                print(f"{i:2d}. {opp['domain']:30s} | Score: {opp['score_global']:3d} | ROI: {opp['roi_projete']:6.1f}% | Rec: {opp['recommandation']}")
        else:
            print("Aucune opportunité trouvée avec les critères actuels.")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()


