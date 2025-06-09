#!/usr/bin/env python3
"""
Gestionnaire de Visualisations pour Domain Hunter Dashboard
Intègre toutes les visualisations de performance et analytics
"""

import os
import sys
import subprocess
import json
from datetime import datetime
from pathlib import Path

class VisualizationManager:
    def __init__(self):
        self.base_dir = Path(__file__).parent
        self.scripts_dir = self.base_dir / "visualizations" / "scripts"
        self.charts_dir = self.base_dir / "visualizations" / "charts"
        self.output_dir = self.base_dir / "visualizations" / "output"
        
        # Créer le répertoire de sortie s'il n'existe pas
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def generate_performance_charts(self, data=None):
        """
        Génère les graphiques de performance du système
        """
        try:
            print("🔄 Génération des graphiques de performance...")
            
            # Exécuter le script de graphiques de performance
            result = subprocess.run(
                [sys.executable, str(self.scripts_dir / "chart_script.py")],
                cwd=str(self.scripts_dir),
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                print("✅ Graphique de performance généré avec succès")
                # Déplacer le fichier vers le répertoire de sortie
                self._move_generated_file("performance_chart.png")
            else:
                print(f"❌ Erreur lors de la génération: {result.stderr}")
                
        except Exception as e:
            print(f"❌ Erreur: {str(e)}")
            
    def generate_monetization_charts(self, budget_data=None):
        """
        Génère les graphiques de stratégies de monétisation
        """
        try:
            print("🔄 Génération des graphiques de monétisation...")
            
            result = subprocess.run(
                [sys.executable, str(self.scripts_dir / "chart_script_1.py")],
                cwd=str(self.scripts_dir),
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                print("✅ Graphique de monétisation généré avec succès")
                self._move_generated_file("monetization_strategies_chart.png")
            else:
                print(f"❌ Erreur lors de la génération: {result.stderr}")
                
        except Exception as e:
            print(f"❌ Erreur: {str(e)}")
            
    def generate_radar_charts(self, domain_metrics=None):
        """
        Génère les graphiques radar pour l'analyse de domaines
        """
        try:
            print("🔄 Génération des graphiques radar...")
            
            result = subprocess.run(
                [sys.executable, str(self.scripts_dir / "chart_script_2.py")],
                cwd=str(self.scripts_dir),
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                print("✅ Graphique radar généré avec succès")
                self._move_generated_file("radar_chart.png")
            else:
                print(f"❌ Erreur lors de la génération: {result.stderr}")
                
        except Exception as e:
            print(f"❌ Erreur: {str(e)}")
            
    def generate_system_dashboard(self):
        """
        Génère le tableau de bord système complet
        """
        try:
            print("🔄 Génération du tableau de bord système...")
            
            result = subprocess.run(
                [sys.executable, str(self.scripts_dir / "script.py")],
                cwd=str(self.scripts_dir),
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                print("✅ Tableau de bord système généré avec succès")
                self._move_generated_file("system_metrics_dashboard.png")
            else:
                print(f"❌ Erreur lors de la génération: {result.stderr}")
                
        except Exception as e:
            print(f"❌ Erreur: {str(e)}")
            
    def _move_generated_file(self, filename):
        """
        Déplace un fichier généré vers le répertoire de sortie
        """
        source = self.scripts_dir / filename
        if source.exists():
            destination = self.output_dir / f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
            source.rename(destination)
            print(f"📁 Fichier sauvegardé: {destination.name}")
            
    def generate_all_charts(self):
        """
        Génère tous les graphiques disponibles
        """
        print("🚀 Génération complète des visualisations...")
        print("=" * 50)
        
        self.generate_performance_charts()
        self.generate_monetization_charts()
        self.generate_radar_charts()
        self.generate_system_dashboard()
        
        print("\n📊 Résumé des visualisations générées:")
        output_files = list(self.output_dir.glob("*.png"))
        for file in sorted(output_files):
            print(f"  📈 {file.name}")
            
        print(f"\n✅ {len(output_files)} visualisations générées dans {self.output_dir}")
        
    def create_html_report(self):
        """
        Crée un rapport HTML avec toutes les visualisations
        """
        html_content = f"""
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Domain Hunter Dashboard - Rapport Analytics</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }}
        .container {{ max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        h1 {{ color: #1FB8CD; text-align: center; margin-bottom: 30px; }}
        h2 {{ color: #333; border-bottom: 2px solid #1FB8CD; padding-bottom: 10px; }}
        .chart-section {{ margin: 30px 0; }}
        .chart-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 20px; }}
        .chart-item {{ background: #f9f9f9; padding: 15px; border-radius: 8px; text-align: center; }}
        .chart-item img {{ max-width: 100%; height: auto; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }}
        .timestamp {{ text-align: center; color: #666; font-size: 14px; margin-top: 20px; }}
        .metrics {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }}
        .metric-card {{ background: linear-gradient(135deg, #1FB8CD, #4ecdc4); color: white; padding: 20px; border-radius: 10px; text-align: center; }}
        .metric-value {{ font-size: 24px; font-weight: bold; }}
        .metric-label {{ font-size: 14px; opacity: 0.9; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Domain Hunter Dashboard - Analytics</h1>
        
        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value">3,600+</div>
                <div class="metric-label">Domaines Analysés/Mois</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">345%</div>
                <div class="metric-label">ROI Moyen</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">828</div>
                <div class="metric-label">Opportunités Détectées</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">€2.40</div>
                <div class="metric-label">Coût par Analyse</div>
            </div>
        </div>
        
        <div class="chart-section">
            <h2>📈 Graphiques de Performance</h2>
            <div class="chart-grid">
                <div class="chart-item">
                    <h3>Évolution Performance 12 Mois</h3>
                    <img src="charts/performance_chart.png" alt="Performance Chart">
                </div>
                <div class="chart-item">
                    <h3>Stratégies de Monétisation par Budget</h3>
                    <img src="charts/monetization_strategies_chart.png" alt="Monetization Chart">
                </div>
            </div>
        </div>
        
        <div class="chart-section">
            <h2>🎯 Analyse de Profil Domaine</h2>
            <div class="chart-grid">
                <div class="chart-item">
                    <h3>Profil Domaine Expiré Premium</h3>
                    <img src="charts/radar_chart.png" alt="Radar Chart">
                </div>
                <div class="chart-item">
                    <h3>Métriques Système Automatisé</h3>
                    <img src="charts/system_metrics_dashboard.png" alt="System Dashboard">
                </div>
            </div>
        </div>
        
        <div class="timestamp">
            Rapport généré le {datetime.now().strftime('%d/%m/%Y à %H:%M:%S')}
        </div>
    </div>
</body>
</html>
        """
        
        report_path = self.base_dir / "analytics_report.html"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
            
        print(f"📄 Rapport HTML créé: {report_path}")
        return report_path

def main():
    """
    Script principal pour la génération des visualisations
    """
    manager = VisualizationManager()
    
    print("🎨 Domain Hunter Dashboard - Gestionnaire de Visualisations")
    print("=" * 60)
    
    # Vérifier les dépendances
    try:
        import plotly
        import matplotlib
        print("✅ Dépendances visualisation disponibles")
    except ImportError as e:
        print(f"❌ Dépendance manquante: {e}")
        print("💡 Installez avec: pip install plotly matplotlib seaborn pandas")
        return
    
    # Générer toutes les visualisations
    manager.generate_all_charts()
    
    # Créer le rapport HTML
    html_report = manager.create_html_report()
    
    print(f"\n🎉 Génération terminée !")
    print(f"📊 Ouvrez {html_report} dans votre navigateur pour voir le rapport complet")

if __name__ == "__main__":
    main()

