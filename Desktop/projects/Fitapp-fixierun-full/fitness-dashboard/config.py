"""
Configuration centralisée pour l'application Streamlit et l'analyse d'activités
"""
import os
import logging
from pathlib import Path
# Chemins des fichiers
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "Fit"
ACTIVITY_DATA = DATA_DIR / "Toutes les données"
ACTIVITIES_DIR = DATA_DIR / "Activités"
ROUTES_DIR = DATA_DIR / "Historique des positions (Vos trajets)"
SESSIONS_DIR = DATA_DIR / "Toutes les données"

def ensure_directory_exists(directory_path):
    """
    Check if a directory exists and create it if it doesn't.
    
    Args:
        directory_path: Path object representing the directory
        
    Returns:
        bool: True if directory exists or was created successfully, False otherwise
    """
    try:
        if not directory_path.exists():
            logging.info(f"Creating directory: {directory_path}")
            directory_path.mkdir(parents=True, exist_ok=True)
            return True
        return True
    except Exception as e:
        logging.error(f"Error creating directory {directory_path}: {e}")
        return False

# Ensure all required directories exist
ensure_directory_exists(DATA_DIR)
ensure_directory_exists(ACTIVITY_DATA)
ensure_directory_exists(ACTIVITIES_DIR)
ensure_directory_exists(ROUTES_DIR)
def get_data_path(is_local=True):
    """
    Retourne le chemin des données selon l'environnement
    et crée le répertoire s'il n'existe pas
    
    Args:
        is_local: boolean, True pour l'environnement local, False pour streamlit.app
        
    Returns:
        Path: Le chemin vers le répertoire de données
    """
    if is_local:
        path = ACTIVITY_DATA
    else:
        # Pour streamlit.app, utiliser le chemin relatif
        path = Path("./Fit/Toutes les données")
    
    # Ensure the directory exists
    ensure_directory_exists(path)
    
    return path

def safe_file_operation(file_path, operation_func, *args, **kwargs):
    """
    Safely execute a file operation with error handling
    
    Args:
        file_path: Path to the file
        operation_func: Function to execute on the file
        *args, **kwargs: Arguments to pass to operation_func
        
    Returns:
        The result of operation_func or None if an error occurred
    """
    try:
        # Ensure parent directory exists
        ensure_directory_exists(Path(file_path).parent)
        return operation_func(file_path, *args, **kwargs)
    except FileNotFoundError:
        logging.error(f"File not found: {file_path}")
        return None
    except PermissionError:
        logging.error(f"Permission denied accessing file: {file_path}")
        return None
    except Exception as e:
        logging.error(f"Error during file operation on {file_path}: {e}")
        return None

# Configuration des données
DATA_CONFIG = {
    # Format de date pour le parsing
    "date_format": "ISO8601",

    # Colonnes attendues dans les fichiers CSV
    "required_columns": [
        "Heure de début",
        "Heure de fin",
        "Minutes cardio",
        "Nombre de pas",
        "Distance (m)",
        "Points cardio"
    ],

    # Configuration du parsing des données
    "date_handling": {
        "parse_dates": ["Heure de début", "Heure de fin"],
        "na_values": ["", "nan", "NaN"],
    },

    # Configuration des agrégations
    "aggregations": {
        "daily": "D",
        "weekly": "W",
        "monthly": "ME"
    },

    # Configuration du traitement TCX
    "tcx_parsing": {
        "namespaces": {
            "ns3": "http://www.garmin.com/xmlschemas/ActivityExtension/v2",
            "ns4": "http://www.garmin.com/xmlschemas/ProfileExtension/v1"
        },
        "required_fields": [
            "Time",
            "LatitudeDegrees",
            "LongitudeDegrees",
            "HeartRateBpm",
            "Cadence",
            "Distance"
        ]
    }
}

# Configuration de l'interface utilisateur
UI_CONFIG = {
    "page_title": "Fitness Dashboard",
    "page_icon": "🏃‍♂️",
    "layout": "wide",
    "initial_sidebar_state": "expanded",
}

# Configuration du dashboard
DASHBOARD_CONFIG = {
    # Paramètres temporels
    "default_period": "ME",  # Month End (remplace 'M')
    "date_format": "ISO8601",

    # Configuration des graphiques
    "graphs": {
        "colors": {
            "primary": "#FF4B4B",
            "secondary": "#0068C9",
            "background": "#FFFFFF",
            "success": "#00C9A7",
            "warning": "#FFC107",
            "info": "#17A2B8",
            "activity_types": {
                "Marche": "#4CAF50",
                "Course": "#FF4B4B",
                "Vélo": "#2196F3",
                "Natation": "#00BCD4"
            }
        },
        "height": 400,
        "width": "100%",
        "map": {
            "zoom_start": 13,
            "tile_provider": "OpenStreetMap",
            "route_color": "#FF4B4B",
            "route_weight": 2,
            "route_opacity": 0.8
        }
    },

    # Métriques à afficher
    "metrics": {
        "cardio": {
            "display_name": "Minutes cardio",
            "column": "Minutes cardio",
            "unit": "min",
            "thresholds": {
                "faible": 30,
                "modéré": 60,
                "intense": 90
            }
        },
        "steps": {
            "display_name": "Nombre de pas",
            "column": "Nombre de pas",
            "unit": "pas",
            "daily_goal": 10000,
            "thresholds": {
                "faible": 5000,
                "modéré": 10000,
                "intense": 15000
            }
        },
        "distance": {
            "display_name": "Distance",
            "column": "Distance (m)",
            "unit": "m",
            "thresholds": {
                "faible": 3000,
                "modéré": 5000,
                "intense": 10000
            }
        }
    },

    # Configuration des activités
    "activities": {
        "intensity_levels": {
            "léger": {"min_heart_rate": 0, "max_heart_rate": 120},
            "modéré": {"min_heart_rate": 121, "max_heart_rate": 140},
            "intense": {"min_heart_rate": 141, "max_heart_rate": 999}
        },
        "achievements": {
            "distance": [5000, 10000, 21000, 42000],
            "duration": [30, 60, 120, 180],
            "elevation": [100, 500, 1000, 2000]
        }
    },

    # API Externes
    "external_apis": {
        "weather": {
            "provider": "OpenWeatherMap",
            "api_key": os.getenv("WEATHER_API_KEY", ""),
            "units": "metric"
        },
        "map_tiles": {
            "provider": "OpenStreetMap",
            "api_key": os.getenv("MAP_API_KEY", ""),
            "style": "streets"
        }
    }
}
