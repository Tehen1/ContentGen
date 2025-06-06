#!/usr/bin/env python3
"""
Script principal pour récupérer les données de Google Fit.

Ce script fournit une interface en ligne de commande pour récupérer
et exporter les données de fitness depuis l'API Google Fit.
"""

import os
import sys
import json
import logging
import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any, Union

import click

from . import config
from .auth import GoogleFitAuth, GoogleFitAuthError, ClientSecretError, create_client_secret_file
from .data_fetcher import DataFetcher, GoogleFitDataError

# Configuration du logger
logger = logging.getLogger('google_fit.cli')

class CliError(Exception):
    """Erreur de base pour les problèmes liés à l'interface en ligne de commande."""
    pass

def setup_logging(verbose: bool = False) -> None:
    """
    Configure le système de logging.
    
    Args:
        verbose: Active le mode verbeux avec plus de détails
    """
    log_level = logging.DEBUG if verbose else logging.INFO
    
    # Configuration du handler console
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    
    # Configuration du logger racine
    root_logger = logging.getLogger('google_fit')
    root_logger.setLevel(log_level)
    root_logger.addHandler(console_handler)
    
    # Niveaux de log pour les bibliothèques externes
    if not verbose:
        logging.getLogger('googleapiclient').setLevel(logging.WARNING)
        logging.getLogger('google_auth_oauthlib').setLevel(logging.WARNING)

def validate_activity_types(ctx, param, value: Optional[str]) -> Optional[List[str]]:
    """
    Valide et convertit les types d'activités fournis en ligne de commande.
    
    Args:
        ctx: Contexte Click
        param: Paramètre Click
        value: Valeur fournie en ligne de commande (chaîne séparée par des virgules)
        
    Returns:
        Liste des types d'activités validés
        
    Raises:
        click.BadParameter: Si un type d'activité n'est pas valide
    """
    if not value:
        return None
        
    activities = [act.strip().lower() for act in value.split(',')]
    
    # Vérifier si tous les types d'activités sont valides
    invalid_activities = [act for act in activities if act not in config.ACTIVITY_TYPES]
    if invalid_activities:
        raise click.BadParameter(
            f"Types d'activités non pris en charge: {', '.join(invalid_activities)}. "
            f"Types disponibles: {', '.join(config.ACTIVITY_TYPES.keys())}"
        )
    
    return activities

def export_to_json(data: Dict[str, Any], output_dir: Optional[Path] = None) -> Path:
    """
    Exporte les données au format JSON avec un nom de fichier horodaté.
    
    Args:
        data: Données à exporter
        output_dir: Répertoire de sortie (utilise DATA_DIR par défaut)
        
    Returns:
        Path: Chemin vers le fichier JSON créé
        
    Raises:
        CliError: Si l'export échoue
    """
    try:
        # Utiliser le répertoire de sortie spécifié ou celui par défaut
        output_dir = output_dir or config.DATA_DIR
        os.makedirs(output_dir, exist_ok=True)
        
        # Générer un nom de fichier avec la date actuelle
        date_str = datetime.datetime.now().strftime(config.OUTPUT_DATE_FORMAT)
        filename = config.OUTPUT_FILENAME_TEMPLATE.format(date=date_str)
        output_path = output_dir / filename
        
        # Écrire les données JSON dans le fichier
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        logger.info(f"Données exportées avec succès vers {output_path}")
        return output_path
        
    except Exception as e:
        raise CliError(f"Erreur lors de l'export des données: {str(e)}")

def print_auth_instructions(auth_url: str) -> None:
    """
    Affiche les instructions d'authentification à l'utilisateur.
    
    Args:
        auth_url: URL d'authentification à ouvrir
    """
    click.echo("\n╔════════════════════════════════════════════════════════════╗")
    click.echo("║               AUTHENTIFICATION GOOGLE FIT                  ║")
    click.echo("╚════════════════════════════════════════════════════════════╝\n")
    click.echo("Pour accéder à vos données Google Fit, vous devez autoriser cette application.")
    click.echo(f"\n1. Ouvrez l'URL suivante dans votre navigateur:\n\n{auth_url}\n")
    click.echo("2. Connectez-vous à votre compte Google et accordez les autorisations demandées.")
    click.echo("3. Vous serez redirigé vers une page avec un code d'autorisation.")
    click.echo("4. Copiez le code d'autorisation et collez-le ci-dessous.\n")

