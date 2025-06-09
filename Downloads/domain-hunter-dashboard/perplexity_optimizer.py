
"""
Outils d'optimisation pour l'utilisation de l'API Perplexity
Ce module contient des stratégies avancées pour optimiser les coûts et performances
"""

import json
import time
import hashlib
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import sqlite3

@dataclass
class PromptTemplate:
    name: str
    template: str
    category: str
    estimated_tokens: int
    success_rate: float

class PerplexityOptimizer:
    def __init__(self):
        self.cache_db = 'prompt_cache.db'
        self.init_cache()
        self.usage_stats = {
            'total_requests': 0,
            'successful_requests': 0,
            'cached_responses': 0,
            'total_cost': 0.0
        }

        # Templates optimisés pour différents cas d'usage
        self.prompt_templates = {
            'domain_analysis_quick': PromptTemplate(
                name="Analyse Rapide",
                template="""Analysez {domain} rapidement:
                SEO (0-10): Backlinks et autorité
                Commercial (0-10): Potentiel monétisation
                Risques (0-10): Pénalités/problèmes
                Prix max recommandé (€): 
                ROI 12 mois (%):
                Recommandation: ACHETER/ÉVITER/SURVEILLER

                Format: JSON uniquement""",
                category="quick",
                estimated_tokens=150,
                success_rate=0.95
            ),

            'domain_analysis_detailed': PromptTemplate(
                name="Analyse Détaillée",
                template="""Analyse experte domaine expiré: {domain}

                SCORES (0-10):
                1. SEO: Historique, backlinks, DR/DA
                2. Commercial: Mots-clés, traffic potentiel, niches
                3. Concurrence: Saturation marché, opportunités
                4. Risques: Pénalités, contenu, légal

                FINANCIER:
                - Prix achat max (€)
                - Valeur revente estimée (€)  
                - ROI 12 mois (%)
                - Temps rentabilité (mois)

                STRATÉGIE:
                - Type contenu recommandé
                - Méthodes monétisation
                - Risques majeurs

                JSON: {{"seo":X,"commercial":X,"competition":X,"risk":X,"price":X,"resale":X,"roi":X,"recommendation":"XX"}}""",
                category="detailed",
                estimated_tokens=350,
                success_rate=0.85
            ),

            'market_analysis': PromptTemplate(
                name="Analyse Marché",
                template="""Analysez le marché pour le secteur du domaine {domain}:

                - Tendances actuelles secteur
                - Concurrence niveau (1-10)
                - Opportunités affiliation
                - Volume recherche estimé
                - CPC moyen
                - Saisonnalité

                Réponse concise, 3 phrases max par point.""",
                category="market",
                estimated_tokens=200,
                success_rate=0.90
            )
        }

    def init_cache(self):
        """Initialise le cache pour éviter les requêtes redondantes"""
        with sqlite3.connect(self.cache_db) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS prompt_cache (
                    id INTEGER PRIMARY KEY,
                    prompt_hash TEXT UNIQUE,
                    domain TEXT,
                    response TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    used_count INTEGER DEFAULT 1
                )
            """)
            conn.commit()

    def get_cached_response(self, prompt: str, domain: str) -> Optional[str]:
        """Récupère une réponse mise en cache"""
        prompt_hash = hashlib.md5(f"{prompt}:{domain}".encode()).hexdigest()

        with sqlite3.connect(self.cache_db) as conn:
            cursor = conn.execute(
                "SELECT response FROM prompt_cache WHERE prompt_hash = ? AND created_at > ?",
                (prompt_hash, datetime.now() - timedelta(days=7))  # Cache 7 jours
            )
            result = cursor.fetchone()

            if result:
                # Incrémenter le compteur d'utilisation
                conn.execute(
                    "UPDATE prompt_cache SET used_count = used_count + 1 WHERE prompt_hash = ?",
                    (prompt_hash,)
                )
                conn.commit()
                self.usage_stats['cached_responses'] += 1
                return result[0]

        return None

    def cache_response(self, prompt: str, domain: str, response: str):
        """Met en cache une réponse"""
        prompt_hash = hashlib.md5(f"{prompt}:{domain}".encode()).hexdigest()

        with sqlite3.connect(self.cache_db) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO prompt_cache (prompt_hash, domain, response)
                VALUES (?, ?, ?)
            """, (prompt_hash, domain, response))
            conn.commit()

    def optimize_batch_requests(self, domains: List[str], analysis_type: str = 'quick') -> List[Dict]:
        """Optimise les requêtes par lot"""
        template = self.prompt_templates.get(f'domain_analysis_{analysis_type}')
        if not template:
            raise ValueError(f"Template inconnu: {analysis_type}")

        results = []
        batch_size = 5  # Traitement par lots pour optimiser

        for i in range(0, len(domains), batch_size):
            batch = domains[i:i+batch_size]

            for domain in batch:
                # Vérifier le cache d'abord
                cached = self.get_cached_response(template.template, domain)
                if cached:
                    results.append({
                        'domain': domain,
                        'response': cached,
                        'cached': True,
                        'cost': 0
                    })
                else:
                    # Ajouter à la queue pour traitement API
                    results.append({
                        'domain': domain,
                        'response': None,
                        'cached': False,
                        'cost': self.estimate_cost(template.estimated_tokens)
                    })

            # Pause entre les lots pour respecter les limites
            if i + batch_size < len(domains):
                time.sleep(1)

        return results

    def estimate_cost(self, tokens: int) -> float:
        """Estime le coût d'une requête basé sur le nombre de tokens"""
        # Prix Perplexity (estimation): ~$0.001 per 1K tokens
        return (tokens / 1000) * 0.001

    def get_optimal_template(self, domain: str, budget_remaining: float) -> str:
        """Choisit le template optimal selon le budget"""
        if budget_remaining > 0.01:
            return 'detailed'
        elif budget_remaining > 0.005:
            return 'quick'
        else:
            # Budget très serré, analyse minimale
            return 'quick'

    def smart_prompt_selection(self, domain: str, context: Dict) -> str:
        """Sélectionne intelligemment le prompt selon le contexte"""
        # Facteurs de décision
        domain_length = len(domain)
        has_keywords = any(kw in domain.lower() for kw in ['tech', 'seo', 'marketing', 'blog'])
        high_potential = context.get('preliminary_score', 0) > 7

        if high_potential and domain_length < 20:
            return 'domain_analysis_detailed'
        elif has_keywords:
            return 'market_analysis'
        else:
            return 'domain_analysis_quick'

    def rate_limit_handler(self, requests_per_minute: int = 60):
        """Gestionnaire de limitation de taux"""
        delay = 60 / requests_per_minute
        time.sleep(delay)

    def generate_usage_report(self) -> Dict:
        """Génère un rapport d'utilisation"""
        success_rate = (self.usage_stats['successful_requests'] / 
                       max(self.usage_stats['total_requests'], 1)) * 100

        cache_efficiency = (self.usage_stats['cached_responses'] / 
                           max(self.usage_stats['total_requests'], 1)) * 100

        return {
            'total_requests': self.usage_stats['total_requests'],
            'success_rate': f"{success_rate:.1f}%",
            'cache_efficiency': f"{cache_efficiency:.1f}%",
            'total_cost': f"${self.usage_stats['total_cost']:.4f}",
            'cost_per_request': f"${self.usage_stats['total_cost'] / max(self.usage_stats['total_requests'], 1):.4f}"
        }

