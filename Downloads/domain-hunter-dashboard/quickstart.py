#!/usr/bin/env python3
"""
Domain Hunter Pro - Script de démarrage rapide
Ce script simplifié permet de tester rapidement le système d'analyse de domaines
"""

import json
import requests
import time
from datetime import datetime

# Configuration de base
API_KEY = "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"
API_URL = "https://api.perplexity.ai/chat/completions"
MODEL = "llama-3.1-sonar-large-128k-online"

def analyze_domain(domain):
    """Analyse un domaine avec l'API Perplexity"""
    print(f"🔍 Analyse de {domain}...")
    
    prompt = f"""
    En tant qu'expert SEO et domaines expirés, analysez le domaine: {domain}
    
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
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "Tu es un expert en domaines expirés et SEO avec 10 ans d'expérience."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3
    }
    
    try:
        # Requête à l'API
        response = requests.post(API_URL, headers=headers, json=payload)
        response.raise_for_status()
        
        # Extraction du contenu
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        # Extraction du JSON
        start_idx = content.find('{')
        end_idx = content.rfind('}') + 1
        if start_idx != -1 and end_idx != -1:
            json_str = content[start_idx:end_idx]
            try:
                analysis_data = json.loads(json_str)
                
                # Affichage du résultat
                print("\n" + "="*50)
                print(f"✅ ANALYSE COMPLÈTE: {domain}")
                print("="*50)
                print(f"Score SEO:          {analysis_data.get('seo_score', 0)}/10")
                print(f"Score Commercial:   {analysis_data.get('commercial_score', 0)}/10")
                print(f"Score Concurrence:  {analysis_data.get('competition_score', 0)}/10")
                print(f"Score Risque:       {analysis_data.get('risk_score', 0)}/10")
                print("-"*50)
                print(f"SCORE GLOBAL:       {analysis_data.get('global_score', 0)}/100")
                print("-"*50)
                print(f"Prix recommandé:    {analysis_data.get('recommended_price', 0)}€")
                print(f"Potentiel revente:  {analysis_data.get('resale_potential', 0)}€")
                print(f"ROI projeté:        {analysis_data.get('projected_roi', 0)}%")
                print("-"*50)
                print(f"RECOMMANDATION:     {analysis_data.get('recommendation', 'INCONNU')}")
                print("="*50)
                
                # Sauvegarde dans un fichier JSON
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"analyse_{domain.replace('.', '_')}_{timestamp}.json"
                
                with open(filename, 'w', encoding='utf-8') as f:
                    json.dump(analysis_data, f, indent=2, ensure_ascii=False)
                
                print(f"\n📄 Analyse sauvegardée dans {filename}")
                
                return analysis_data
                
            except json.JSONDecodeError:
                print(f"❌ Erreur: Impossible de parser le JSON dans la réponse")
                print(f"Réponse brute: {content}")
        else:
            print(f"❌ Erreur: Aucun JSON trouvé dans la réponse")
            print(f"Réponse brute: {content}")
    
    except requests.RequestException as e:
        print(f"❌ Erreur API: {e}")
    
    return None

def main():
    print("="*70)
    print("🚀 DOMAIN HUNTER PRO - DÉMARRAGE RAPIDE")
    print("="*70)
    print("Ce script analyse rapidement un domaine avec l'API Perplexity")
    print("Utilisez cette version simplifiée pour tester le système")
    print("-"*70)
    
    while True:
        # Input du domaine
        domain = input("\n📝 Entrez un nom de domaine à analyser (ou 'q' pour quitter): ")
        
        if domain.lower() == 'q':
            print("\n👋 Merci d'avoir utilisé Domain Hunter Pro! Au revoir.")
            break
        
        if not domain or "." not in domain:
            print("❌ Domaine invalide. Veuillez entrer un nom de domaine valide.")
            continue
        
        # Analyse du domaine
        start_time = time.time()
        analysis = analyze_domain(domain)
        end_time = time.time()
        
        if analysis:
            print(f"\n⏱️  Analyse effectuée en {end_time - start_time:.2f} secondes")
            
            # Recommandation personnalisée
            if analysis.get('global_score', 0) >= 80:
                print("\n💎 OPPORTUNITÉ EXCEPTIONNELLE! Achat recommandé rapidement.")
            elif analysis.get('global_score', 0) >= 70:
                print("\n✨ Bonne opportunité. À considérer sérieusement.")
            elif analysis.get('global_score', 0) >= 60:
                print("\n🔍 Opportunité moyenne. À surveiller si le prix est bas.")
            else:
                print("\n⛔ Faible potentiel. Mieux vaut chercher ailleurs.")
        
        print("\n" + "-"*70)

if __name__ == "__main__":
    main()

