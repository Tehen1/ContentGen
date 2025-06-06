#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Advanced data import processors for multiple file formats.
Supports: JSON (Google Takeout), GPX, FIT, and CSV formats.
"""

import json
import pandas as pd
import numpy as np
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Dict

def process_google_takeout(file_path: str) -> pd.DataFrame:
    """
    Process Google Takeout JSON files (location history or fit data).
    
    Args:
        file_path: Path to the JSON file
        
    Returns:
        DataFrame with processed data
    """
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        # Check if this is location history or fit data
        if 'locations' in data:
            return process_location_history(data)
        elif 'activities' in data:
            return process_fit_activities(data)
        else:
            print(f"Unknown Google Takeout format in: {file_path}")
            return pd.DataFrame()
    except Exception as e:
        print(f"Error processing Google Takeout file: {e}")
        return pd.DataFrame()

def process_location_history(data: Dict) -> pd.DataFrame:
    """Process Google Location History format"""
    records = []
    
    # Extract location data
    for location in data.get('locations', []):
        # Convert from E7 format to decimal
        lat = location.get('latitudeE7', 0) / 1e7
        lon = location.get('longitudeE7', 0) / 1e7
        
        # Convert timestamp
        timestamp_ms = int(location.get('timestampMs', 0))
        timestamp = datetime.fromtimestamp(timestamp_ms / 1000)
        
        # Extract activity type if available
        activity = location.get('activity', [])
        activity_type = None
        confidence = None
        
        for act in activity:
            for item in act.get('activity', []):
                if item.get('type') == 'CYCLING':
                    activity_type = 'cycling'
                    confidence = item.get('confidence', 0)
                    break
            
            if activity_type:
                break
        
        # Only include cycling activities
        if activity_type == 'cycling':
            records.append({
                'timestamp': timestamp,
                'latitude': lat,
                'longitude': lon,
                'activity_type': activity_type,
                'confidence': confidence
            })
    
    return pd.DataFrame(records)

def process_fit_activities(data: Dict) -> pd.DataFrame:
    """Process Google Fit activities format"""
    records = []
    
    for activity in data.get('activities', []):
        if activity.get('activity_type') == 'cycling':
            # Extract heart rate data if available
            heart_rates = []
            for point in activity.get('heart_rate_points', []):
                bpm = point.get('bpm', 0)
                if bpm > 0:
                    time_ms = point.get('timestamp_ms', 0)
                    time = datetime.fromtimestamp(time_ms / 1000)
                    heart_rates.append((time, bpm))
            
            # Extract basic activity data
            start_time = datetime.fromtimestamp(activity.get('start_time_ms', 0) / 1000)
            end_time = datetime.fromtimestamp(activity.get('end_time_ms', 0) / 1000)
            
            records.append({
                'start_time': start_time,
                'end_time': end_time,
                'activity_type': 'cycling',
                'distance_km': activity.get('distance_km', 0),
                'duration_minutes': activity.get('duration_min', 0),
                'calories': activity.get('calories', 0),
                'heart_rate_data': heart_rates
            })
    
    return pd.DataFrame(records)

def parse_gpx_file(file_path: str) -> pd.DataFrame:
    """
    Parse GPX file into a DataFrame.
    
    Args:
        file_path: Path to the GPX file
        
    Returns:
        DataFrame with processed data
    """
    try:
        # Parse the GPX file
        tree = ET.parse(file_path)
        root = tree.getroot()
        
        # Handle namespaces in GPX
        ns = {'gpx': 'http://www.topografix.com/GPX/1/1'}
        
        records = []
        
        # Extract track points
        for track in root.findall('.//gpx:trk', ns):
            track_name = track.find('gpx:name', ns)
            track_name = track_name.text if track_name is not None else "Unknown Track"
            
            for segment in track.findall('.//gpx:trkseg', ns):
                for point in segment.findall('.//gpx:trkpt', ns):
                    lat = float(point.get('lat', 0))
                    lon = float(point.get('lon', 0))
                    
                    elevation = point.find('.//gpx:ele', ns)
                    elevation = float(elevation.text) if elevation is not None else None
                    
                    time_elem = point.find('.//gpx:time', ns)
                    time_str = time_elem.text if time_elem is not None else None
                    
                    timestamp = None
                    if time_str:
                        timestamp = datetime.strptime(time_str, "%Y-%m-%dT%H:%M:%SZ")
                    
                    # Extract heart rate from extensions if available
                    hr = None
                    ext = point.find('.//gpx:extensions', ns)
                    if ext is not None:
                        hr_elem = ext.find('.//*[local-name()="hr"]')
                        if hr_elem is not None:
                            hr = int(hr_elem.text)
                    
                    records.append({
                        'timestamp': timestamp,
                        'latitude': lat,
                        'longitude': lon,
                        'elevation': elevation,
                        'heart_rate': hr,
                        'track_name': track_name
                    })
        
        # Create DataFrame
        df = pd.DataFrame(records)
        
        # Calculate distance between consecutive points
        if len(df) > 1 and 'latitude' in df.columns and 'longitude' in df.columns:
            df = calculate_distance_from_coordinates(df)
        
        return df
    
    except Exception as e:
        print(f"Error parsing GPX file: {e}")
        return pd.DataFrame()

def calculate_distance_from_coordinates(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate distance between consecutive GPS points"""
    from math import radians, sin, cos, sqrt, atan2
    
    def haversine(lat1, lon1, lat2, lon2):
        """Calculate distance between two points using Haversine formula"""
        # Convert lat/lon from degrees to radians
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        r = 6371  # Radius of Earth in kilometers
        return c * r
    
    # Initialize distance column
    df['segment_distance_km'] = 0.0
    
    # Calculate distance between consecutive points
    for i in range(1, len(df)):
        lat1, lon1 = df.iloc[i-1]['latitude'], df.iloc[i-1]['longitude']
        lat2, lon2 = df.iloc[i]['latitude'], df.iloc[i]['longitude']
        df.loc[df.index[i], 'segment_distance_km'] = haversine(lat1, lon1, lat2, lon2)
    
    # Calculate cumulative distance
    df['distance_km'] = df['segment_distance_km'].cumsum()
    
    # Calculate speed if timestamp is available
    if 'timestamp' in df.columns:
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df['time_diff_sec'] = df['timestamp'].diff().dt.total_seconds()
        
        # Avoid division by zero
        df.loc[df['time_diff_sec'] > 0, 'speed_km_h'] = (
            df.loc[df['time_diff_sec'] > 0, 'segment_distance_km'] / 
            df.loc[df['time_diff_sec'] > 0, 'time_diff_sec'] * 3600
        )
    
    return df

def hampel_filter(data: pd.Series, window_size: int = 5, n_sigmas: int = 3) -> pd.Series:
    """
    Apply Hampel filter to remove outliers from time series data.
    
    Args:
        data: Series of data to filter
        window_size: Size of the rolling window
        n_sigmas: Number of standard deviations to use as threshold
        
    Returns:
        Filtered series
    """
    # Create copy of data
    filtered_data = data.copy()
    
    # Apply rolling median
    rolling_median = data.rolling(window=window_size, center=True).median()
    
    # Get median absolute deviation
    mad = np.abs(data - rolling_median).rolling(window=window_size, center=True).median()
    
    # Scale MAD (assuming normal distribution)
    threshold = n_sigmas * 1.4826 * mad
    
    # Identify outliers
    outliers = np.abs(data - rolling_median) > threshold
    
    # Replace outliers with median
    filtered_data[outliers] = rolling_median[outliers]
    
    return filtered_data