class PromptEngineering:
    """Techniques avancées de prompt engineering pour domaines"""

    @staticmethod
    def create_chain_of_thought_prompt(domain: str) -> str:
        """Utilise la technique Chain-of-Thought pour meilleure précision"""
        return f"""
        Analysons step-by-step le domaine expiré: {domain}

        Étape 1 - Analyse technique:
        - Vérifie l'historique Archive.org
        - Évalue les backlinks Ahrefs/Majestic
        - Examine métriques DR/DA/TF/CF

        Étape 2 - Analyse commerciale:
        - Identifie les mots-clés principaux
        - Estime le volume de recherche
        - Évalue le potentiel d'affiliation

        Étape 3 - Analyse concurrentielle:
        - Examine la saturation du marché
        - Identifie les opportunités uniques
        - Évalue les barrières à l'entrée

        Étape 4 - Évaluation financière:
        - Calcule le prix d'achat maximal
        - Estime le potentiel de revente
        - Projette le ROI sur 12 mois

        Conclusion avec scores et recommandation finale.
        """

    @staticmethod
    def create_role_playing_prompt(domain: str) -> str:
        """Utilise role-playing pour expertise spécialisée"""
        return f"""
        En tant qu'expert en domaines expirés avec 15 ans d'expérience et 
        plus de 10,000 domaines analysés, évaluez {domain}.

        Mon expertise couvre:
        - Identification domaines premium
        - Stratégies de relance réussies
        - Monétisation par affiliation
        - Évitement des pièges (pénalités, etc.)

        Mon objectif: Identifier uniquement les domaines avec ROI > 200% 
        dans les 12 mois.

        Analyse professionnelle requise.
        """

    @staticmethod
    def create_few_shot_prompt(domain: str) -> str:
        """Utilise des exemples pour guider l'analyse"""
        return f"""
        Voici comment analyser un domaine expiré. Exemples:

        Exemple 1: "tech-reviews-blog.com"
        - SEO: 8/10 (DR45, backlinks qualité)
        - Commercial: 9/10 (niche affiliate profitable)
        - Risque: 2/10 (historique propre)
        - Prix max: 500€, Revente: 2000€, ROI: 300%
        - Recommandation: ACHETER

        Exemple 2: "gambling-winner.net"  
        - SEO: 6/10 (DR25, liens moyens)
        - Commercial: 4/10 (secteur réglementé)
        - Risque: 8/10 (pénalités possibles)
        - Prix max: 100€, Revente: 200€, ROI: 50%
        - Recommandation: ÉVITER

        Maintenant analysez: {domain}
        Suivez le même format et raisonnement.
        """

