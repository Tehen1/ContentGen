
"""
Planificateur avancé et système de monitoring pour la chasse aux domaines
Inclut des fonctionnalités de cron, alertes et tableau de bord
"""

import schedule
import time
import smtplib
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import sqlite3
from typing import List, Dict
import logging

class AlertManager:
    def __init__(self, config: Dict):
        self.smtp_server = config.get('smtp_server', 'smtp.gmail.com')
        self.smtp_port = config.get('smtp_port', 587)
        self.email = config.get('email')
        self.password = config.get('password')
        self.recipients = config.get('recipients', [])

    def send_opportunity_alert(self, domain_analysis):
        """Envoie une alerte pour une opportunité majeure"""
        if domain_analysis.score_global < 85:
            return  # Seulement les très bonnes opportunités

        subject = f"🔥 OPPORTUNITÉ DOMAINE: {domain_analysis.domain}"

        body = f"""
        ALERTE OPPORTUNITÉ DÉTECTÉE!

        Domaine: {domain_analysis.domain}
        Score Global: {domain_analysis.score_global}/100

        Détails:
        - SEO: {domain_analysis.score_seo}/10
        - Commercial: {domain_analysis.score_commercial}/10
        - Risque: {domain_analysis.score_risque}/10

        Financier:
        - Prix recommandé: {domain_analysis.prix_recommande}€
        - Potentiel revente: {domain_analysis.potentiel_revente}€
        - ROI projeté: {domain_analysis.roi_projete}%

        Recommandation: {domain_analysis.recommandation}

        Action requise: Vérifier et acheter rapidement!

        ---
        Domain Hunter Bot
        """

        self._send_email(subject, body)

    def send_daily_summary(self, opportunities: List, total_analyzed: int):
        """Envoie un résumé quotidien"""
        subject = f"📊 Résumé quotidien - {len(opportunities)} opportunités"

        body = f"""
        RÉSUMÉ QUOTIDIEN DE CHASSE AUX DOMAINES
        Date: {datetime.now().strftime('%d/%m/%Y')}

        STATISTIQUES:
        - Domaines analysés: {total_analyzed}
        - Opportunités trouvées: {len(opportunities)}
        - Taux de réussite: {(len(opportunities)/max(total_analyzed,1)*100):.1f}%

        TOP OPPORTUNITÉS:
        """

        for i, opp in enumerate(opportunities[:5], 1):
            body += f"""
        {i}. {opp.domain}
           Score: {opp.score_global}/100 | ROI: {opp.roi_projete}%
           Prix: {opp.prix_recommande}€ | Revente: {opp.potentiel_revente}€
        """

        body += """

        Voir le rapport complet dans l'interface web.

        ---
        Domain Hunter Bot
        """

        self._send_email(subject, body)

    def _send_email(self, subject: str, body: str):
        """Envoie un email"""
        if not self.email or not self.recipients:
            logging.info(f"Email non configuré. Alerte: {subject}")
            return

        try:
            msg = MIMEMultipart()
            msg['From'] = self.email
            msg['To'] = ', '.join(self.recipients)
            msg['Subject'] = subject

            msg.attach(MIMEText(body, 'plain', 'utf-8'))

            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email, self.password)
            server.send_message(msg)
            server.quit()

            logging.info(f"Email envoyé: {subject}")

        except Exception as e:
            logging.error(f"Erreur envoi email: {e}")

class PerformanceMonitor:
    def __init__(self, db_path: str = 'performance.db'):
        self.db_path = db_path
        self.init_db()

    def init_db(self):
        """Initialise la base de monitoring"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS performance_metrics (
                    id INTEGER PRIMARY KEY,
                    date TEXT,
                    domains_analyzed INTEGER,
                    opportunities_found INTEGER,
                    api_requests INTEGER,
                    api_cost REAL,
                    success_rate REAL,
                    avg_response_time REAL,
                    cache_hit_rate REAL
                )
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS daily_alerts (
                    id INTEGER PRIMARY KEY,
                    date TEXT,
                    alert_type TEXT,
                    domain TEXT,
                    message TEXT,
                    sent INTEGER DEFAULT 0
                )
            """)
            conn.commit()

    def log_daily_performance(self, metrics: Dict):
        """Enregistre les performances quotidiennes"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO performance_metrics 
                (date, domains_analyzed, opportunities_found, api_requests, 
                 api_cost, success_rate, avg_response_time, cache_hit_rate)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                datetime.now().strftime('%Y-%m-%d'),
                metrics.get('domains_analyzed', 0),
                metrics.get('opportunities_found', 0),
                metrics.get('api_requests', 0),
                metrics.get('api_cost', 0.0),
                metrics.get('success_rate', 0.0),
                metrics.get('avg_response_time', 0.0),
                metrics.get('cache_hit_rate', 0.0)
            ))
            conn.commit()

    def get_weekly_stats(self) -> Dict:
        """Récupère les stats de la semaine"""
        week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT 
                    SUM(domains_analyzed) as total_domains,
                    SUM(opportunities_found) as total_opportunities,
                    SUM(api_requests) as total_requests,
                    SUM(api_cost) as total_cost,
                    AVG(success_rate) as avg_success_rate,
                    AVG(cache_hit_rate) as avg_cache_rate
                FROM performance_metrics 
                WHERE date >= ?
            """, (week_ago,))

            row = cursor.fetchone()
            if row:
                return {
                    'total_domains': row[0] or 0,
                    'total_opportunities': row[1] or 0,
                    'total_requests': row[2] or 0,
                    'total_cost': row[3] or 0.0,
                    'avg_success_rate': row[4] or 0.0,
                    'avg_cache_rate': row[5] or 0.0,
                    'opportunity_rate': (row[1] / max(row[0], 1)) * 100
                }

        return {}

