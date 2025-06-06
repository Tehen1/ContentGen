import logging
from defusedxml import ElementTree as ET
import pandas as pd
import numpy as np
import folium
import requests
from datetime import datetime, timedelta
from typing import Dict, List
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
from dataclasses import dataclass
import os
import math

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# French language messages
MESSAGES = {
    'error_tcx_parse': 'Erreur lors de l\'analyse du fichier TCX',
    'error_api': 'Erreur de connexion à l\'API',
    'error_data_processing': 'Erreur lors du traitement des données',
    'success_processing': 'Traitement réussi',
}

@dataclass
class ActivityData:
    """Structure pour stocker les données d'activité."""
    type: str
    start_time: datetime
    duration: timedelta
    distance: float
    points: List[Dict]
    elevation_gain: float
    average_speed: float

# ====================================
# Module 1: Data Processing
# ====================================

def parse_tcx_file(file_path: Path) -> ActivityData:
    """Parse un fichier TCX et extrait les données d'activité."""
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
        
        # Extraire les données de base
        activity = root.find('.//{*}Activity')
        activity_type = activity.get('Sport')
        
        # Extraire les points de données
        track_points = []
        for point in root.findall('.//{*}Trackpoint'):
            time = datetime.fromisoformat(point.find('{*}Time').text)
            position = point.find('{*}Position')
            if position is not None:
                lat = float(position.find('{*}LatitudeDegrees').text)
                lon = float(position.find('{*}LongitudeDegrees').text)
                track_points.append({
                    'time': time,
                    'latitude': lat,
                    'longitude': lon,
                    'elevation': float(point.find('{*}AltitudeMeters').text)
                })
        
        return ActivityData(
            type=activity_type,
            start_time=track_points[0]['time'],
            duration=track_points[-1]['time'] - track_points[0]['time'],
            distance=calculate_total_distance(track_points),
            points=track_points,
            elevation_gain=calculate_elevation_gain(track_points),
            average_speed=calculate_average_speed(track_points)
        )
    except Exception as e:
        logger.error(f"Erreur lors du parsing TCX: {e}")
        raise ValueError(MESSAGES['error_tcx_parse']) from e

def process_daily_metrics(file_path: Path) -> pd.DataFrame:
    """Traite les métriques quotidiennes depuis un fichier CSV."""
    try:
        df = pd.read_csv(file_path)
        df['date'] = pd.to_datetime(df['date'])
        return clean_and_validate_data(df)
    except Exception as e:
        logger.error(f"Erreur lors du traitement des données: {e}")
        raise ValueError(MESSAGES['error_data_processing']) from e

def clean_and_validate_data(df: pd.DataFrame) -> pd.DataFrame:
    """Nettoie et valide les données."""
    # Suppression des doublons
    df = df.drop_duplicates()
    
    # Gestion des valeurs manquantes
    df = df.fillna(method='ffill')
    
    # Validation des plages de valeurs
    numeric_columns = df.select_dtypes(include=[np.number]).columns
    for col in numeric_columns:
        df = df[df[col].between(df[col].quantile(0.01), df[col].quantile(0.99))]
    
    return df

# ====================================
# Module 2: Analysis
# ====================================

def calculate_performance_metrics(activities: List[ActivityData]) -> Dict:
    """Calcule les métriques de performance."""
    metrics = {
        'total_distance': sum(a.distance for a in activities),
        'total_duration': sum((a.duration.total_seconds() / 3600) for a in activities),
        'avg_speed': np.mean([a.average_speed for a in activities]),
        'total_elevation': sum(a.elevation_gain for a in activities),
    }
    return metrics

def analyze_route(points: List[Dict]) -> Dict:
    """Analyse détaillée d'un itinéraire."""
    return {
        'distance': calculate_total_distance(points),
        'elevation_profile': calculate_elevation_profile(points),
        'speed_variations': calculate_speed_variations(points),
        'difficulty_score': calculate_difficulty_score(points)
    }

def detect_patterns(activities: List[ActivityData]) -> Dict:
    """Détecte les motifs dans les activités."""
    patterns = {
        'preferred_times': analyze_activity_times(activities),
        'weekly_patterns': analyze_weekly_patterns(activities),
        'progress_trends': analyze_progress_trends(activities)
    }
    return patterns

# ====================================
# Module 3: Visualization
# ====================================

def generate_activity_charts(data: pd.DataFrame) -> Dict:
    """Génère les graphiques d'activité."""
    charts = {}
    
    # Graphique d'évolution temporelle
    fig, ax = plt.subplots(figsize=(12, 6))
    sns.lineplot(data=data, x='date', y='distance', ax=ax)
    ax.set_title('Évolution de la distance parcourue')
    charts['evolution'] = fig
    
    # Graphique de distribution
    fig, ax = plt.subplots(figsize=(10, 6))
    sns.histplot(data=data, x='duration', ax=ax)
    ax.set_title('Distribution des durées d\'activité')
    charts['distribution'] = fig
    
    return charts

