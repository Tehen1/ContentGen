#!/usr/bin/env python3
"""
Scraper Optimisé avec PerplexityOptimizer
Utilise le système d'optimisation pour démarrer le processus de scrapping
"""

import sys
import os
import json
import time
import logging
from typing import List, Dict, Optional
from datetime import datetime
import random
import requests
import csv

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('optimized_scraper.log'),
        logging.StreamHandler()
    ]
)

class OptimizedDomainScraper:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.perplexity.ai/chat/completions"
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        self.usage_stats = {
            'total_requests': 0,
            'successful_requests': 0,
            'total_cost': 0.0
        }
        
    def get_sample_domains(self, limit: int = 20) -> List[str]:
        """Génère une liste de domaines d'exemple pour tester le scrapping"""
        domains = [
            'tech-marketing-blog.com',
            'digital-seo-tools.net',
            'affiliate-income-pro.org',
            'web-development-hub.com',
            'online-business-tips.net',
            'crypto-trading-guide.com',
            'ai-automation-tools.org',
            'social-media-growth.net',
            'e-commerce-solutions.com',
            'content-marketing-pro.org',
            'startup-funding-tips.com',
            'remote-work-tools.net',
            'digital-nomad-guide.org',
            'saas-tools-review.com',
            'marketing-automation.net'
        ]
        
        # Ajouter des domaines générés pour atteindre la limite
        prefixes = ['best', 'top', 'ultimate', 'pro', 'expert', 'smart']
        keywords = ['seo', 'marketing', 'business', 'tech', 'digital', 'online']
        suffixes = ['tools', 'tips', 'guide', 'hub', 'pro', 'master']
        
        while len(domains) < limit:
            domain = f"{random.choice(prefixes)}-{random.choice(keywords)}-{random.choice(suffixes)}.com"
            if domain not in domains:
                domains.append(domain)
        
        return domains[:limit]
    
    def create_optimized_prompt(self, domain: str, analysis_type: str = 'quick') -> str:
        """Crée un prompt optimisé selon le type d'analyse"""
        if analysis_type == 'quick':
            return f"""Analysez rapidement le domaine expiré: {domain}

Fournissez UNIQUEMENT un JSON avec:
- seo_score (0-10): Autorité et backlinks
- commercial_score (0-10): Potentiel monétisation
- risk_score (0-10): Pénalités/problèmes
- recommended_price (€): Prix d'achat max
- projected_roi (%): ROI 12 mois
- recommendation: ACHETER/ÉVITER/SURVEILLER

Format: {{"seo_score":X,"commercial_score":X,"risk_score":X,"recommended_price":X,"projected_roi":X,"recommendation":"XX"}}"""
        
        elif analysis_type == 'detailed':
            return f"""Analyse experte complète du domaine expiré: {domain}

ÉVALUATION DÉTAILLÉE:
1. SEO (0-10): Historique, DR/DA, backlinks qualité
2. Commercial (0-10): Mots-clés, trafic, niches
3. Concurrence (0-10): Saturation, opportunités
4. Risques (0-10): Pénalités, contenu, légal

FINANCIER:
- Prix d'acquisition max (€)
- Potentiel revente (€)
- ROI projeté 12 mois (%)

JSON: {{"seo_score":X,"commercial_score":X,"competition_score":X,"risk_score":X,"recommended_price":X,"resale_potential":X,"projected_roi":X,"recommendation":"XX"}}"""
        
        else:
            return self.create_optimized_prompt(domain, 'quick')
    
    def analyze_domain(self, domain: str, analysis_type: str = 'quick') -> Optional[Dict]:
        """Analyse un domaine avec l'API Perplexity optimisée"""
        try:
            prompt = self.create_optimized_prompt(domain, analysis_type)
            
            payload = {
                "model": "llama-3.1-sonar-large-128k-online",
                "messages": [
                    {"role": "system", "content": "Tu es un expert en domaines expirés. Réponds UNIQUEMENT en JSON valide."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2,
                "max_tokens": 500
            }
            
            logging.info(f"🔍 Analyse {analysis_type} de {domain}")
            
            response = requests.post(self.base_url, headers=self.headers, json=payload, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            self.usage_stats['total_requests'] += 1
            self.usage_stats['successful_requests'] += 1
            
            return self._parse_response(content, domain)
            
        except Exception as e:
            logging.error(f"❌ Erreur analyse {domain}: {e}")
            self.usage_stats['total_requests'] += 1
            return None
    
    def _parse_response(self, content: str, domain: str) -> Optional[Dict]:
        """Parse la réponse JSON de manière robuste"""
        try:
            import re
            
            # Extraction JSON robuste
            json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', content)
            
            if json_match:
                json_str = json_match.group(0)
                data = json.loads(json_str)
                
                # Normalisation
                result = {
                    'domain': domain,
                    'seo_score': int(data.get('seo_score', 0)),
                    'commercial_score': int(data.get('commercial_score', 0)),
                    'competition_score': int(data.get('competition_score', 0)),
                    'risk_score': int(data.get('risk_score', 0)),
                    'recommended_price': float(data.get('recommended_price', 0)),
                    'resale_potential': float(data.get('resale_potential', 0)),
                    'projected_roi': float(data.get('projected_roi', 0)),
                    'recommendation': str(data.get('recommendation', 'INCONNU')),
                    'timestamp': datetime.now().isoformat()
                }
                
                # Calcul score global
                scores = [result['seo_score'], result['commercial_score'], 
                         result['competition_score'], (10 - result['risk_score'])]
                result['global_score'] = sum(scores) / len(scores)
                
                return result
            else:
                logging.warning(f"Aucun JSON trouvé pour {domain}")
                return None
                
        except json.JSONDecodeError as e:
            logging.error(f"Erreur parsing JSON {domain}: {e}")
            return None
    
    def batch_analysis(self, domains: List[str], analysis_type: str = 'quick') -> List[Dict]:
        """Analyse par lots avec optimisation des limites"""
        logging.info(f"🚀 Début analyse par lots: {len(domains)} domaines")
        
        results = []
        batch_size = 5
        
        for i in range(0, len(domains), batch_size):
            batch = domains[i:i+batch_size]
            logging.info(f"📦 Lot {i//batch_size + 1}: {len(batch)} domaines")
            
            for domain in batch:
                result = self.analyze_domain(domain, analysis_type)
                if result:
                    results.append(result)
                    
                    if self._is_opportunity(result):
                        logging.info(f"⭐ Opportunité: {domain} (Score: {result['global_score']:.1f})")
                
                # Respect des limites API (1 req/sec)
                time.sleep(1)
            
            # Pause entre lots
            if i + batch_size < len(domains):
                logging.info("⏱️ Pause entre lots...")
                time.sleep(2)
        
        logging.info(f"✅ Analyse terminée: {len(results)} domaines")
        return results
    
    def _is_opportunity(self, analysis: Dict) -> bool:
        """Vérifie si c'est une opportunité intéressante"""
        return (
            analysis.get('global_score', 0) >= 7.0 and
            analysis.get('seo_score', 0) >= 6 and
            analysis.get('commercial_score', 0) >= 7 and
            'ACHETER' in analysis.get('recommendation', '').upper()
        )
    
    def save_results(self, results: List[Dict], filename: str = None) -> str:
        """Sauvegarde les résultats en CSV"""
        if not results:
            logging.warning("Aucun résultat à sauvegarder")
            return ""
        
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"optimized_scraping_{timestamp}.csv"
        
        fieldnames = [
            'domain', 'global_score', 'seo_score', 'commercial_score',
            'projected_roi', 'recommended_price', 'recommendation'
        ]
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for result in results:
                writer.writerow({
                    'domain': result['domain'],
                    'global_score': f"{result['global_score']:.1f}",
                    'seo_score': result['seo_score'],
                    'commercial_score': result['commercial_score'],
                    'projected_roi': f"{result['projected_roi']:.1f}%",
                    'recommended_price': f"{result['recommended_price']:.2f}€",
                    'recommendation': result['recommendation']
                })
        
        logging.info(f"📊 Résultats sauvegardés: {filename}")
        return filename
    
    def generate_report(self) -> Dict:
        """Génère un rapport de performance"""
        success_rate = (self.usage_stats['successful_requests'] / 
                       max(self.usage_stats['total_requests'], 1)) * 100
        
        return {
            'total_requests': self.usage_stats['total_requests'],
            'successful_requests': self.usage_stats['successful_requests'],
            'success_rate': f"{success_rate:.1f}%",
            'estimated_cost': f"${self.usage_stats['total_requests'] * 0.002:.4f}"
        }

def main():
    """Fonction principale"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Scraper Optimisé de Domaines")
    parser.add_argument("--domains", type=int, default=10, help="Nombre de domaines")
    parser.add_argument("--type", choices=['quick', 'detailed'], default='quick', help="Type d'analyse")
    parser.add_argument("--output", type=str, help="Fichier de sortie")
    
    args = parser.parse_args()
    
    # Configuration API
    PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY", "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")
    
    if not PERPLEXITY_API_KEY:
        logging.error("❌ Clé API manquante")
        return
    
    # Scraper optimisé
    scraper = OptimizedDomainScraper(PERPLEXITY_API_KEY)
    
    print("🎯 Scraper Optimisé de Domaines")
    print("=" * 40)
    
    # Génération des domaines
    domains = scraper.get_sample_domains(args.domains)
    print(f"📋 {len(domains)} domaines générés")
    
    # Analyse par lots
    results = scraper.batch_analysis(domains, args.type)
    
    # Filtrage opportunités
    opportunities = [r for r in results if scraper._is_opportunity(r)]
    
    print(f"\n📊 Résultats:")
    print(f"  • Analysés: {len(results)}")
    print(f"  • Opportunités: {len(opportunities)}")
    if results:
        print(f"  • Taux succès: {len(opportunities)/len(results)*100:.1f}%")
    
    # Top opportunités
    if opportunities:
        print(f"\n⭐ Top Opportunités:")
        sorted_opps = sorted(opportunities, key=lambda x: x['global_score'], reverse=True)[:5]
        for i, opp in enumerate(sorted_opps, 1):
            print(f"  {i}. {opp['domain']:30s} | Score: {opp['global_score']:5.1f} | ROI: {opp['projected_roi']:6.1f}%")
    
    # Sauvegarde
    if results:
        filename = scraper.save_results(results, args.output)
        print(f"\n💾 Fichier: {filename}")
    
    # Rapport
    report = scraper.generate_report()
    print(f"\n📈 Performance:")
    for key, value in report.items():
        print(f"  • {key.replace('_', ' ').title()}: {value}")
    
    print("\n✅ Scraping terminé !")

if __name__ == "__main__":
    main()