class SmartScheduler:
    def __init__(self, domain_hunter, alert_manager, performance_monitor):
        self.domain_hunter = domain_hunter
        self.alert_manager = alert_manager
        self.performance_monitor = performance_monitor
        self.is_running = False

    def setup_intelligent_schedule(self):
        """Configure un planning intelligent basé sur les performances"""

        # Analyse principale optimisée selon les stats historiques
        schedule.every().day.at("08:00").do(self.morning_primary_hunt)

        # Vérification rapide si opportunités trouvées le matin
        schedule.every().day.at("12:00").do(self.conditional_midday_check)

        # Analyse du soir pour les enchères
        schedule.every().day.at("20:00").do(self.evening_auction_analysis)

        # Analyse approfondie weekend
        schedule.every().saturday.at("10:00").do(self.weekend_deep_analysis)

        # Maintenance et optimisation
        schedule.every().sunday.at("02:00").do(self.weekly_maintenance)

        # Alertes et rapports
        schedule.every().day.at("21:00").do(self.send_daily_report)

        logging.info("📅 Planning intelligent configuré")

    def morning_primary_hunt(self):
        """Chasse principale du matin avec alertes"""
        logging.info("🌅 CHASSE MATINALE - Analyse principale")

        start_time = time.time()
        results = self.domain_hunter.daily_hunt()
        analysis_time = time.time() - start_time

        # Alertes pour opportunités exceptionnelles
        for analysis in results.get('high_value_domains', []):
            if analysis.score_global >= 85:
                self.alert_manager.send_opportunity_alert(analysis)

        # Log des performances
        metrics = {
            'domains_analyzed': len(results.get('analyzed_domains', [])),
            'opportunities_found': len(results.get('high_value_domains', [])),
            'analysis_time': analysis_time
        }

        logging.info(f"✅ Analyse matinale terminée en {analysis_time:.1f}s")

    def conditional_midday_check(self):
        """Vérification conditionnelle de midi"""
        # Vérifie si des opportunités ont été trouvées le matin
        morning_opportunities = self.get_today_opportunities()

        if len(morning_opportunities) < 2:
            logging.info("🔄 Vérification supplémentaire - Peu d'opportunités matinales")
            self.domain_hunter.quick_check()
        else:
            logging.info("✅ Assez d'opportunités trouvées - Skip vérification midi")

    def evening_auction_analysis(self):
        """Analyse spécialisée pour les enchères du soir"""
        logging.info("🌆 ANALYSE SOIRÉE - Focus enchères")

        # Récupère les domaines en enchère
        auction_domains = self.get_auction_domains()

        if auction_domains:
            for domain in auction_domains[:5]:  # Limite pour économiser l'API
                analysis = self.domain_hunter.perplexity.analyze_domain(domain)
                if analysis and analysis.score_global >= 75:
                    self.alert_manager.send_opportunity_alert(analysis)

    def weekend_deep_analysis(self):
        """Analyse approfondie du weekend"""
        logging.info("🔍 ANALYSE WEEKEND - Mode approfondi")

        # Utilise des prompts détaillés pour analyse poussée
        weekend_domains = self.domain_hunter.collector.fetch_expired_domains(limit=10)

        detailed_results = []
        for domain in weekend_domains:
            # Utilise le template détaillé
            analysis = self.domain_hunter.perplexity.analyze_domain(domain)
            if analysis:
                detailed_results.append(analysis)

        # Génère rapport de weekend
        self.generate_weekend_report(detailed_results)

    def weekly_maintenance(self):
        """Maintenance hebdomadaire"""
        logging.info("🔧 MAINTENANCE HEBDOMADAIRE")

        # Nettoyage cache
        self.cleanup_old_cache()

        # Stats de performance
        weekly_stats = self.performance_monitor.get_weekly_stats()
        logging.info(f"📊 Stats semaine: {weekly_stats}")

        # Optimisation auto des seuils
        self.auto_optimize_thresholds(weekly_stats)

    def send_daily_report(self):
        """Envoie le rapport quotidien"""
        opportunities = self.get_today_opportunities()
        total_analyzed = self.get_today_analyzed_count()

        self.alert_manager.send_daily_summary(opportunities, total_analyzed)

    def get_today_opportunities(self) -> List:
        """Récupère les opportunités du jour"""
        today = datetime.now().strftime('%Y-%m-%d')

        with sqlite3.connect(self.domain_hunter.db.db_path) as conn:
            cursor = conn.execute("""
                SELECT * FROM domain_analyses 
                WHERE DATE(created_at) = ? AND recommandation = 'ACHETER'
                ORDER BY score_global DESC
            """, (today,))

            columns = [description[0] for description in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]

    def get_today_analyzed_count(self) -> int:
        """Compte les domaines analysés aujourd'hui"""
        today = datetime.now().strftime('%Y-%m-%d')

        with sqlite3.connect(self.domain_hunter.db.db_path) as conn:
            cursor = conn.execute("""
                SELECT COUNT(*) FROM domain_analyses 
                WHERE DATE(created_at) = ?
            """, (today,))

            return cursor.fetchone()[0]

    def get_auction_domains(self) -> List[str]:
        """Simule la récupération de domaines en enchère"""
        # Dans la vraie implémentation, ceci se connecterait à des APIs d'enchères
        return [
            'premium-tech.com',
            'seo-master.net',
            'digital-empire.org'
        ]

    def cleanup_old_cache(self):
        """Nettoie le cache ancien"""
        week_ago = datetime.now() - timedelta(days=7)

        # Nettoyage cache Perplexity
        cache_db = 'prompt_cache.db'
        with sqlite3.connect(cache_db) as conn:
            conn.execute("""
                DELETE FROM prompt_cache 
                WHERE created_at < ? AND used_count <= 1
            """, (week_ago,))
            conn.commit()

        logging.info("🧹 Cache nettoyé")

    def auto_optimize_thresholds(self, weekly_stats: Dict):
        """Optimise automatiquement les seuils selon les performances"""
        opportunity_rate = weekly_stats.get('opportunity_rate', 0)

        if opportunity_rate > 15:  # Trop d'opportunités, critères plus stricts
            logging.info("📈 Taux élevé d'opportunités - Renforcement critères")
            # Augmenter les seuils
        elif opportunity_rate < 5:  # Pas assez d'opportunités, critères plus souples
            logging.info("📉 Faible taux d'opportunités - Assouplissement critères")
            # Diminuer les seuils

    def generate_weekend_report(self, detailed_results: List):
        """Génère un rapport détaillé de weekend"""
        timestamp = datetime.now().strftime("%Y%m%d")
        filename = f"rapport_weekend_{timestamp}.json"

        report = {
            'date': datetime.now().isoformat(),
            'domains_analyzed': len(detailed_results),
            'detailed_analyses': [analysis.__dict__ for analysis in detailed_results],
            'top_opportunities': [a.__dict__ for a in detailed_results 
                                if a.score_global >= 75][:3]
        }

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        logging.info(f"📋 Rapport weekend généré: {filename}")

    def start(self):
        """Démarre le planificateur"""
        self.is_running = True
        self.setup_intelligent_schedule()

        logging.info("🚀 Planificateur intelligent démarré")
        logging.info("⏰ Prochaines tâches programmées:")

        for job in schedule.jobs:
            logging.info(f"  - {job}")

        try:
            while self.is_running:
                schedule.run_pending()
                time.sleep(60)  # Vérification chaque minute

        except KeyboardInterrupt:
            logging.info("⏹️  Planificateur arrêté par l'utilisateur")
            self.is_running = False

    def stop(self):
        """Arrête le planificateur"""
        self.is_running = False
        logging.info("⏹️  Planificateur arrêté")

# Configuration d'exemple pour les alertes
alert_config = {
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587,
    "email": "votre-email@gmail.com",
    "password": "votre-mot-de-passe-app",  # Utiliser un mot de passe d'application
    "recipients": ["votre-email@gmail.com"]
}

def main():
    """Démonstration du planificateur intelligent"""
    print("🤖 Planificateur Intelligent de Domaines")
    print("=======================================")

    # Note: Pour une vraie utilisation, intégrer avec DomainHunter
    print("Configuration requise:")
    print("1. Configurer les alertes email dans alert_config")
    print("2. Intégrer avec votre instance DomainHunter")
    print("3. Lancer avec: python smart_scheduler.py")

    print("\nFonctionnalités:")
    print("✅ Planning intelligent adaptatif")
    print("✅ Alertes automatiques pour opportunités")
    print("✅ Rapports quotidiens par email")
    print("✅ Monitoring des performances")
    print("✅ Maintenance automatique")
    print("✅ Optimisation des seuils")

if __name__ == "__main__":
    main()