# Créer un fichier de configuration JSON pour les stratégies
config_strategies = {
    "api_optimization": {
        "max_requests_per_minute": 60,
        "cache_duration_days": 7,
        "retry_attempts": 3,
        "timeout_seconds": 30,
        "batch_size": 5
    },
    "analysis_strategies": {
        "quick_analysis": {
            "use_cache": True,
            "template": "domain_analysis_quick",
            "max_cost_per_domain": 0.002
        },
        "detailed_analysis": {
            "use_cache": True,
            "template": "domain_analysis_detailed", 
            "max_cost_per_domain": 0.01
        },
        "market_focus": {
            "use_cache": True,
            "template": "market_analysis",
            "max_cost_per_domain": 0.005
        }
    },
    "filtering_criteria": {
        "minimum_scores": {
            "seo_score": 6,
            "commercial_score": 7,
            "global_score": 70
        },
        "financial_thresholds": {
            "max_acquisition_price": 1000,
            "min_projected_roi": 150,
            "max_payback_months": 18
        },
        "domain_criteria": {
            "max_length": 25,
            "allowed_tlds": [".com", ".net", ".org"],
            "blocked_keywords": ["adult", "gambling", "porn", "casino"],
            "preferred_keywords": ["tech", "seo", "marketing", "business", "digital"]
        }
    },
    "scheduling": {
        "primary_analysis": "08:00",
        "quick_check": "12:00", 
        "evening_review": "20:00",
        "weekend_deep_dive": "SAT 10:00"
    }
}

# Sauvegarder la configuration
with open('optimization_config.json', 'w', encoding='utf-8') as f:
    json.dump(config_strategies, f, indent=2, ensure_ascii=False)

print("✅ Outils d'optimisation créés:")
print("- optimization_config.json: Configuration des stratégies")
print("- PerplexityOptimizer: Cache intelligent et gestion des coûts")
print("- PromptEngineering: Techniques avancées de prompting")
print("- Gestion automatique des limites API")
print("- Templates optimisés pour différents budgets")
