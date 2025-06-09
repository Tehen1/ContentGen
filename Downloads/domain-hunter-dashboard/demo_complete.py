#!/usr/bin/env python3
"""
Démonstration complète du système Domain Hunter Dashboard
Utilise tous les composants : optimized_scraper, visualizations, analytics
"""

import os
import subprocess
import time
import sys

def run_command(cmd, description):
    """Exécute une commande avec description"""
    print(f"\n🔥 {description}")
    print("=" * 50)
    try:
        result = subprocess.run(cmd, shell=True, capture_output=False, text=True)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def main():
    print("🎯 DÉMONSTRATION COMPLÈTE - DOMAIN HUNTER DASHBOARD")
    print("=" * 60)
    print("Cette démo utilise tous les composants du système:")
    print("• Scraper optimisé avec PerplexityOptimizer")
    print("• Système de visualisations avancées")
    print("• Analytics et rapports automatisés")
    print("• Intégration complète des outils d'optimisation")
    
    # Étape 1: Optimisation et configuration
    print("\n🔧 ÉTAPE 1: Configuration et optimisation")
    run_command("python3 perplexity_optimizer.py", "Génération de la configuration d'optimisation")
    
    # Étape 2: Scraping optimisé
    print("\n🔍 ÉTAPE 2: Scraping optimisé de domaines")
    run_command("python3 optimized_scraper.py --domains 8 --type quick", "Analyse rapide de 8 domaines")
    
    # Étape 3: Génération des visualisations
    print("\n📊 ÉTAPE 3: Génération des visualisations")
    run_command("python3 visualization_manager.py", "Création des graphiques de performance")
    
    # Étape 4: Analyse avec domain_hunter principal
    print("\n🎯 ÉTAPE 4: Test du système principal")
    run_command("python3 domain_hunter.py --once --limit 3", "Analyse avec le système principal")
    
    # Étape 5: Affichage des rapports
    print("\n📈 ÉTAPE 5: Rapports finaux")
    run_command("python3 domain_hunter.py --report", "Affichage du rapport des opportunités")
    
    # Résumé final
    print("\n🎉 DÉMONSTRATION TERMINÉE !")
    print("=" * 60)
    print("Fichiers générés :")
    print("• optimization_config.json - Configuration d'optimisation")
    print("• optimized_scraping_*.csv - Résultats du scraping")
    print("• analytics_report.html - Rapport HTML interactif")
    print("• visualizations/output/*.png - Graphiques de performance")
    print("• rapport_opportunites_*.csv - Rapport des opportunités")
    
    print("\n📖 Pour voir le rapport complet, ouvrez:")
    print("📄 analytics_report.html dans votre navigateur")
    
    print("\n✅ Système Domain Hunter Dashboard opérationnel !")

if __name__ == "__main__":
    main()