def authenticate() -> GoogleFitAuth:
    """
    Gère le processus d'authentification interactif.
    
    Returns:
        GoogleFitAuth: Instance authentifiée
        
    Raises:
        CliError: Si l'authentification échoue
    """
    try:
        # Créer une instance d'authentification
        auth = GoogleFitAuth()
        
        # Vérifier si déjà authentifié
        if auth.is_authenticated():
            logger.info("Déjà authentifié avec des identifiants valides.")
            return auth
            
        # Générer l'URL d'authentification
        auth_url, state = auth.get_authorization_url()
        
        # Afficher les instructions
        print_auth_instructions(auth_url)
        
        # Demander le code d'autorisation
        auth_code = click.prompt("Code d'autorisation", type=str)
        
        # Échanger le code contre un token
        auth.exchange_code(auth_code)
        
        click.echo("\n✅ Authentification réussie! Vos identifiants ont été sauvegardés pour les futures utilisations.\n")
        return auth
        
    except ClientSecretError as e:
        # Gestion spéciale pour l'erreur de fichier client_secret manquant
        click.echo(f"\n❌ Erreur de configuration: {str(e)}\n")
        
        # Proposer de créer un fichier à partir des variables d'environnement
        if click.confirm("Voulez-vous essayer de créer un fichier client_secret.json à partir des variables d'environnement?"):
            try:
                create_client_secret_file()
                click.echo("\n✅ Fichier client_secret.json créé avec succès. Veuillez réessayer la commande.\n")
            except Exception as inner_e:
                raise CliError(f"Impossible de créer le fichier client_secret.json: {str(inner_e)}")
        
        raise CliError("Configuration OAuth 2.0 incomplète. Veuillez consulter SETUP_FR.md pour les instructions d'installation.")
        
    except Exception as e:
        raise CliError(f"Erreur d'authentification: {str(e)}")

@click.command()
@click.option(
    '--days',
    type=click.IntRange(1, config.MAX_DAYS),
    default=config.DEFAULT_DAYS,
    help=f"Nombre de jours à récupérer (1-{config.MAX_DAYS}, par défaut: {config.DEFAULT_DAYS})."
)
@click.option(
    '--activity',
    callback=validate_activity_types,
    help="Types d'activités à inclure (séparés par des virgules, ex: running,walking)."
)
@click.option(
    '--output-dir',
    type=click.Path(file_okay=False, dir_okay=True, resolve_path=True, path_type=Path),
    help="Répertoire de sortie pour le fichier JSON (par défaut: ./data)."
)
@click.option(
    '--verbose', '-v',
    is_flag=True,
    help="Active le mode verbeux avec plus de détails de journalisation."
)
def main(days: int, activity: Optional[List[str]], output_dir: Optional[Path], verbose: bool) -> None:
    """
    Récupère et exporte les données d'activités depuis Google Fit.
    
    Cette commande récupère les données de fitness (pas, calories, distance, etc.)
    depuis l'API Google Fit et les exporte dans un fichier JSON.
    
    Exemples d'utilisation:
    
      # Récupérer les 30 derniers jours (par défaut)
      python -m google_fit_data
      
      # Récupérer les 60 derniers jours
      python -m google_fit_data --days 60
      
      # Filtrer par types d'activités spécifiques
      python -m google_fit_data --activity running,walking
      
      # Spécifier un répertoire de sortie
      python -m google_fit_data --output-dir /chemin/vers/dossier
    """
    try:
        # Configurer le logging
        setup_logging(verbose)
        
        # Authentification
        logger.info("Vérification de l'authentification Google Fit")
        auth = authenticate()
        
        # Récupération des données
        logger.info(f"Récupération des données pour les {days} derniers jours")
        if activity:
            logger.info(f"Filtrage sur les activités: {', '.join(activity)}")
            
        data_fetcher = DataFetcher(auth)
        summary = data_fetcher.get_activity_summary(days=days, activity_types=activity)
        
        # Afficher un résumé des données récupérées
        total_steps = summary["totals"]["steps"]
        total_calories = summary["totals"]["calories"]
        total_distance = summary["totals"]["distance"]
        period_start = summary["period"]["start_date"]
        period_end = summary["period"]["end_date"]
        
        # Export des données
        output_file = export_to_json(summary, output_dir)
        
        # Afficher un résumé
        click.echo("\n╔════════════════════════════════════════════════════════════╗")
        click.echo("║                  RÉSUMÉ DES DONNÉES                         ║")
        click.echo("╚════════════════════════════════════════════════════════════╝\n")
        
        click.echo(f"📅 Période : du {period_start} au {period_end}")
        click.echo(f"👣 Pas      : {total_steps:,}".replace(',', ' '))
        click.echo(f"🔥 Calories : {total_calories:,.2f}".replace(',', ' '))
        click.echo(f"📏 Distance : {total_distance:,.2f} km".replace(',', ' '))
        
        click.echo(f"\n📊 Données enregistrées dans : {output_file}")
        click.echo("\n✨ Succès! Les données ont été récupérées et sauvegardées.")
        
    except CliError as e:
        logger.error(str(e))
        click.echo(f"\n❌ Erreur: {str(e)}")
        sys.exit(1)
        
    except GoogleFitAuthError as e:
        logger.error(f"Erreur d'authentification: {str(e)}")
        click.echo(f"\n❌ Erreur d'authentification: {str(e)}")
        click.echo("   Veuillez suivre les instructions de configuration dans SETUP_FR.md.")
        sys.exit(1)
        
    except GoogleFitDataError as e:
        logger.error(f"Erreur de données: {str(e)}")
        click.echo(f"\n❌ Erreur lors de la récupération des données: {str(e)}")
        sys.exit(1)
        
    except Exception as e:
        logger.exception("Erreur inattendue")
        click.echo(f"\n❌ Erreur inattendue: {str(e)}")
        if verbose:
            import traceback
            click.echo(traceback.format_exc())
        sys.exit(1)

if __name__ == "__main__":
    main()

