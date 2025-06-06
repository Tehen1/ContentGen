"""
Data loading functions for fitness dashboard.
"""
import os
import pandas as pd
from defusedxml import ElementTree as ET
import logging
import json
import random
from datetime import datetime
import streamlit as st
from pathlib import Path

from config import DATA_CONFIG, get_data_path, DATA_DIR, ACTIVITIES_DIR

NUMERIC_COLUMNS = [
    'Points cardio',
    'Minutes cardio',
    'Distance (m)',
    'Nombre de pas',
    'Durée de l\'activité "Marche à pied" (ms)',
    'Durée de l\'activité "Vélo" (ms)',
    'Durée de l\'activité "Course à pied" (ms)'
]

def custom_date_parser(date_str: str) -> datetime:
    """
    Custom parser to handle various date formats including those with timezone info.
    """
    try:
        # Try parsing as a complete datetime with timezone
        return pd.to_datetime(date_str, format='mixed')
    except ValueError:
        try:
            # Try parsing as a simple datetime
            return pd.to_datetime(date_str)
        except ValueError:
            # Return NaT for unparseable dates
            return pd.NaT

@st.cache_data
def parse_tcx_file(file_path):
    """Parse TCX file and extract activity data."""
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
        ns = {'ns': 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2'}

        activity = root.find('.//ns:Activity', ns)
        if activity is None:
            return None

        activity_type = activity.get('Sport')

        trackpoints = []
        for trackpoint in activity.findall('.//ns:Trackpoint', ns):
            time = trackpoint.find('ns:Time', ns).text
            position = trackpoint.find('ns:Position', ns)
            if position is not None:
                lat = float(position.find('ns:LatitudeDegrees', ns).text)
                lon = float(position.find('ns:LongitudeDegrees', ns).text)
                trackpoints.append({
                    'time': pd.to_datetime(time),
                    'latitude': lat,
                    'longitude': lon
                })

        return {
            'type': activity_type,
            'trackpoints': trackpoints,
            'date': trackpoints[0]['time'].date() if trackpoints else None
        }
    except FileNotFoundError as e:
        logging.error(f"TCX file not found: {file_path}")
        raise FileNotFoundError(f"Could not find TCX file: {file_path}") from e
    except Exception as e:
        logging.error(f"Error processing TCX data: {str(e)}")
        raise RuntimeError(f"Error processing TCX file: {str(e)}") from e

@st.cache_data
def load_tcx_data():
    """Load and process all TCX files from the Activités directory."""
    tcx_files = ACTIVITIES_DIR.glob("*.tcx")
    activities = []

    for file in tcx_files:
        activity_data = parse_tcx_file(file)
        if activity_data:
            activities.append(activity_data)

    if activities:
        return pd.DataFrame(activities)
    return pd.DataFrame()

@st.cache_data
def load_activity_data(file_path: str) -> pd.DataFrame:
    """
    Load activity data from CSV file with proper column handling.
    """
    try:
        # Read CSV with basic configuration
        df = pd.read_csv(
            file_path,
            encoding='utf-8'
        )

        # Convert date column
        df['Heure de début'] = pd.to_datetime(df['Heure de début'], format='mixed', utc=True)
        df['Date'] = pd.to_datetime(df['Heure de début'].dt.date)  # Convert to datetime for consistency

        # Define all possible activity columns
        activity_columns = [
            'Durée de l\'activité "Marche à pied" (ms)',
            'Durée de l\'activité "Vélo" (ms)',
            'Durée de l\'activité "Course à pied" (ms)',
            'Durée de l\'activité "walking" (ms)',
            'Durée de l\'activité "cycling" (ms)',
            'Durée de l\'activité "running" (ms)'
        ]

        # Add missing columns with 0s
        for col in activity_columns:
            if col not in df.columns:
                print(f"Colonne '{col}' non trouvée. Initialisée à 0.")
                df[col] = 0

        # Calculate total duration
        duration_columns = [col for col in activity_columns if col in df.columns]
        df['Duration'] = df[duration_columns].sum(axis=1)

        return df

    except FileNotFoundError as e:
        logging.error(f"File not found: {file_path}")
        raise FileNotFoundError(f"Could not find file: {file_path}") from e
    except Exception as e:
        logging.error(f"Error loading data: {str(e)}")
        raise RuntimeError(f"Error processing file: {str(e)}") from e

@st.cache_data
def load_json_data(file_path: str) -> pd.DataFrame:
    """
    Load activity data from JSON file and ensure necessary columns for compatibility.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if 'Data Points' in data and isinstance(data['Data Points'], list):
            processed_data = []
            for point in data['Data Points']:
                start_time_ns = point.get('startTimeNanos')
                end_time_ns = point.get('endTimeNanos')

                if start_time_ns is not None and end_time_ns is not None:
                    start_time = pd.to_datetime(start_time_ns, unit='ns', utc=True)
                    end_time = pd.to_datetime(end_time_ns, unit='ns', utc=True)
                    # Extract the value, defaulting to 0 if not found or if the structure is unexpected
                    fit_value = point.get('fitValue', [{}])
                    value = fit_value[0].get('intVal', 0) if fit_value else 0

                    data_point = {
                        'Heure de début': start_time,
                        'Heure de fin': end_time,
                        'Points cardio': 0,          # Initialize to 0
                        'Minutes cardio': 0,       # Initialize to 0
                        'Distance (m)': 0,        # Initialize to 0
                        'Nombre de pas': 0,        # Initialize to 0
                        'Date': start_time.date()  # Use 'Date' for consistency
                    }

                    # Map data based on dataTypeName
                    data_type = point.get('dataTypeName')
                    if data_type == 'com.google.active_minutes':
                        data_point['Minutes cardio'] = value
                    elif data_type == 'com.google.step_count.delta':
                        data_point['Nombre de pas'] = value
                    elif data_type == 'com.google.distance.delta':
                        data_point['Distance (m)'] = value
                    # Add more mappings as needed for other data types

                    processed_data.append(data_point)

                else:
                    print(f"Skipping data point due to missing timestamp in file: {file_path}")

            if processed_data:
                return pd.DataFrame(processed_data)
            else:
                print(f"No valid data points found in file: {file_path}")
                return pd.DataFrame()

        else:
            print(f"No 'Data Points' found or invalid format in file: {file_path}")
            return pd.DataFrame()
    except Exception as e:
        logging.error(f"Error loading JSON data from {file_path}: {str(e)}")
        raise RuntimeError(f"Error processing JSON file {file_path}: {str(e)}") from e

@st.cache_data
def load_all_data(directory: str) -> pd.DataFrame:
    """
    Load all activity data from CSV and JSON files in directory.
    """
    all_data = []

    try:
        # Get all CSV and JSON files
        files = [f for f in os.listdir(directory) if f.endswith('.csv') or f.endswith('.json')]

        for file_name in files:
            file_path = os.path.join(directory, file_name)

            try:
                if file_name.endswith('.csv'):
                    df = load_activity_data(file_path)
                else:
                    df = load_json_data(file_path)

            except Exception as e:
                logging.error(f"Error loading file {file_path}: {str(e)}")
                st.warning(f"Fichier ignoré: {file_name}")
                continue

            if not df.empty:
                all_data.append(df)
    except Exception as e:
        logging.error(f"Error listing directory {directory}: {str(e)}")

    if all_data:
        return pd.concat(all_data, ignore_index=True)

    # If no data was loaded, return a sample DataFrame with required columns
    st.warning("Aucune donnée trouvée. Utilisation d'un jeu de données d'exemple.")
    sample_df = pd.DataFrame({
        'Date': [pd.Timestamp('today') - pd.Timedelta(days=i) for i in range(10)],
        'Points cardio': [random.randint(50, 100) for _ in range(10)],
        'Minutes cardio': [random.randint(30, 60) for _ in range(10)],
        'Distance (m)': [random.randint(2000, 5000) for _ in range(10)],
        'Nombre de pas': [random.randint(5000, 10000) for _ in range(10)],
        'walking_minutes': [random.randint(20, 40) for _ in range(10)],
        'cycling_minutes': [random.randint(10, 30) for _ in range(10)],
        'running_minutes': [random.randint(5, 15) for _ in range(10)]
    })
    return sample_df

@st.cache_data
def load_data():
    """Load and preprocess the activity data."""
    try:
        is_local = os.path.exists(DATA_DIR)
        data_path = get_data_path(is_local)
        df = load_all_data(data_path)

        # Handle numeric conversions safely
        for col in NUMERIC_COLUMNS:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
            else:
                df[col] = 0
                st.warning(f"Colonne '{col}' non trouvée. Initialisée à 0.")

        # Convert distance to kilometers
        df['Distance (km)'] = df.get('Distance (m)', 0) / 1000

        # Ensure activity minutes columns are present and calculated
        for activity in ['walking', 'cycling', 'running']:
            minutes_col = f"{activity}_minutes"
            if minutes_col not in df.columns:
              df[minutes_col] = 0

        # Calculate total active minutes
        df['Nombre de minutes actives'] = df['walking_minutes'] + df['cycling_minutes'] + df['running_minutes']
        print("Data types in load_data():")  # Debug print
        print(df.dtypes)                   # Debug print

        return df

    except Exception as e:
        logging.error(f"Error loading data: {str(e)}")
        raise RuntimeError(f"Error processing data: {str(e)}") from e
