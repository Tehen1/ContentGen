"""
Configuration centralisée pour l'intégration de Google Fit.

Ce module contient toutes les configurations nécessaires pour l'authentification
OAuth 2.0, les endpoints API, les types de données et les chemins de stockage.
"""

import os
import logging
import pathlib
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('google_fit')

# Chargement des variables d'environnement
load_dotenv()

# ======== Configuration des Chemins ========
BASE_DIR = pathlib.Path(__file__).parent.absolute()
PROJECT_ROOT = BASE_DIR.parent.parent.parent.absolute()
DATA_DIR = BASE_DIR / "data"
CREDENTIALS_DIR = BASE_DIR / "credentials"

# Création des répertoires s'ils n'existent pas
DATA_DIR.mkdir(exist_ok=True)
CREDENTIALS_DIR.mkdir(exist_ok=True)

# Chemin vers le fichier de credentials client
CLIENT_SECRET_PATH = CREDENTIALS_DIR / "client_secret.json"
TOKEN_PATH = CREDENTIALS_DIR / "token.json"

# ======== Configuration de l'API Google Fit ========
API_VERSION = "v1"
API_SERVICE_NAME = "fitness"

# URLs de l'API OAuth 2.0
AUTH_URI = "https://accounts.google.com/o/oauth2/auth"
TOKEN_URI = "https://oauth2.googleapis.com/token"
AUTH_PROVIDER_URI = "https://www.googleapis.com/oauth2/v1/certs"
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/oauth2callback")

# IDs Client OAuth 2.0 (préférer les variables d'environnement)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")

# ======== Scopes d'autorisation ========
SCOPES = [
    "https://www.googleapis.com/auth/fitness.activity.read",
    "https://www.googleapis.com/auth/fitness.body.read",
    "https://www.googleapis.com/auth/fitness.location.read",
    "https://www.googleapis.com/auth/fitness.heart_rate.read"
]

# ======== Types de Données Google Fit ========
DATA_TYPES = {
    "steps": "com.google.step_count.delta",
    "calories": "com.google.calories.expended",
    "distance": "com.google.distance.delta",
    "weight": "com.google.weight",
    "heart_rate": "com.google.heart_rate.bpm",
    "activity_segment": "com.google.activity.segment",
    "speed": "com.google.speed",
    "active_minutes": "com.google.active_minutes"
}

# ======== Configuration des Types d'Activités ========
ACTIVITY_TYPES = {
    "walking": 7,      # Walking
    "running": 8,      # Running
    "biking": 1,       # Biking
    "hiking": 35,      # Hiking
    "swimming": 82,    # Swimming
    "gym": 97,         # Weight training
    "dancing": 24,     # Dancing
    "all": None        # Toutes les activités
}

# ======== Configuration du Traitement ========
DEFAULT_DAYS = 30  # Nombre de jours par défaut pour la récupération des données
MAX_DAYS = 365     # Nombre maximum de jours autorisés
TIME_BUCKET_MS = 86400000  # Intervalle d'un jour en millisecondes

# ======== Configuration de la sortie ========
OUTPUT_DATE_FORMAT = "%Y-%m-%d_%H%M%S"  # Format pour les noms de fichiers
OUTPUT_FILENAME_TEMPLATE = "google_fit_data_{date}.json"

# ======== Configuration des Erreurs ========
RETRY_ATTEMPTS = 3
RETRY_BACKOFF_FACTOR = 2
RETRY_MAX_WAIT = 60

