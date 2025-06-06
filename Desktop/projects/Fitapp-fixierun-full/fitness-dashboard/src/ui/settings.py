"""
Settings UI components for the fitness dashboard.

This module provides functions to create the settings panel and handle user preferences.
"""

import streamlit as st
import pandas as pd
import os
from datetime import datetime
from typing import Dict, List, Tuple, Optional, Any

def create_settings_section() -> Dict[str, Any]:
    """
    Create the settings section with user preferences.

    Returns:
        Dict[str, Any]: Dictionary of user settings
    """
    st.header("Paramètres")

    # Initialize settings if not in session state
    if 'settings' not in st.session_state:
        st.session_state.settings = load_default_settings()

    # Create tabs for different settings categories
    settings_tabs = st.tabs(["Général", "Données", "Affichage", "Utilisateur"])

    with settings_tabs[0]:
        create_general_settings()

    with settings_tabs[1]:
        create_data_settings()

    with settings_tabs[2]:
        create_display_settings()

    with settings_tabs[3]:
        create_user_settings()

    # Return current settings
    return st.session_state.settings

def load_default_settings() -> Dict[str, Any]:
    """
    Load default settings.

    Returns:
        Dict[str, Any]: Dictionary of default settings
    """
    return {
        # General settings
        'language': 'fr',
        'date_format': '%Y-%m-%d',
        'distance_unit': 'km',

        # Data settings
        'data_source': 'local',
        'auto_sync': False,
        'sync_frequency': 'daily',
        'tcx_directories': [],

        # Display settings
        'theme': 'light',
        'graph_style': 'default',
        'show_tooltips': True,
        'map_style': 'streets',

        # User settings
        'user_name': '',
        'birth_year': 1990,
        'weight': 70,
        'height': 175,
        'gender': 'not_specified',
        'max_heart_rate': 190
    }

def create_general_settings() -> None:
    """Create general settings section."""
    st.subheader("Paramètres Généraux")

    # Language selection
    st.session_state.settings['language'] = st.selectbox(
        "Langue",
        options=['fr', 'en'],
        index=0 if st.session_state.settings['language'] == 'fr' else 1
    )

    # Date format selection
    date_formats = {
        '%Y-%m-%d': '2023-01-31',
        '%d/%m/%Y': '31/01/2023',
        '%m/%d/%Y': '01/31/2023',
        '%d %b %Y': '31 jan 2023'
    }

    selected_format = st.selectbox(
        "Format de Date",
        options=list(date_formats.keys()),
        format_func=lambda x: date_formats[x],
        index=list(date_formats.keys()).index(st.session_state.settings['date_format'])
            if st.session_state.settings['date_format'] in date_formats else 0
    )
    st.session_state.settings['date_format'] = selected_format

    # Distance unit selection
    st.session_state.settings['distance_unit'] = st.selectbox(
        "Unité de Distance",
        options=['km', 'mi'],
        index=0 if st.session_state.settings['distance_unit'] == 'km' else 1
    )

def create_data_settings() -> None:
    """Create data settings section."""
    st.subheader("Paramètres de Données")

    # Data source selection
    st.session_state.settings['data_source'] = st.selectbox(
        "Source de Données",
        options=['local', 'cloud', 'api'],
        index=['local', 'cloud', 'api'].index(st.session_state.settings['data_source'])
            if st.session_state.settings['data_source'] in ['local', 'cloud', 'api'] else 0
    )

    # Auto sync toggle
    st.session_state.settings['auto_sync'] = st.toggle(
        "Synchronisation Automatique",
        value=st.session_state.settings['auto_sync']
    )

    # Sync frequency selection (only shown if auto_sync is enabled)
    if st.session_state.settings['auto_sync']:
        st.session_state.settings['sync_frequency'] = st.selectbox(
            "Fréquence de Synchronisation",
            options=['hourly', 'daily', 'weekly'],
            format_func=lambda x: {'hourly': 'Toutes les heures', 'daily': 'Quotidienne', 'weekly': 'Hebdomadaire'}[x],
            index=['hourly', 'daily', 'weekly'].index(st.session_state.settings['sync_frequency'])
                if st.session_state.settings['sync_frequency'] in ['hourly', 'daily', 'weekly'] else 1
        )

    # TCX directories
    tcx_dirs = st.session_state.settings.get('tcx_directories', [])
    tcx_dirs_str = '\n'.join(tcx_dirs)

    new_tcx_dirs = st.text_area(
        "Répertoires TCX (un par ligne)",
        value=tcx_dirs_str,
        help="Entrez les chemins complets des répertoires contenant vos fichiers TCX, un par ligne."
    )

    # Update TCX directories
    st.session_state.settings['tcx_directories'] = [
        dir.strip() for dir in new_tcx_dirs.split('\n') if dir.strip()
    ]

    # Location history file
    location_history_file = st.session_state.settings.get('location_history_file', '')

    new_location_file = st.text_input(
        "Fichier d'historique de localisation",
        value=location_history_file,
        help="Entrez le chemin complet vers votre fichier d'historique de localisation JSON."
    )

    # Update location history file
    st.session_state.settings['location_history_file'] = new_location_file.strip()

