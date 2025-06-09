#!/usr/bin/env python3
"""
Integrated RapidAPI Domain Scraper
Intègre le collecteur RapidAPI avec le système d'analyse existant
"""

import sys
import os
from typing import List, Dict
import logging
from datetime import datetime

# Import des modules existants
try:
    from rapidapi_domains_collector import RapidAPIDomainCollector
    from perplexity_analyzer import PerplexityDomainAnalyzer
except ImportError as e:
    print(f"❌ Erreur d'import: {e}")
    print("💡 Assurez-vous que tous les modules sont présents")
    sys.exit(1)

class IntegratedRapidAPIScraper:
    def __init__(self):
        """Initialise le scraper intégré RapidAPI"""
        self.rapidapi_collector = RapidAPIDomainCollector()
        self.perplexity_analyzer = PerplexityDomainAnalyzer()
        self.session_data = {
            'collected_domains': [],
            'analyzed_domains': [],
            'start_time': datetime.now(),
            'stats': {}
        }
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('rapidapi_integrated.log'),
                logging.StreamHandler()
            ]
        )
    
    def collect_rapidapi_domains(self, limit_per_source: int = 30) -> List[str]:
        """Collecte les domaines depuis RapidAPI"""
        logging.info("🚀 Début de collecte RapidAPI")
        
        # Collecte multi-sources
        results = self.rapidapi_collector.collect_all_rapidapi_sources(limit_per_source)
        
        # Récupération des domaines collectés
        domains = self.rapidapi_collector.get_collected_domains(limit=100)
        
        self.session_data['collected_domains'] = domains
        self.session_data['stats']['rapidapi_results'] = results
        
        logging.info(f"✅ {len(domains)} domaines RapidAPI collectés")
        return domains
    
    def analyze_rapidapi_domains(self, domains: List[str], batch_size: int = 10) -> List[Dict]:
        """Analyse les domaines RapidAPI avec Perplexity"""
        logging.info(f"🔍 Analyse de {len(domains)} domaines RapidAPI")
        
        analyzed_domains = []
        
        # Traitement par batch
        for i in range(0, len(domains), batch_size):
            batch = domains[i:i + batch_size]
            logging.info(f"📊 Traitement batch {i//batch_size + 1}: {len(batch)} domaines")
            
            for domain in batch:
                try:
                    # Analyse avec Perplexity
                    analysis = self.perplexity_analyzer.analyze_domain(domain)
                    
                    if analysis and analysis.get('score', 0) >= 6.0:
                        analyzed_domains.append({
                            'domain': domain,
                            'source': 'rapidapi',
                            'analysis': analysis,
                            'analyzed_at': datetime.now().isoformat()
                        })
                        logging.info(f"✅ {domain}: Score {analysis.get('score', 0):.1f}")
                    
                except Exception as e:
                    logging.error(f"❌ Erreur analyse {domain}: {e}")
            
            # Pause entre batches
            if i + batch_size < len(domains):
                logging.info("⏳ Pause entre batches...")
                import time
                time.sleep(2)
        
        self.session_data['analyzed_domains'] = analyzed_domains
        logging.info(f"🎯 {len(analyzed_domains)} domaines analysés avec succès")
        
        return analyzed_domains
    
    def generate_rapidapi_report(self, analyzed_domains: List[Dict]) -> str:
        """Génère un rapport des domaines RapidAPI"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"rapidapi_analysis_report_{timestamp}.html"
        
        # Tri par score
        sorted_domains = sorted(
            analyzed_domains, 
            key=lambda x: x['analysis'].get('score', 0), 
            reverse=True
        )
        
        # Génération HTML
        html_content = self._generate_rapidapi_html_report(sorted_domains)
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        logging.info(f"📄 Rapport généré: {report_file}")
        return report_file
    
    def _generate_rapidapi_html_report(self, domains: List[Dict]) -> str:
        """Génère le contenu HTML du rapport"""
        stats = self.session_data['stats']
        
        html = f"""
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport d'Analyse RapidAPI - Domain Hunter</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }}
        .header {{
            background: linear-gradient(135deg, #2C3E50 0%, #34495E 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }}
        .stats {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }}
        .stat-card {{
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }}
        .stat-number {{
            font-size: 2em;
            font-weight: bold;
            color: #3498db;
        }}
        .stat-label {{
            color: #7f8c8d;
            margin-top: 5px;
        }}
        .domains-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            padding: 30px;
        }}
        .domain-card {{
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            border-left: 5px solid #3498db;
            transition: transform 0.3s ease;
        }}
        .domain-card:hover {{
            transform: translateY(-5px);
        }}
        .domain-name {{
            font-size: 1.4em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }}
        .score {{
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            color: white;
            font-weight: bold;
            margin-bottom: 15px;
        }}
        .score-excellent {{ background: #27ae60; }}
        .score-good {{ background: #f39c12; }}
        .score-average {{ background: #e74c3c; }}
        .analysis-text {{
            color: #555;
            line-height: 1.6;
            font-size: 0.95em;
        }}
        .footer {{
            background: #34495e;
            color: white;
            padding: 20px;
            text-align: center;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌐 Rapport d'Analyse RapidAPI</h1>
            <p>Domain Hunter Dashboard - {datetime.now().strftime('%d/%m/%Y %H:%M')}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">{stats.get('rapidapi_results', {}).get('total_collected', 0)}</div>
                <div class="stat-label">Domaines Collectés</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{len(domains)}</div>
                <div class="stat-label">Domaines Analysés</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{stats.get('rapidapi_results', {}).get('expired_search', 0)}</div>
                <div class="stat-label">Recherche Expirés</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{stats.get('rapidapi_results', {}).get('auctions', 0)}</div>
                <div class="stat-label">Enchères</div>
            </div>
        </div>
        
        <div class="domains-grid">
"""
        
        # Ajout des domaines
        for domain_data in domains[:50]:  # Top 50
            domain = domain_data['domain']
            analysis = domain_data['analysis']
            score = analysis.get('score', 0)
            
            score_class = "score-excellent" if score >= 8 else "score-good" if score >= 6 else "score-average"
            
            html += f"""
            <div class="domain-card">
                <div class="domain-name">{domain}</div>
                <div class="score {score_class}">Score: {score:.1f}/10</div>
                <div class="analysis-text">
                    {analysis.get('analysis', 'Aucune analyse disponible')[:200]}...
                </div>
            </div>
"""
        
        html += """
        </div>
        
        <div class="footer">
            <p>🚀 Générée par Domain Hunter Dashboard avec RapidAPI</p>
        </div>
    </div>
</body>
</html>
"""
        
        return html
    
    def export_rapidapi_csv(self, analyzed_domains: List[Dict]) -> str:
        """Exporte les résultats en CSV"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        csv_file = f"rapidapi_analysis_{timestamp}.csv"
        
        import csv
        
        with open(csv_file, 'w', newline='', encoding='utf-8') as f:
            fieldnames = ['domain', 'score', 'source', 'analysis', 'analyzed_at']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            
            writer.writeheader()
            for domain_data in analyzed_domains:
                writer.writerow({
                    'domain': domain_data['domain'],
                    'score': domain_data['analysis'].get('score', 0),
                    'source': domain_data['source'],
                    'analysis': domain_data['analysis'].get('analysis', ''),
                    'analyzed_at': domain_data['analyzed_at']
                })
        
        logging.info(f"📊 Export CSV: {csv_file}")
        return csv_file
    
    def run_complete_rapidapi_analysis(self, 
                                     limit_per_source: int = 25,
                                     analysis_batch_size: int = 8) -> Dict:
        """Lance une analyse complète RapidAPI"""
        print("🚀 Lancement de l'analyse complète RapidAPI")
        print("=" * 60)
        
        try:
            # 1. Collecte RapidAPI
            print("\n📡 Étape 1: Collecte de domaines via RapidAPI")
            domains = self.collect_rapidapi_domains(limit_per_source)
            
            if not domains:
                print("❌ Aucun domaine collecté depuis RapidAPI")
                return {'success': False, 'error': 'No domains collected'}
            
            print(f"✅ {len(domains)} domaines collectés")
            
            # 2. Analyse Perplexity
            print("\n🧠 Étape 2: Analyse avec Perplexity AI")
            analyzed_domains = self.analyze_rapidapi_domains(domains, analysis_batch_size)
            
            if not analyzed_domains:
                print("❌ Aucun domaine analysé avec succès")
                return {'success': False, 'error': 'No domains analyzed'}
            
            print(f"✅ {len(analyzed_domains)} domaines analysés")
            
            # 3. Génération des rapports
            print("\n📄 Étape 3: Génération des rapports")
            html_report = self.generate_rapidapi_report(analyzed_domains)
            csv_export = self.export_rapidapi_csv(analyzed_domains)
            
            # 4. Résumé
            duration = datetime.now() - self.session_data['start_time']
            
            results = {
                'success': True,
                'collected_count': len(domains),
                'analyzed_count': len(analyzed_domains),
                'html_report': html_report,
                'csv_export': csv_export,
                'duration': str(duration),
                'top_domains': analyzed_domains[:10]
            }
            
            print("\n🎯 Analyse RapidAPI terminée avec succès !")
            print(f"📊 Domaines collectés: {results['collected_count']}")
            print(f"🧠 Domaines analysés: {results['analyzed_count']}")
            print(f"📄 Rapport HTML: {results['html_report']}")
            print(f"📁 Export CSV: {results['csv_export']}")
            print(f"⏱️ Durée: {results['duration']}")
            
            return results
            
        except Exception as e:
            logging.error(f"❌ Erreur dans l'analyse complète: {e}")
            return {'success': False, 'error': str(e)}

def main():
    """Fonction principale"""
    scraper = IntegratedRapidAPIScraper()
    
    print("🌐 Integrated RapidAPI Domain Scraper")
    print("=====================================")
    
    # Lancement de l'analyse complète
    results = scraper.run_complete_rapidapi_analysis(
        limit_per_source=20,  # 20 domaines par source RapidAPI
        analysis_batch_size=5  # 5 domaines par batch d'analyse
    )
    
    if results['success']:
        print("\n🎉 Mission accomplie ! Vos rapports sont prêts.")
        
        # Affichage du top 5
        if results.get('top_domains'):
            print("\n⭐ Top 5 domaines RapidAPI:")
            for i, domain_data in enumerate(results['top_domains'][:5], 1):
                domain = domain_data['domain']
                score = domain_data['analysis'].get('score', 0)
                print(f"  {i}. {domain} - Score: {score:.1f}/10")
    else:
        print(f"\n❌ Échec de l'analyse: {results.get('error')}")

if __name__ == "__main__":
    main()