def create_route_map(activity: ActivityData) -> folium.Map:
    """Crée une carte interactive de l'itinéraire."""
    points = [(p['latitude'], p['longitude']) for p in activity.points]
    center = points[0]
    
    m = folium.Map(location=center, zoom_start=13)
    folium.PolyLine(
        points,
        weight=3,
        color='red',
        popup=f'Distance: {activity.distance:.2f}km'
    ).add_to(m)
    
    return m

# ====================================
# Module 4: Integration
# ====================================

def fetch_weather_data(lat: float, lon: float, date: datetime) -> Dict:
    """Récupère les données météo pour une activité."""
    api_key = os.getenv('WEATHER_API_KEY')
    if not api_key:
        raise ValueError("Clé API météo non configurée")
    
    try:
        response = requests.get(
            f"https://api.openweathermap.org/data/2.5/weather",
            params={
                "lat": lat,
                "lon": lon,
                "dt": int(date.timestamp()),
                "appid": api_key
            },
            timeout=10  # Add timeout
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error(f"Erreur API météo: {e}")
        raise ValueError(MESSAGES['error_api']) from e

def sync_activities(local_data: List[ActivityData], remote_data: List[Dict]) -> List[ActivityData]:
    """Synchronise les données locales avec les données distantes."""
    try:
        # Identifier les nouvelles activités
        local_ids = {a.start_time for a in local_data}
        new_activities = [
            activity for activity in remote_data
            if datetime.fromisoformat(activity['start_time']) not in local_ids
        ]
        
        # Convertir les nouvelles activités au format ActivityData
        converted_activities = [
            ActivityData(
                type=activity['type'],
                start_time=datetime.fromisoformat(activity['start_time']),
                duration=timedelta(seconds=activity['duration']),
                distance=activity['distance'],
                points=activity['points'],
                elevation_gain=activity['elevation_gain'],
                average_speed=activity['average_speed']
            )
            for activity in new_activities
        ]
        
        return local_data + converted_activities
    except Exception as e:
        logger.error(f"Erreur lors de la synchronisation: {e}")
        raise ValueError(MESSAGES['error_data_processing']) from e

def calculate_distance(point1: Dict, point2: Dict) -> float:
    """Calculate distance between two points."""
    lat1, lon1 = math.radians(point1['latitude']), math.radians(point1['longitude'])
    lat2, lon2 = math.radians(point2['latitude']), math.radians(point2['longitude'])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return 6371 * c  # Radius of the Earth in kilometers

def calculate_total_distance(points: List[Dict]) -> float:
    """Calculate total distance from GPS points."""
    total = 0
    for i in range(len(points) - 1):
        total += calculate_distance(points[i], points[i + 1])
    return total

def calculate_elevation_gain(points: List[Dict]) -> float:
    """Calculate total elevation gain."""
    gain = 0
    for i in range(len(points) - 1):
        diff = points[i + 1].get('elevation', 0) - points[i].get('elevation', 0)
        if diff > 0:
            gain += diff
    return gain

def calculate_average_speed(points: List[Dict]) -> float:
    """Calculate average speed from GPS points."""
    if not points:
        return 0
    total_distance = calculate_total_distance(points)
    total_time = (points[-1]['time'] - points[0]['time']).total_seconds()
    return total_distance / total_time if total_time > 0 else 0

def calculate_elevation_profile(points: List[Dict]) -> Dict:
    """Generate elevation profile data."""
    return {
        'distances': [p.get('distance', 0) for p in points],
        'elevations': [p.get('elevation', 0) for p in points]
    }

def calculate_speed_variations(points: List[Dict]) -> Dict:
    """Calculate speed variations over the route."""
    speeds = []
    for i in range(len(points) - 1):
        dist = calculate_distance(points[i], points[i + 1])
        time = (points[i + 1]['time'] - points[i]['time']).total_seconds()
        speeds.append(dist / time if time > 0 else 0)
    return {'speeds': speeds}

def calculate_difficulty_score(points: List[Dict]) -> float:
    """Calculate route difficulty based on elevation and speed."""
    elevation_gain = calculate_elevation_gain(points)
    avg_speed = calculate_average_speed(points)
    return (elevation_gain * 0.3 + avg_speed * 0.7) / 2

def analyze_activity_times(activities: List[Dict]) -> Dict:
    """Analyze activity timing patterns."""
    times = [a['start_time'].hour for a in activities]
    return {'peak_hours': pd.Series(times).value_counts().head(3)}

def analyze_weekly_patterns(activities: List[Dict]) -> Dict:
    """Analyze weekly activity patterns."""
    days = [a['start_time'].strftime('%A') for a in activities]
    return {'active_days': pd.Series(days).value_counts()}

def analyze_progress_trends(activities: List[Dict]) -> Dict:
    """Analyze progress trends over time."""
    dates = [a['start_time'].date() for a in activities]
    distances = [a.get('distance', 0) for a in activities]
    return {'trend': pd.Series(distances, index=dates).rolling(7).mean()}
