#!/usr/bin/env python3
"""
Script d'exécution des tests pour le module Google Fit.

Ce script découvre et exécute tous les tests du module Google Fit,
avec des options pour la verbosité et la sélection de tests spécifiques.
"""

import os
import sys
import unittest
import argparse
import time
from datetime import datetime

# Assurez-vous que le dossier parent est dans le chemin de recherche
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


def discover_tests(pattern=None, test_dir=None):
    """
    Découvre les tests dans le répertoire spécifié.
    
    Args:
        pattern: Motif pour filtrer les tests
        test_dir: Répertoire contenant les tests
        
    Returns:
        TestSuite: Suite de tests découverts
    """
    if test_dir is None:
        test_dir = os.path.dirname(os.path.abspath(__file__))
        
    if pattern is None:
        pattern = 'test_*.py'
        
    loader = unittest.TestLoader()
    suite = loader.discover(test_dir, pattern=pattern)
    
    return suite


def run_tests(suite, verbosity=1):
    """
    Exécute la suite de tests et retourne les résultats.
    
    Args:
        suite: Suite de tests à exécuter
        verbosity: Niveau de verbosité pour la sortie
        
    Returns:
        TestResult: Résultats des tests
    """
    runner = unittest.TextTestRunner(verbosity=verbosity)
    return runner.run(suite)


def print_report(result, execution_time):
    """
    Affiche un rapport détaillé des résultats des tests.
    
    Args:
        result: Résultats des tests
        execution_time: Temps d'exécution en secondes
    """
    print("\n" + "=" * 70)
    print(f"RAPPORT D'EXÉCUTION DES TESTS ({datetime.now().strftime('%Y-%m-%d %H:%M:%S')})")
    print("=" * 70)
    
    # Résumé
    print(f"\nRésumé:")
    print(f"  Tests exécutés: {result.testsRun}")
    print(f"  Réussis: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"  Échecs: {len(result.failures)}")
    print(f"  Erreurs: {len(result.errors)}")
    print(f"  Temps d'exécution: {execution_time:.2f} secondes")
    
    # Détails des échecs
    if result.failures:
        print("\nDétails des échecs:")
        for i, (test, traceback) in enumerate(result.failures, 1):
            print(f"\n  {i}. {test}")
            print(f"  {'-' * 40}")
            print(f"  {traceback.split('Traceback')[0].strip()}")
    
    # Détails des erreurs
    if result.errors:
        print("\nDétails des erreurs:")
        for i, (test, traceback) in enumerate(result.errors, 1):
            print(f"\n  {i}. {test}")
            print(f"  {'-' * 40}")
            print(f"  {traceback.split('Traceback')[0].strip()}")
    
    # Résultat global
    print("\n" + "=" * 70)
    if result.wasSuccessful():
        print("SUCCÈS: Tous les tests ont réussi!")
    else:
        print(f"ÉCHEC: {len(result.failures) + len(result.errors)} test(s) ont échoué.")
    print("=" * 70 + "\n")


def main():
    """
    Fonction principale qui analyse les arguments de ligne de commande,
    découvre et exécute les tests, puis génère un rapport.
    """
    parser = argparse.ArgumentParser(description="Exécute les tests pour le module Google Fit.")
    
    parser.add_argument(
        '-v', '--verbose',
        action='count',
        default=1,
        help="Augmente la verbosité (peut être répété pour augmenter davantage)"
    )
    
    parser.add_argument(
        '-p', '--pattern',
        default='test_*.py',
        help="Motif pour découvrir les tests (par défaut: 'test_*.py')"
    )
    
    parser.add_argument(
        '-m', '--module',
        choices=['auth', 'data_fetcher', 'all'],
        default='all',
        help="Module spécifique à tester (auth, data_fetcher ou all)"
    )
    
    args = parser.parse_args()
    
    # Ajuster le motif en fonction du module sélectionné
    if args.module != 'all':
        args.pattern = f'test_{args.module}.py'
    
    print(f"Découverte des tests avec le motif: {args.pattern}")
    suite = discover_tests(args.pattern)
    
    print(f"Exécution des tests avec verbosité: {args.verbose}")
    start_time = time.time()
    result = run_tests(suite, args.verbose)
    execution_time = time.time() - start_time
    
    print_report(result, execution_time)
    
    # Utiliser un code de sortie approprié
    return 0 

