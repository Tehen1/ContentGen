#!/usr/bin/env python3
"""
Scraper Intégré avec Vraies Données
Combine la collecte de vraies données avec l'analyse Perplexity optimisée
"""

import sys
import os
import json
import time
import logging
import csv
import sqlite3
from typing import List, Dict, Optional
from datetime import datetime
from real_data_api import RealDataAPI

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class IntegratedRealScraper:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.perplexity.ai/chat/completions"
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        self.data_collector = RealDataAPI()
        self.results_db = 'analyzed_real_domains.db'
        self.init_results_db()
        
    def init_results_db(self):
        """Initialise la base de données des résultats d'analyse"""
        with sqlite3.connect(self.results_db) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS analyzed_domains (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    domain TEXT UNIQUE,
                    seo_score INTEGER,
                    commercial_score INTEGER,
                    competition_score INTEGER,
                    risk_score INTEGER,
                    global_score REAL,
                    recommended_price REAL,
                    projected_roi REAL,
                    recommendation TEXT,
                    analysis_type TEXT,
                    collector_score REAL,
                    estimated_value REAL,
                    analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()
    
    def collect_fresh_data(self, limit: int = 30) -> List[str]:
        """Collecte de nouvelles données réelles"""
        logging.info(f"🔄 Collecte de {limit} nouveaux domaines...")
        
        # Collecte depuis les APIs
        results = self.data_collector.collect_all_sources(limit_per_source=limit//3)
        
        if results['total_collected'] > 0:
            # Récupération des domaines collectés
            domains = self.data_collector.get_collected_domains(limit)
            logging.info(f"✅ {len(domains)} domaines réels collectés")
            return domains
        else:
            logging.warning("⚠️ Aucune donnée collectée, utilisation de données existantes")
            return self.data_collector.get_collected_domains(limit)
    
    def get_domain_metadata(self, domain: str) -> Dict:
        """Récupère les métadonnées du domaine depuis le collecteur"""
        with sqlite3.connect(self.data_collector.db_path) as conn:
            cursor = conn.execute('''
                SELECT commercial_score, keyword_relevance, estimated_value, keywords
                FROM real_domains WHERE domain = ?
            ''', (domain,))
            
            result = cursor.fetchone()
            if result:
                return {
                    'collector_commercial_score': result[0],
                    'collector_keyword_relevance': result[1],
                    'collector_estimated_value': result[2],
                    'collector_keywords': result[3]
                }
        return {}
    
    def create_enhanced_prompt(self, domain: str, metadata: Dict) -> str:
        """Crée un prompt enrichi avec les métadonnées du collecteur"""
        keywords = metadata.get('collector_keywords', '')
        estimated_value = metadata.get('collector_estimated_value', 0)
        
        prompt = f"""Analysez le domaine expiré: {domain}

CONTEXTE ENRICHI:
- Mots-clés détectés: {keywords}
- Valeur estimée initiale: {estimated_value}€
- Secteur identifié: {"Tech/Business" if any(k in keywords for k in ['tech', 'business', 'ai']) else "Généraliste"}

ANALYSE EXPERTE REQUISE:

1. SEO (0-10):
   - Potentiel backlinks dans le secteur
   - Autorité de domaine projetée
   - Facilité de ranking

2. COMMERCIAL (0-10):
   - Monétisation par affiliation
   - Potentiel publicitaire
   - Valeur pour revendeurs

3. CONCURRENCE (0-10):
   - Saturation du marché
   - Opportunités de positionnement
   - Barrières à l'entrée

4. RISQUES (0-10):
   - Historique potentiel
   - Risques légaux/marque
   - Difficultés techniques

5. FINANCIER:
   - Prix d'acquisition max (€)
   - Potentiel revente (€)
   - ROI 12 mois (%)

Répondez UNIQUEMENT en JSON:
{{"seo_score":X,"commercial_score":X,"competition_score":X,"risk_score":X,"recommended_price":X,"resale_potential":X,"projected_roi":X,"recommendation":"ACHETER/ÉVITER/SURVEILLER"}}"""
        
        return prompt
    
    def analyze_real_domain(self, domain: str) -> Optional[Dict]:
        """Analyse un vrai domaine avec contexte enrichi"""
        try:
            # Récupération des métadonnées
            metadata = self.get_domain_metadata(domain)
            
            # Création du prompt enrichi
            prompt = self.create_enhanced_prompt(domain, metadata)
            
            payload = {
                "model": "llama-3.1-sonar-large-128k-online",
                "messages": [
                    {"role": "system", "content": "Tu es un expert en domaines expirés avec accès aux données de marché. Réponds UNIQUEMENT en JSON valide."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.1,
                "max_tokens": 600
            }
            
            logging.info(f"🔍 Analyse enrichie de {domain}")
            
            import requests
            response = requests.post(self.base_url, headers=self.headers, json=payload, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            # Parse de la réponse
            analysis = self._parse_enhanced_response(content, domain, metadata)
            
            if analysis:
                # Sauvegarde en base
                self._save_analysis(analysis)
                return analysis
            
        except Exception as e:
            logging.error(f"❌ Erreur analyse {domain}: {e}")
        
        return None
    
    def _parse_enhanced_response(self, content: str, domain: str, metadata: Dict) -> Optional[Dict]:
        """Parse enrichi avec métadonnées"""
        try:
            import re
            
            # Extraction JSON
            json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', content)
            
            if json_match:
                json_str = json_match.group(0)
                data = json.loads(json_str)
                
                # Construction du résultat enrichi
                analysis = {
                    'domain': domain,
                    'seo_score': int(data.get('seo_score', 0)),
                    'commercial_score': int(data.get('commercial_score', 0)),
                    'competition_score': int(data.get('competition_score', 0)),
                    'risk_score': int(data.get('risk_score', 0)),
                    'recommended_price': float(data.get('recommended_price', 0)),
                    'resale_potential': float(data.get('resale_potential', 0)),
                    'projected_roi': float(data.get('projected_roi', 0)),
                    'recommendation': str(data.get('recommendation', 'INCONNU')),
                    'analysis_type': 'enhanced_real_data',
                    'collector_score': metadata.get('collector_commercial_score', 0),
                    'estimated_value': metadata.get('collector_estimated_value', 0),
                    'timestamp': datetime.now().isoformat()
                }
                
                # Calcul du score global enrichi
                base_scores = [
                    analysis['seo_score'], 
                    analysis['commercial_score'],
                    analysis['competition_score'], 
                    (10 - analysis['risk_score'])
                ]
                
                # Bonus du collecteur
                collector_bonus = min(metadata.get('collector_commercial_score', 0) / 10, 1.0)
                
                analysis['global_score'] = (sum(base_scores) / len(base_scores)) + collector_bonus
                
                return analysis
            
        except json.JSONDecodeError as e:
            logging.error(f"❌ Erreur parsing JSON {domain}: {e}")
        
        return None
    
    def _save_analysis(self, analysis: Dict):
        """Sauvegarde l'analyse en base"""
        with sqlite3.connect(self.results_db) as conn:
            conn.execute('''
                INSERT OR REPLACE INTO analyzed_domains 
                (domain, seo_score, commercial_score, competition_score, risk_score,
                 global_score, recommended_price, projected_roi, recommendation,
                 analysis_type, collector_score, estimated_value)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                analysis['domain'], analysis['seo_score'], analysis['commercial_score'],
                analysis['competition_score'], analysis['risk_score'], analysis['global_score'],
                analysis['recommended_price'], analysis['projected_roi'], analysis['recommendation'],
                analysis['analysis_type'], analysis['collector_score'], analysis['estimated_value']
            ))
            conn.commit()
    
    def batch_analyze_real_domains(self, domains: List[str]) -> List[Dict]:
        """Analyse par lots des vrais domaines"""
        logging.info(f"🚀 Analyse par lots de {len(domains)} vrais domaines")
        
        results = []
        
        for i, domain in enumerate(domains, 1):
            logging.info(f"📊 ({i}/{len(domains)}) Analyse de {domain}")
            
            analysis = self.analyze_real_domain(domain)
            if analysis:
                results.append(analysis)
                
                # Log si c'est une opportunité
                if self._is_high_opportunity(analysis):
                    logging.info(f"⭐ OPPORTUNITÉ: {domain} - Score: {analysis['global_score']:.1f} - ROI: {analysis['projected_roi']:.1f}%")
            
            # Respect des limites API
            time.sleep(2)
        
        logging.info(f"✅ Analyse terminée: {len(results)} domaines analysés")
        return results
    
    def _is_high_opportunity(self, analysis: Dict) -> bool:
        """Détermine si c'est une opportunité de haute valeur"""
        return (
            analysis.get('global_score', 0) >= 7.5 and
            analysis.get('projected_roi', 0) >= 200 and
            'ACHETER' in analysis.get('recommendation', '').upper() and
            analysis.get('recommended_price', 0) <= 1000
        )
    
    def export_enhanced_results(self, filename: str = None) -> str:
        """Exporte les résultats enrichis"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"real_domain_analysis_{timestamp}.csv"
        
        with sqlite3.connect(self.results_db) as conn:
            cursor = conn.execute('''
                SELECT domain, global_score, seo_score, commercial_score, projected_roi,
                       recommended_price, recommendation, collector_score, estimated_value,
                       analyzed_at
                FROM analyzed_domains
                ORDER BY global_score DESC, projected_roi DESC
            ''')
            
            results = cursor.fetchall()
        
        if results:
            fieldnames = [
                'domain', 'global_score', 'seo_score', 'commercial_score', 
                'projected_roi', 'recommended_price', 'recommendation',
                'collector_score', 'estimated_value', 'analyzed_at'
            ]
            
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                
                for result in results:
                    writer.writerow(dict(zip(fieldnames, result)))
            
            logging.info(f"📊 {len(results)} analyses exportées vers {filename}")
            return filename
        
        return ""
    
    def get_top_opportunities(self, limit: int = 10) -> List[Dict]:
        """Récupère les meilleures opportunités"""
        with sqlite3.connect(self.results_db) as conn:
            cursor = conn.execute('''
                SELECT domain, global_score, projected_roi, recommended_price, recommendation
                FROM analyzed_domains
                WHERE global_score >= 7.0 AND recommendation LIKE '%ACHETER%'
                ORDER BY global_score DESC, projected_roi DESC
                LIMIT ?
            ''', (limit,))
            
            return [dict(zip(['domain', 'global_score', 'projected_roi', 'recommended_price', 'recommendation'], row)) 
                    for row in cursor.fetchall()]

def main():
    """Fonction principale"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Scraper Intégré avec Vraies Données")
    parser.add_argument("--collect", type=int, default=20, help="Nombre de domaines à collecter")
    parser.add_argument("--analyze", type=int, help="Nombre de domaines à analyser")
    parser.add_argument("--fresh", action='store_true', help="Collecter de nouvelles données")
    parser.add_argument("--report", action='store_true', help="Afficher le rapport des opportunités")
    
    args = parser.parse_args()
    
    # Configuration API
    PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY", "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")
    
    scraper = IntegratedRealScraper(PERPLEXITY_API_KEY)
    
    print("🌐 Scraper Intégré avec Vraies Données")
    print("=" * 50)
    
    if args.fresh or args.collect:
        # Collecte de nouvelles données
        domains = scraper.collect_fresh_data(args.collect)
        print(f"📋 {len(domains)} domaines réels collectés")
    else:
        # Utilisation des données existantes
        domains = scraper.data_collector.get_collected_domains(args.analyze or 15)
        print(f"📋 {len(domains)} domaines existants chargés")
    
    if args.analyze or not args.report:
        # Analyse des domaines
        analyze_count = args.analyze or min(len(domains), 10)
        selected_domains = domains[:analyze_count]
        
        results = scraper.batch_analyze_real_domains(selected_domains)
        
        # Filtrage des opportunités
        opportunities = [r for r in results if scraper._is_high_opportunity(r)]
        
        print(f"\n📊 Résultats d'analyse:")
        print(f"  • Domaines analysés: {len(results)}")
        print(f"  • Opportunités détectées: {len(opportunities)}")
        if results:
            print(f"  • Taux de réussite: {len(opportunities)/len(results)*100:.1f}%")
        
        # Export des résultats
        if results:
            csv_file = scraper.export_enhanced_results()
            print(f"💾 Résultats exportés: {csv_file}")
    
    if args.report:
        # Rapport des meilleures opportunités
        opportunities = scraper.get_top_opportunities(10)
        
        if opportunities:
            print(f"\n⭐ Top Opportunités Réelles:")
            for i, opp in enumerate(opportunities, 1):
                print(f"  {i:2d}. {opp['domain']:25s} | Score: {opp['global_score']:5.1f} | ROI: {opp['projected_roi']:6.1f}% | Prix: {opp['recommended_price']:7.0f}€")
        else:
            print("\n⚠️ Aucune opportunité trouvée. Lancez d'abord une analyse.")
    
    print("\n✅ Analyse de vraies données terminée !")

if __name__ == "__main__":
    main()
