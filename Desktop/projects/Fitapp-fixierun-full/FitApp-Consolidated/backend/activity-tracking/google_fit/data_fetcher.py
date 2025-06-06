"""
Module pour récupérer et traiter les données de l'API Google Fit.

Ce module gère la récupération, le filtrage et le formatage des données
de fitness à partir de l'API Google Fit.
"""

import datetime
import logging
import time
from typing import Dict, List, Any, Optional, Union, Tuple
from dateutil.parser import parse as parse_date

import tenacity
from googleapiclient.errors import HttpError
from google.auth.exceptions import GoogleAuthError

from . import config
from .auth import GoogleFitAuth, GoogleFitAuthError

# Configuration du logger
logger = logging.getLogger('google_fit.data_fetcher')

class GoogleFitDataError(Exception):
    """Erreur de base pour les problèmes de récupération de données Google Fit."""
    pass

class DataTypeNotSupportedError(GoogleFitDataError):
    """Erreur lorsqu'un type de données n'est pas pris en charge."""
    pass

class InvalidDateRangeError(GoogleFitDataError):
    """Erreur lorsque la plage de dates est invalide."""
    pass

class DataFetchError(GoogleFitDataError):
    """Erreur lors de la récupération des données depuis l'API."""
    pass

class DataFetcher:
    """
    Gère la récupération des données de fitness à partir de l'API Google Fit.
    
    Cette classe fournit des méthodes pour récupérer, filtrer et formater
    les données de fitness selon différents critères.
    """
    
    def __init__(self, auth: Optional[GoogleFitAuth] = None):
        """
        Initialise le récupérateur de données.
        
        Args:
            auth: Instance de GoogleFitAuth pour l'authentification
        """
        self.auth = auth or GoogleFitAuth()
        self._service = None
        
    @property
    def service(self):
        """
        Obtient ou initialise le service Google Fitness API.
        
        Returns:
            Le service Google Fitness API authentifié
            
        Raises:
            GoogleFitAuthError: Si l'authentification échoue
        """
        if not self._service:
            self._service = self.auth.get_fitness_service()
        return self._service
    
    def get_data(
        self, 
        data_types: Optional[List[str]] = None,
        days: int = None,
        start_date: Optional[Union[datetime.datetime, str]] = None,
        end_date: Optional[Union[datetime.datetime, str]] = None,
        activity_types: Optional[List[str]] = None
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Récupère les données de fitness pour les types et la période spécifiés.
        
        Args:
            data_types: Liste des types de données à récupérer (ex: ["steps", "calories"])
                        Si None, tous les types de données disponibles sont récupérés.
            days: Nombre de jours à récupérer en remontant à partir d'aujourd'hui.
                  Ignoré si start_date et end_date sont fournis.
            start_date: Date de début de la période (datetime ou chaîne au format ISO)
            end_date: Date de fin de la période (datetime ou chaîne au format ISO)
            activity_types: Liste des types d'activités à filtrer (ex: ["walking", "running"])
                            Si None, toutes les activités sont incluses.
        
        Returns:
            Dict: Dictionnaire contenant les données de fitness organisées par type
            
        Raises:
            InvalidDateRangeError: Si la plage de dates est invalide
            DataTypeNotSupportedError: Si un type de données n'est pas pris en charge
            DataFetchError: Si la récupération des données échoue
        """
        # Valider et préparer les dates
        start_time, end_time = self._prepare_date_range(days, start_date, end_date)
        
        # Valider et préparer les types de données
        if not data_types:
            data_types = list(config.DATA_TYPES.keys())
        elif any(dt not in config.DATA_TYPES for dt in data_types):
            invalid_types = [dt for dt in data_types if dt not in config.DATA_TYPES]
            raise DataTypeNotSupportedError(
                f"Types de données non pris en charge: {', '.join(invalid_types)}. "
                f"Types disponibles: {', '.join(config.DATA_TYPES.keys())}"
            )
            
        # Valider les types d'activités
        if activity_types and any(at not in config.ACTIVITY_TYPES for at in activity_types):
            invalid_activities = [at for at in activity_types if at not in config.ACTIVITY_TYPES]
            raise DataTypeNotSupportedError(
                f"Types d'activités non pris en charge: {', '.join(invalid_activities)}. "
                f"Types disponibles: {', '.join(config.ACTIVITY_TYPES.keys())}"
            )
            
        # Convertir les dates en millisecondes pour l'API
        start_time_ms = int(start_time.timestamp() * 1000)
        end_time_ms = int(end_time.timestamp() * 1000)
        
        # Préparer le résultat
        result = {}
        
        # Récupérer les données pour chaque type de données
        for data_type in data_types:
            google_data_type = config.DATA_TYPES[data_type]
            
            try:
                # Récupérer les données avec gestion des erreurs et retries
                raw_data = self._get_aggregate_data_with_retry(
                    google_data_type,
                    start_time_ms,
                    end_time_ms,
                    activity_types
                )
                
                # Formatter les données
                formatted_data = self._format_data(
                    raw_data,
                    data_type,
                    start_time,
                    (end_time - start_time).days + 1
                )
                
                result[data_type] = formatted_data
                
            except Exception as e:
                logger.error(f"Erreur lors de la récupération des données {data_type}: {str(e)}")
                raise DataFetchError(f"Impossible de récupérer les données {data_type}: {str(e)}")
                
        return result
    
    def _prepare_date_range(
        self,
        days: Optional[int] = None,
        start_date: Optional[Union[datetime.datetime, str]] = None,
        end_date: Optional[Union[datetime.datetime, str]] = None
    ) -> Tuple[datetime.datetime, datetime.datetime]:
        """
        Prépare et valide la plage de dates pour la requête.
        
        Args:
            days: Nombre de jours à récupérer en remontant à partir d'aujourd'hui.
                  Ignoré si start_date et end_date sont fournis.
            start_date: Date de début de la période (datetime ou chaîne au format ISO)
            end_date: Date de fin de la période (datetime ou chaîne au format ISO)
            
        Returns:
            Tuple: (date_début, date_fin) en objets datetime
            
        Raises:
            InvalidDateRangeError: Si la plage de dates est invalide
        """
        # Cas 1: start_date et end_date fournis
        if start_date and end_date:
            start_time = self._parse_datetime(start_date)
            end_time = self._parse_datetime(end_date)
            
            # Vérifier que la date de début est antérieure à la date de fin
            if start_time >= end_time:
                raise InvalidDateRangeError("La date de début doit être antérieure à la date de fin.")
                
        # Cas 2: days fourni (ou utilisation de la valeur par défaut)
        else:
            # Utiliser le nombre de jours par défaut si non spécifié
            if days is None:
                days = config.DEFAULT_DAYS
                
            # Vérifier que la valeur est dans la plage autorisée
            if days <= 0 or days > config.MAX_DAYS:
                raise InvalidDateRangeError(
                    f"Le nombre de jours doit être compris entre 1 et {config.MAX_DAYS}."
                )
                
            # Calculer la période
            end_time = datetime.datetime.now()
            start_time = end_time - datetime.timedelta(days=days)
            
        return start_time, end_time
    
    def _parse_datetime(self, date_value: Union[datetime.datetime, str]) -> datetime.datetime:
        """
        Convertit une valeur de date en objet datetime.
        
        Args:
            date_value: Date à convertir (datetime ou chaîne au format ISO)
            
        Returns:
            datetime: Objet datetime correspondant
            
        Raises:
            InvalidDateRangeError: Si la date ne peut pas être analysée
        """
        if isinstance(date_value, datetime.datetime):
            return date_value
            
        try:
            return parse_date(date_value)
        except Exception as e:
            raise InvalidDateRangeError(
                f"Format de date invalide: {date_value}. Utilisez le format ISO (YYYY-MM-DD)."
            )
    
    @tenacity.retry(
        stop=tenacity.stop_after_attempt(config.RETRY_ATTEMPTS),
        wait=tenacity.wait_exponential(multiplier=1, max=config.RETRY_MAX_WAIT),
        retry=tenacity.retry_if_exception_type((HttpError, GoogleAuthError)),
        before_sleep=lambda retry_state: logger.info(
            f"Nouvelle tentative {retry_state.attempt_number}/{config.RETRY_ATTEMPTS} "
            f"après {retry_state.next_action.sleep} secondes..."
        )
    )
    def _get_aggregate_data_with_retry(
        self,
        data_type: str,
        start_time_ms: int,
        end_time_ms: int,
        activity_types: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Récupère les données agrégées avec mécanisme de retry.
        
        Args:
            data_type: Type de données Google Fit
            start_time_ms: Timestamp de début en millisecondes
            end_time_ms: Timestamp de fin en millisecondes
            activity_types: Liste des types d'activités à filtrer
            
        Returns:
            List: Liste des données agrégées
            
        Raises:
            DataFetchError: Si la récupération échoue après les tentatives
        """
        # Construire la requête de base
        body = {
            "aggregateBy": [{
                "dataTypeName": data_type
            }],
            "bucketByTime": {
                "durationMillis": config.TIME_BUCKET_MS  # 1 jour
            },
            "startTimeMillis": start_time_ms,
            "endTimeMillis": end_time_ms
        }
        
        # Ajouter le filtre d'activité si spécifié
        if activity_types and data_type == config.DATA_TYPES["activity_segment"]:
            activity_filter = []
            for activity in activity_types:
                if activity in config.ACTIVITY_TYPES and config.ACTIVITY_TYPES[activity] is not None:
                    activity_filter.append({
                        "fieldName": "activity",
                        "value": {
                            "intVal": config.ACTIVITY_TYPES[activity]
                        }
                    })
            
            if activity_filter:
                body["filteredDataQualityStandard"] = activity_filter
                
        try:
            response = self.service.users().dataset().aggregate(userId="me", body=body).execute()
            return response.get("bucket", [])
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des données {data_type}: {str(e)}")
            raise DataFetchError(f"Erreur de récupération des données: {str(e)}")
    
    def _format_data(
        self,
        raw_data: List[Dict[str, Any]],
        data_type: str,
        start_time: datetime.datetime,
        days: int
    ) -> List[Dict[str, Any]]:
        """
        Formate les données brutes pour l'affichage et l'analyse.
        
        Args:
            raw_data: Données brutes de Google Fit
            data_type: Type de données ('steps', 'calories', etc.)
            start_time: Heure de début
            days: Nombre de jours
            
        Returns:
            List: Liste des données formatées
        """
        formatted_data = []
        
        # Créer un dictionnaire pour chaque jour avec des valeurs par défaut
        for day in range(days):
            current_date = start_time + datetime.timedelta(days=day)
            date_str = current_date.strftime("%Y-%m-%d")
            formatted_data.append({
                "date": date_str,
                "value": 0,
                "type": data_type
            })
        
        # Remplir avec les données réelles si disponibles
        for bucket in raw_data:
            if "dataset" not in bucket:
                continue
                
            for dataset in bucket["dataset"]:
                for point in dataset.get("point", []):
                    start_time_ns = int(point.get("startTimeNanos", 0)) // 1000000
                    start_date = datetime.datetime.fromtimestamp(start_time_ns / 1000)
                    date_str = start_date.strftime("%Y-%m-%d")
                    
                    # Rechercher cette date dans notre tableau formaté
                    for entry in formatted_data:
                        if entry["date"] == date_str:
                            for value in point.get("value", []):
                                if "intVal" in value:
                                    entry["value"] = value["intVal"]
                                elif "fpVal" in value:
                                    # Arrondir à 2 décimales pour les valeurs flottantes
                                    entry["value"] = round(value["fpVal"], 2)
                                    
                                    entry["metadata"] = map_values
                                
                                # Pour les segments d'activité, ajouter le type d'activité
                                if data_type == "activity_segment" and "intVal" in value:
                                    activity_id = value["intVal"]
                                    # Trouver le nom de l'activité à partir de l'ID
                                    for act_name, act_id in config.ACTIVITY_TYPES.items():
                                        if act_id == activity_id:
                                            entry["activity_type"] = act_name
                                            break
        
        return formatted_data
    
    def get_activity_summary(
        self,
        days: int = None,
        start_date: Optional[Union[datetime.datetime, str]] = None,
        end_date: Optional[Union[datetime.datetime, str]] = None,
        activity_types: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Génère un résumé des activités pour la période spécifiée.
        
        Args:
            days: Nombre de jours à récupérer en remontant à partir d'aujourd'hui
            start_date: Date de début de la période
            end_date: Date de fin de la période
            activity_types: Liste des types d'activités à filtrer
            
        Returns:
            Dict: Résumé des activités avec statistiques
        """
        # Récupérer les données de base
        data = self.get_data(
            data_types=["steps", "calories", "distance", "activity_segment"],
            days=days,
            start_date=start_date,
            end_date=end_date,
            activity_types=activity_types
        )
        
        # Calculer les statistiques
        summary = {
            "period": {
                "start_date": data["steps"][0]["date"] if data.get("steps") else None,
                "end_date": data["steps"][-1]["date"] if data.get("steps") else None,
                "days": len(data["steps"]) if data.get("steps") else 0
            },
            "totals": {
                "steps": sum(day["value"] for day in data.get("steps", [])),
                "calories": round(sum(day["value"] for day in data.get("calories", [])), 2),
                "distance": round(sum(day["value"] for day in data.get("distance", [])), 2)
            },
            "averages": {
                "steps": round(sum(day["value"] for day in data.get("steps", [])) / len(data["steps"]) if data.get("steps") and len(data["steps"]) > 0 else 0, 2),
                "calories": round(sum(day["value"] for day in data.get("calories", [])) / len(data["calories"]) if data.get("calories") and len(data["calories"]) > 0 else 0, 2),
                "distance": round(sum(day["value"] for day in data.get("distance", [])) / len(data["distance"]) if data.get("distance") and len(data["distance"]) > 0 else 0, 2)
            },
            "data": data
        }
        
        return summary
    
    def get_detailed_activity(
        self,
        days: int = None,
        start_date: Optional[Union[datetime.datetime, str]] = None,
        end_date: Optional[Union[datetime.datetime, str]] = None,
        activity_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Récupère les données détaillées pour un type d'activité spécifique.
        
        Args:
            days: Nombre de jours à récupérer en remontant à partir d'aujourd'hui
            start_date: Date de début de la période
            end_date: Date de fin de la période
            activity_type: Type d'activité à récupérer (ex: "running")
            
        Returns:
            List: Liste des activités détaillées
        """
        activity_types = [activity_type] if activity_type else None
        
        # Récupérer les segments d'activité
        data = self.get_data(
            data_types=["activity_segment"],
            days=days,
            start_date=start_date,
            end_date=end_date,
            activity_types=activity_types
        )
        
        # Enrichir les segments avec des données supplémentaires
        detailed_activities = []
        
        for segment in data.get("activity_segment", []):
            if segment["value"] > 0:  # Ignorer les segments vides
                # Récupérer la date de l'activité
                activity_date = segment["date"]
                
                # Créer un objet d'activité détaillé
                activity = {
                    "date": activity_date,
                    "type": segment.get("activity_type", "unknown"),
                    "duration_minutes": segment["value"],
                    "metrics": {}
                }
                
                # Ajouter à la liste des activités détaillées
                detailed_activities.append(activity)
        
        return detailed_activities
    
    def get_heart_rate_data(
        self,
        days: int = None,
        start_date: Optional[Union[datetime.datetime, str]] = None,
        end_date: Optional[Union[datetime.datetime, str]] = None
    ) -> Dict[str, Any]:
        """
        Récupère les données de fréquence cardiaque.
        
        Args:
            days: Nombre de jours à récupérer en remontant à partir d'aujourd'hui
            start_date: Date de début de la période
            end_date: Date de fin de la période
            
        Returns:
            Dict: Données de fréquence cardiaque
        """
        # Récupérer les données de fréquence cardiaque
        data = self.get_data(
            data_types=["heart_rate"],
            days=days,
            start_date=start_date,
            end_date=end_date
        )
        
        # Calculer les statistiques
        heart_rate_data = data.get("heart_rate", [])
        
        if not heart_rate_data:
            return {
                "period": {
                    "start_date": None,
                    "end_date": None,
                    "days": 0
                },
                "values": [],
                "statistics": {
                    "average": 0,
                    "min": 0,
                    "max": 0
                }
            }
        
        # Calculer les statistiques
        values = [hr["value"] for hr in heart_rate_data]
        avg_hr = round(sum(values) / len(values), 2) if values else 0
        min_hr = min(values) if values else 0
        max_hr = max(values) if values else 0
        
        return {
            "period": {
                "start_date": heart_rate_data[0]["date"] if heart_rate_data else None,
                "end_date": heart_rate_data[-1]["date"] if heart_rate_data else None,
                "days": len(heart_rate_data)
            },
            "values": heart_rate_data,
            "statistics": {
                "average": avg_hr,
                "min": min_hr,
                "max": max_hr
            }
        }
    
    def transform_data_for_timeline(
        self,
        data: Dict[str, List[Dict[str, Any]]]
    ) -> List[Dict[str, Any]]:
        """
        Transforme les données en format chronologique pour l'affichage.
        
        Args:
            data: Données récupérées via get_data
            
        Returns:
            List: Liste des entrées chronologiques
        """
        # Créer un dictionnaire pour stocker les données par date
        timeline = {}
        
        # Parcourir tous les types de données
        for data_type, entries in data.items():
            for entry in entries:
                date = entry["date"]
                
                # Initialiser l'entrée de la date si elle n'existe pas
                if date not in timeline:
                    timeline[date] = {
                        "date": date,
                        "metrics": {}
                    }
                
                # Ajouter la métrique à l'entrée
                timeline[date]["metrics"][data_type] = {
                    "value": entry["value"],
                    "type": data_type
                }
                
                # Ajouter des métadonnées supplémentaires si disponibles
                if "metadata" in entry:
                    timeline[date]["metrics"][data_type]["metadata"] = entry["metadata"]
                
                # Ajouter le type d'activité si disponible
                if "activity_type" in entry:
                    timeline[date]["metrics"][data_type]["activity_type"] = entry["activity_type"]
        
        # Convertir le dictionnaire en liste et trier par date
        sorted_timeline = [timeline[date] for date in sorted(timeline.keys())]
        
        return sorted_timeline
                                    activity_id = value["intVal"]
                                    # Trouver le nom de l'activité à partir de l'ID
                                    for act_name, act_id in config.ACTIVITY_TYPES.items():
                                        if act_id == activity_id:
                                            entry["activity_type"] = act_name
                                            break
                                    
        return formatted_data
    
    def get_activity_summary(
        self,
        days: int = None,
        start_date: Optional[Union[datetime.datetime, str]] = None,
        end_date: Optional[Union[datetime.datetime, str]] = None,
        activity_types: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Génère un résumé des activités pour la période spécifiée.
        
        Args:
            days: Nombre de jours à récupérer en remontant à partir d'aujourd'hui
            start_date: Date de début de la période
            end_date: Date de fin de la période
            activity_types: Liste des types d'activités à filtrer
            
        Returns:
            Dict: Résumé des activités avec statistiques
        """
        # Récupérer les données de base
        data = self.get_data(
            data_types=["steps", "calories", "distance", "activity_segment"],
            days=days,
            start_date=start_date,
            end_date=end_date,
            activity_types=activity_types
        )
        
        # Calculer les statistiques
        summary = {
            "period": {
                "start_date": data["steps"][0]["date"] if data.get("steps") else None,
                "end_date": data["steps"][-1]["date"] if data.get("steps") else None,
                "days": len(data["steps"]) if data.get("steps") else 0
            },
            "totals": {
                "steps": sum(day["value"] for day in data.get("steps", [])),
                "calories": sum(day["value"] for day in data.get("calories", [])),
                "distance": sum(day["value"] for day in data.get("distance", []))
            },
            "averages": {
                "steps": round(sum(day["value"] for day in data.get("steps", [])) / len(data["steps"]) if data.get("steps") else 0, 2),
                "calories": round(sum(day["value"] for day in data.get("calories", [])) / len(data["calories"]) if data.get("calories") else 0, 2),
                "distance": round(sum(day["value"] for day in data.get("distance", [])) / len(data["distance"]) if data.get("distance") else 0, 2)
            },
            "data": data
        }
        
        return summary

