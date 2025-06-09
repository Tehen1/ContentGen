import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from matplotlib.patches import FancyBboxPatch
import warnings
warnings.filterwarnings('ignore')

# Set style for better visuals
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

# Create comprehensive data for the domain analysis system performance metrics
np.random.seed(42)

# 1. API Rate Limits and Usage Optimization Chart
fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
fig.suptitle("Système Automatisé de Recherche de Domaines Expirés - Métriques Clés", fontsize=16, fontweight='bold')

# Rate Limits by Tier
tiers = ['Tier 0', 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5']
rate_limits = [50, 50, 50, 500, 1000, 2000]
colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']

bars1 = ax1.bar(tiers, rate_limits, color=colors, alpha=0.8, edgecolor='black', linewidth=1.2)
ax1.set_title('Limites de Taux API Perplexity par Niveau', fontweight='bold', fontsize=12)
ax1.set_ylabel('Requêtes par Minute (RPM)', fontweight='bold')
ax1.set_xlabel('Niveau d\'Utilisation', fontweight='bold')
ax1.grid(True, alpha=0.3)

# Add value labels on bars
for bar, value in zip(bars1, rate_limits):
    height = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2., height + 20,
             f'{value}', ha='center', va='bottom', fontweight='bold')

# 2. Cost Optimization by Analysis Type
analysis_types = ['Analyse Rapide\n(~150 tokens)', 'Analyse Détaillée\n(~350 tokens)', 'Analyse Premium\n(~500 tokens)']
token_costs = [150, 350, 500]
cost_per_1000 = [0.002, 0.002, 0.002]  # Cost per 1000 tokens
daily_analyses = [200, 50, 20]
daily_costs = [tokens * analyses * cost / 1000 for tokens, analyses, cost in zip(token_costs, daily_analyses, cost_per_1000)]

bars2 = ax2.bar(analysis_types, daily_costs, color=['#a8e6cf', '#dda0dd', '#ffb3ba'], alpha=0.8, edgecolor='black')
ax2.set_title('Coûts Quotidiens par Type d\'Analyse', fontweight='bold', fontsize=12)
ax2.set_ylabel('Coût Quotidien (€)', fontweight='bold')
ax2.tick_params(axis='x', rotation=15)
ax2.grid(True, alpha=0.3)

# Add cost labels
for bar, cost in zip(bars2, daily_costs):
    height = bar.get_height()
    ax2.text(bar.get_x() + bar.get_width()/2., height + 0.002,
             f'{cost:.3f}€', ha='center', va='bottom', fontweight='bold')

# 3. Domain Analysis Performance Metrics
metrics = ['Taux de\nDécouverte', 'ROI Moyen', 'Précision des\nPrédictions', 'Coût par\nOpportunité']
current_values = [12.5, 280, 82, 0.048]
target_values = [15, 250, 85, 0.05]

x = np.arange(len(metrics))
width = 0.35

bars3_current = ax3.bar(x - width/2, current_values, width, label='Performance Actuelle', 
                       color='#74b9ff', alpha=0.8, edgecolor='black')
bars3_target = ax3.bar(x + width/2, target_values, width, label='Objectif Cible', 
                      color='#fd79a8', alpha=0.8, edgecolor='black')

ax3.set_title('KPIs de Performance du Système', fontweight='bold', fontsize=12)
ax3.set_ylabel('Valeur (%/€)', fontweight='bold')
ax3.set_xticks(x)
ax3.set_xticklabels(metrics)
ax3.legend()
ax3.grid(True, alpha=0.3)

# Add value labels
for bars in [bars3_current, bars3_target]:
    for bar in bars:
        height = bar.get_height()
        ax3.text(bar.get_x() + bar.get_width()/2., height + 1,
                f'{height:.1f}', ha='center', va='bottom', fontweight='bold', fontsize=9)

# 4. ROI by Investment Strategy
strategies = ['Affiliation\nE-commerce', 'Vente de\nLiens', 'Revente\nDirecte', 'Développement\nDApps']
roi_ranges = [(200, 400), (300, 600), (200, 300), (150, 500)]
setup_time = [3, 1, 6, 12]  # weeks

# Create scatter plot for ROI vs Setup Time
for i, (strategy, (roi_min, roi_max), time) in enumerate(zip(strategies, roi_ranges, setup_time)):
    roi_avg = (roi_min + roi_max) / 2
    roi_std = (roi_max - roi_min) / 4
    ax4.scatter(time, roi_avg, s=300, alpha=0.7, c=colors[i], edgecolor='black', linewidth=2)
    ax4.errorbar(time, roi_avg, yerr=roi_std, capsize=5, capthick=2, color=colors[i])
    ax4.annotate(strategy, (time, roi_avg), xytext=(5, 5), textcoords='offset points', 
                fontsize=9, fontweight='bold')

ax4.set_title('ROI vs Temps de Configuration par Stratégie', fontweight='bold', fontsize=12)
ax4.set_xlabel('Temps de Configuration (semaines)', fontweight='bold')
ax4.set_ylabel('ROI Moyen (%)', fontweight='bold')
ax4.grid(True, alpha=0.3)
ax4.set_xlim(0, 14)
ax4.set_ylim(100, 600)

plt.tight_layout()
plt.savefig('system_metrics_dashboard.png', dpi=300, bbox_inches='tight', facecolor='white')
plt.show()

print("Graphique 1 : Dashboard des métriques système créé avec succès")