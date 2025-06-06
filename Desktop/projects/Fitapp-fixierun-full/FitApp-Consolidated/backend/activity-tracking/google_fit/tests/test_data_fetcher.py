#!/usr/bin/env python3
"""
Tests pour le module de récupération de données Google Fit.
"""

import os
import json
import unittest
from unittest.mock import patch, MagicMock, mock_open
import datetime
from pathlib import Path

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from data_fetcher import (
    DataFetcher, 
    GoogleFitDataError, 
    DataTypeNotSupportedError, 
    InvalidDateRangeError, 
    DataFetchError
)
import config

class TestDataFetcher(unittest.TestCase):
    """Tests pour la classe DataFetcher."""
    
    def setUp(self):
        """Configuration initiale pour chaque test."""
        # Créer un patch pour GoogleFitAuth
        self.auth_patch = patch('data_fetcher.GoogleFitAuth')
        self.mock_auth_class = self.auth_patch.start()
        
        # Créer une instance de mock pour l'authentification
        self.mock_auth = MagicMock()
        self.mock_auth_class.return_value = self.mock_auth
        
        # Créer un mock pour le service fitness
        self.mock_service = MagicMock()
        self.mock_auth.get_fitness_service.return_value = self.mock_service
        
        # Créer un mock pour la méthode aggregate de l'API
        self.mock_aggregate = MagicMock()
        self.mock_service.users().dataset().aggregate.return_value = self.mock_aggregate
        
        # Exemple de réponse API pour les tests
        self.sample_response = {
            "bucket": [
                {
                    "startTimeMillis": "1620000000000",
                    "endTimeMillis": "1620086400000",
                    "dataset": [
                        {
                            "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms",
                            "point": [
                                {
                                    "startTimeNanos": "1620000000000000000",
                                    "endTimeNanos": "1620086400000000000",
                                    "dataTypeName": "com.google.step_count.delta",
                                    "value": [
                                        {
                                            "intVal": 8000
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
        self.mock_aggregate.execute.return_value = self.sample_response
        
        # Créer une instance de DataFetcher avec le mock auth
        self.data_fetcher = DataFetcher(self.mock_auth)
        
    def tearDown(self):
        """Nettoyage après chaque test."""
        self.auth_patch.stop()
    
    def test_get_data_default_parameters(self):
        """Teste la récupération de données avec les paramètres par défaut."""
        # Appeler la méthode
        data = self.data_fetcher.get_data(data_types=["steps"])
        
        # Vérifier que les données sont récupérées
        self.assertIn("steps", data)
        self.mock_aggregate.execute.assert_called()
    
    def test_get_data_with_date_range(self):
        """Teste la récupération de données avec une plage de dates spécifiée."""
        # Définir des dates de test
        start_date = "2025-01-01"
        end_date = "2025-01-10"
        
        # Appeler la méthode
        data = self.data_fetcher.get_data(
            data_types=["steps"],
            start_date=start_date,
            end_date=end_date
        )
        
        # Vérifier les appels
        self.assertIn("steps", data)
        
        # Vérifier que aggregate a été appelé avec les bons paramètres
        call_kwargs = self.mock_service.users().dataset().aggregate.call_args[1]
        self.assertEqual(call_kwargs["userId"], "me")
        
        # Vérifier que le corps contient les bonnes dates
        body = call_kwargs["body"]
        self.assertIn("startTimeMillis", body)
        self.assertIn("endTimeMillis", body)
    
    def test_get_data_with_days(self):
        """Teste la récupération de données avec un nombre de jours spécifié."""
        # Appeler la méthode avec 7 jours
        data = self.data_fetcher.get_data(data_types=["steps"], days=7)
        
        # Vérifier que les données sont récupérées
        self.assertIn("steps", data)
        
        # Vérifier que aggregate a été appelé avec les bons paramètres
        call_kwargs = self.mock_service.users().dataset().aggregate.call_args[1]
        body = call_kwargs["body"]
        self.assertIn("startTimeMillis", body)
        self.assertIn("endTimeMillis", body)
    
    def test_get_data_with_activity_types(self):
        """Teste la récupération de données avec des types d'activités spécifiés."""
        # Appeler la méthode avec des types d'activités
        data = self.data_fetcher.get_data(
            data_types=["activity_segment"],
            activity_types=["running", "walking"]
        )
        
        # Vérifier que les données sont récupérées
        self.assertIn("activity_segment", data)
        
        # Vérifier que aggregate a été appelé avec les bons paramètres
        call_kwargs = self.mock_service.users().dataset().aggregate.call_args[1]
        body = call_kwargs["body"]
        self.assertIn("filteredDataQualityStandard", body)
    
    def test_get_data_invalid_data_type(self):
        """Teste la levée d'une exception pour un type de données invalide."""
        # Appeler la méthode avec un type de données invalide
        with self.assertRaises(DataTypeNotSupportedError):
            self.data_fetcher.get_data(data_types=["invalid_type"])
    
    def test_get_data_invalid_activity_type(self):
        """Teste la levée d'une exception pour un type d'activité invalide."""
        # Appeler la méthode avec un type d'activité invalide
        with self.assertRaises(DataTypeNotSupportedError):
            self.data_fetcher.get_data(
                data_types=["steps"],
                activity_types=["invalid_activity"]
            )
    
    def test_prepare_date_range_days(self):
        """Teste la préparation de la plage de dates avec un nombre de jours."""
        # Appeler la méthode avec un nombre de jours
        start_time, end_time = self.data_fetcher._prepare_date_range(days=7)
        
        # Vérifier que la différence est bien de 7 jours
        delta = end_time - start_time
        self.assertEqual(delta.days, 7)
    
    def test_prepare_date_range_invalid_days(self):
        """Teste la levée d'une exception pour un nombre de jours invalide."""
        # Appeler la méthode avec un nombre de jours invalide
        with self.assertRaises(InvalidDateRangeError):
            self.data_fetcher._prepare_date_range(days=0)
            
        with self.assertRaises(InvalidDateRangeError):
            self.data_fetcher._prepare_date_range(days=config.MAX_DAYS + 1)
    
    def test_prepare_date_range_explicit_dates(self):
        """Teste la préparation de la plage de dates avec des dates explicites."""
        # Définir des dates de test
        start_date = "2025-01-01"
        end_date = "2025-01-10"
        
        # Appeler la méthode avec les dates explicites
        start_time, end_time = self.data_fetcher._prepare_date_range(
            start_date=start_date,
            end_date=end_date
        )
        
        # Vérifier les résultats
        self.assertEqual(start_time.year, 2025)
        self.assertEqual(start_time.month, 1)
        self.assertEqual(start_time.day, 1)
        
        self.assertEqual(end_time.year, 2025)
        self.assertEqual(end_time.month, 1)
        self.assertEqual(end_time.day, 10)
    
    def test_prepare_date_range_invalid_range(self):
        """Teste la levée d'une exception pour une plage de dates invalide."""
        # Appeler la méthode avec une plage de dates invalide (fin avant début)
        with self.assertRaises(InvalidDateRangeError):
            self.data_fetcher._prepare_date_range(
                start_date="2025-01-10",
                end_date="2025-01-01"
            )
    
    def test_parse_datetime_valid(self):
        """Teste l'analyse d'une date valide."""
        # Appeler la méthode avec une chaîne de date valide
        dt = self.data_fetcher._parse_datetime("2025-01-01")
        
        # Vérifier le résultat
        self.assertEqual(dt.year, 2025)
        self.assertEqual(dt.month, 1)
        self.assertEqual(dt.day, 1)
    
    def test_parse_datetime_invalid(self):
        """Teste la levée d'une exception pour une date invalide."""
        # Appeler la méthode avec une chaîne de date invalide
        with self.assertRaises(InvalidDateRangeError):
            self.data_fetcher._parse_datetime("not_a_date")
    
    def test_format_data(self):
        """Teste le formatage des données brutes."""
        # Données de test
        raw_data = [
            {
                "dataset": [
                    {
                        "point": [
                            {
                                "startTimeNanos": "1620000000000000000",
                                "value": [
                                    {
                                        "intVal": 8000
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
        
        # Appeler la méthode
        start_time = datetime.datetime(2025, 1, 1)
        formatted_data = self.data_fetcher._format_data(raw_data, "steps", start_time, 7)
        
        # Vérifier le résultat
        self.assertEqual(len(formatted_data), 7)
        self.assertEqual(formatted_data[0]["type"], "steps")
    
    def test_get_activity_summary(self):
        """Teste la récupération du résumé d'activité."""
        # Configurer le mock pour renvoyer des données pour plusieurs types
        self.data_fetcher.get_data = MagicMock(return_value={
            "steps": [{"date": "2025-01-01", "value": 8000}],
            "calories": [{"date": "2025-01-01", "value": 2000}],
            "distance": [{"date": "2025-01-01", "value": 5.0}],
            "activity_segment": []
        })
        
        # Appeler la méthode
        summary = self.data_fetcher.get_activity_summary(days=1)
        
        # Vérifier le résultat
        self.assertEqual(summary["totals"]["steps"], 8000)
        self.assertEqual(summary["totals"]["calories"], 2000)
        self.assertEqual(summary["totals"]["distance"], 5.0)
    
    @patch('data_fetcher.DataFetcher.get_data')
    def test_get_detailed_activity(self, mock_get_data):
        """Teste la récupération des activités détaillées."""
        # Configurer le mock
        mock_get_data.return_value = {
            "activity_segment": [
                {
                    "date": "2025-01-01",
                    "value": 30,
                    "activity_type": "running"
                }
            ]
        }
        
        # Appeler la méthode
        activities = self.data_fetcher.get_detailed_activity(activity_type="running")
        
        # Vérifier le résultat
        self.assertEqual(len(activities), 1)
        self.assertEqual(activities[0]["type"], "running")
        self.assertEqual(activities[0]["duration_minutes"], 30)
    
    @patch('data_fetcher.DataFetcher.get_data')
    def test_get_heart_rate_data(self, mock_get_data):
        """Teste la récupération des données de fréquence cardiaque."""
        # Configurer le mock
        mock_get_data.return_value = {
            "heart_rate": [
                {"date": "2025-01-01", "value": 70},
                {"date": "2025-01-02", "value": 75},
                {"date": "2025-01-03", "value": 80}
            ]
        }
        
        # Appeler la méthode
        hr_data = self.data_fetcher.get_heart_rate_data()
        
        # Vérifier le résultat
        self.assertEqual(hr_data["statistics"]["average"], 75)
        self.assertEqual(hr_data["statistics"]["min"], 70)
        self.assertEqual(hr_data["statistics"]["max"], 80)
    
    def test_transform_data_for_timeline(self):
        """Teste la transformation des données pour la chronologie."""
        # Données de test
        data = {
            "steps": [
                {"date": "2025-01-01", "value": 8000, "type": "steps"},
                {"date": "2025-01-02", "value": 9000, "type": "steps"}
            ],
            "calories": [
                {"date": "2025-01-01", "value": 2000, "type": "calories"},
                {"date": "2025-01-02", "value": 2200, "type": "calories"}
            ]
        }
        
        # Appeler la méthode
        timeline = self.data_fetcher.transform_data_for_timeline(data)
        
        # Vérifier le résultat
        self.assertEqual(len(timeline), 2)
        self.assertEqual(timeline[0]["date"], "2025-01-01")
        self.assertEqual(timeline[0]["metrics"]["steps"]["value"], 8000)
        self.assertEqual(timeline[1]["metrics"]["calories"]["value"], 2200)

if __name__ == "__main__":
    unittest.main()