def create_display_settings() -> None:
    """Create display settings section."""
    st.subheader("Paramètres d'Affichage")

    # Theme selection
    st.session_state.settings['theme'] = st.selectbox(
        "Thème",
        options=['light', 'dark', 'auto'],
        format_func=lambda x: {'light': 'Clair', 'dark': 'Sombre', 'auto': 'Automatique'}[x],
        index=['light', 'dark', 'auto'].index(st.session_state.settings['theme'])
            if st.session_state.settings['theme'] in ['light', 'dark', 'auto'] else 0
    )

    # Graph style selection
    st.session_state.settings['graph_style'] = st.selectbox(
        "Style des Graphiques",
        options=['default', 'fixie', 'minimal'],
        format_func=lambda x: {'default': 'Par défaut', 'fixie': 'Fixie', 'minimal': 'Minimal'}[x],
        index=['default', 'fixie', 'minimal'].index(st.session_state.settings['graph_style'])
            if st.session_state.settings['graph_style'] in ['default', 'fixie', 'minimal'] else 0
    )

    # Show tooltips toggle
    st.session_state.settings['show_tooltips'] = st.toggle(
        "Afficher les infobulles",
        value=st.session_state.settings['show_tooltips']
    )

    # Map style selection
    st.session_state.settings['map_style'] = st.selectbox(
        "Style de Carte",
        options=['streets', 'outdoors', 'satellite', 'light', 'dark'],
        format_func=lambda x: {
            'streets': 'Rues',
            'outdoors': 'Plein air',
            'satellite': 'Satellite',
            'light': 'Clair',
            'dark': 'Sombre'
        }[x],
        index=['streets', 'outdoors', 'satellite', 'light', 'dark'].index(st.session_state.settings['map_style'])
            if st.session_state.settings['map_style'] in ['streets', 'outdoors', 'satellite', 'light', 'dark'] else 0
    )

def create_user_settings() -> None:
    """Create user settings section."""
    st.subheader("Paramètres Utilisateur")

    # User name
    st.session_state.settings['user_name'] = st.text_input(
        "Nom",
        value=st.session_state.settings['user_name']
    )

    # Birth year
    st.session_state.settings['birth_year'] = st.number_input(
        "Année de naissance",
        min_value=1900,
        max_value=datetime.now().year,
        value=st.session_state.settings['birth_year'],
        step=1
    )

    # Weight
    st.session_state.settings['weight'] = st.number_input(
        "Poids (kg)",
        min_value=30,
        max_value=200,
        value=st.session_state.settings['weight'],
        step=1
    )

    # Height
    st.session_state.settings['height'] = st.number_input(
        "Taille (cm)",
        min_value=100,
        max_value=250,
        value=st.session_state.settings['height'],
        step=1
    )

    # Gender
    gender_options = {
        'male': 'Homme',
        'female': 'Femme',
        'not_specified': 'Non spécifié'
    }

    st.session_state.settings['gender'] = st.selectbox(
        "Genre",
        options=list(gender_options.keys()),
        format_func=lambda x: gender_options[x],
        index=list(gender_options.keys()).index(st.session_state.settings['gender'])
            if st.session_state.settings['gender'] in gender_options else 2
    )

    # Max heart rate
    default_max_hr = 220 - (datetime.now().year - st.session_state.settings['birth_year'])
    st.session_state.settings['max_heart_rate'] = st.number_input(
        "Fréquence cardiaque maximale (bpm)",
        min_value=120,
        max_value=230,
        value=st.session_state.settings['max_heart_rate'],
        help=f"La valeur par défaut basée sur l'âge est {default_max_hr} bpm."
    )

def save_settings(settings: Dict[str, Any]) -> bool:
    """
    Save settings to a file.

    Args:
        settings: Dictionary of settings to save

    Returns:
        bool: True if settings were saved successfully
    """
    try:
        import json

        # Create settings directory if it doesn't exist
        os.makedirs('settings', exist_ok=True)

        # Save settings to file
        with open('settings/user_settings.json', 'w') as f:
            json.dump(settings, f, indent=2)

        return True
    except Exception as e:
        st.error(f"Erreur lors de l'enregistrement des paramètres: {str(e)}")
        return False

def load_settings() -> Dict[str, Any]:
    """
    Load settings from a file.

    Returns:
        Dict[str, Any]: Dictionary of loaded settings
    """
    try:
        import json

        # Check if settings file exists
        if os.path.exists('settings/user_settings.json'):
            # Load settings from file
            with open('settings/user_settings.json', 'r') as f:
                return json.load(f)

        # Return default settings if file doesn't exist
        return load_default_settings()
    except Exception as e:
        st.error(f"Erreur lors du chargement des paramètres: {str(e)}")
        return load_default_settings()