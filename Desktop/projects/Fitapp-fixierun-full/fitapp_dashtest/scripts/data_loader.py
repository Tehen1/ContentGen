#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Data loading and preprocessing module for cycling location history data.
"""

import json
import os
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, Optional, Union


def load_geopoints(file_path: str) -> pd.DataFrame:
    """
    Load geolocation data from a JSON file into a pandas DataFrame.
    
    Args:
        file_path: Path to the JSON file containing location history
        
    Returns:
        DataFrame containing the location data or an empty DataFrame if loading fails
    """
    try:
        with open(file_path, "r") as f:
            data = json.load(f)
        
        # Check if the data is in the expected format (with 'locations' key)
        if isinstance(data, dict) and 'locations' in data:
            df = pd.DataFrame(data['locations'])
        else:
            # If data is directly a list of locations
            df = pd.DataFrame(data)
            
        print(f"Data loaded successfully: {len(df)} records")
        print(f"Columns: {df.columns.tolist()}")
        return df
    
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
        return pd.DataFrame()
    except json.JSONDecodeError:
        print(f"Error: Unable to decode JSON from {file_path}")
        return pd.DataFrame()
    except Exception as e:
        print(f"Unexpected error while loading {file_path}: {e}")
        return pd.DataFrame()


def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocess the location history DataFrame.
    
    Preprocessing steps include:
    - Converting timestamps to datetime objects
    - Calculating duration between start and end times
    - Ensuring coordinates are properly formatted (handling E7 format)
    - Converting columns to appropriate numeric types
    
    Args:
        df: DataFrame containing raw location history data
        
    Returns:
        Preprocessed DataFrame
    """
    if df.empty:
        print("Warning: Empty DataFrame, preprocessing skipped.")
        return df

    # Create a copy to avoid modifying the original
    processed_df = df.copy()
    
    # Convert timestamp strings to datetime objects
    for col in ['start_time', 'end_time', 'timestamp']:
        if col in processed_df.columns:
            processed_df[col] = pd.to_datetime(processed_df[col], errors='coerce')
    
    # Calculate duration in minutes if start_time and end_time exist
    if 'start_time' in processed_df.columns and 'end_time' in processed_df.columns:
        # Ensure both columns are datetime
        processed_df['start_time'] = pd.to_datetime(processed_df['start_time'], errors='coerce')
        processed_df['end_time'] = pd.to_datetime(processed_df['end_time'], errors='coerce')
        
        # Calculate duration only if both timestamps are valid
        valid_times = processed_df['start_time'].notna() & processed_df['end_time'].notna()
        processed_df.loc[valid_times, 'duration_minutes'] = (
            (processed_df.loc[valid_times, 'end_time'] - 
             processed_df.loc[valid_times, 'start_time']).dt.total_seconds() / 60
        )
        
        # Replace NaN durations with 0 or other appropriate value
        processed_df['duration_minutes'] = processed_df['duration_minutes'].fillna(0)
    
    # Handle coordinates - check for all possible coordinate formats
    try:
        # Check all possible coordinate formats
        has_e7_format = 'latitudeE7' in processed_df.columns and 'longitudeE7' in processed_df.columns
        has_regular_coords = 'latitude' in processed_df.columns and 'longitude' in processed_df.columns
        has_coordinates_column = 'coordinates' in processed_df.columns
        has_start_coordinates = 'start_coordinates' in processed_df.columns
        
        # First, check if we already have latitude/longitude columns
        if has_regular_coords:
            processed_df['latitude'] = pd.to_numeric(processed_df['latitude'], errors='coerce')
            processed_df['longitude'] = pd.to_numeric(processed_df['longitude'], errors='coerce')
            print("Using existing latitude/longitude columns")
        
        # Next, try E7 format if available
        elif has_e7_format:
            processed_df['latitudeE7'] = pd.to_numeric(processed_df['latitudeE7'], errors='coerce')
            processed_df['longitudeE7'] = pd.to_numeric(processed_df['longitudeE7'], errors='coerce')
            
            processed_df['latitude'] = processed_df['latitudeE7'] / 1e7
            processed_df['longitude'] = processed_df['longitudeE7'] / 1e7
            print("Converted E7 coordinates to decimal degrees")
        
        # Next, try 'coordinates' column
        elif has_coordinates_column:
            print("Found 'coordinates' column - attempting to extract latitude/longitude")
            
            # Try to extract coordinates from the 'coordinates' column
            # First, check if it's a string that needs parsing
            if isinstance(processed_df['coordinates'].iloc[0], str):
                processed_df['coordinates'] = processed_df['coordinates'].apply(
                    lambda x: json.loads(x.replace("'", '"')) if isinstance(x, str) else x
                )
            
            # Extract latitude and longitude
            processed_df['longitude'] = processed_df['coordinates'].apply(
                lambda x: x[0] if isinstance(x, list) and len(x) >= 2 else np.nan
            )
            processed_df['latitude'] = processed_df['coordinates'].apply(
                lambda x: x[1] if isinstance(x, list) and len(x) >= 2 else np.nan
            )
            print("Successfully extracted latitude/longitude from 'coordinates' column")
        
        # Next, try 'start_coordinates' column
        elif has_start_coordinates:
            print("Found 'start_coordinates' column - attempting to extract latitude/longitude")
            
            # Try to parse if it's a string
            if isinstance(processed_df['start_coordinates'].iloc[0], str):
                processed_df['start_coordinates'] = processed_df['start_coordinates'].apply(
                    lambda x: json.loads(x.replace("'", '"')) if isinstance(x, str) else x
                )
            
            # Extract latitude and longitude
            processed_df['longitude'] = processed_df['start_coordinates'].apply(
                lambda x: x[0] if isinstance(x, list) and len(x) >= 2 else np.nan
            )
            processed_df['latitude'] = processed_df['start_coordinates'].apply(
                lambda x: x[1] if isinstance(x, list) and len(x) >= 2 else np.nan
            )
            print("Successfully extracted latitude/longitude from 'start_coordinates' column")
        
        # If we don't have any coordinates, print an error
        else:
            print("Error: No coordinate columns found in the data.")
            print(f"Available columns: {processed_df.columns.tolist()}")
            # Create dummy coordinates to allow processing to continue
            processed_df['latitude'] = np.nan
            processed_df['longitude'] = np.nan
    except Exception as e:
        print(f"Error processing coordinates: {e}")
        # Create dummy coordinates to allow processing to continue
        if 'latitude' not in processed_df.columns:
            processed_df['latitude'] = np.nan
        if 'longitude' not in processed_df.columns:
            processed_df['longitude'] = np.nan
    
    # Convert other numeric columns
    numeric_cols = ['distance', 'elevation', 'speed', 'heart_rate']
    for col in numeric_cols:
        if col in processed_df.columns:
            processed_df[col] = pd.to_numeric(processed_df[col], errors='coerce')
    
    # Check if we have valid coordinates before dropping rows
    has_valid_coords = processed_df['latitude'].notna().any() and processed_df['longitude'].notna().any()
    if has_valid_coords:
        # Drop rows with missing essential data (latitude/longitude)
        original_count = len(processed_df)
        processed_df = processed_df.dropna(subset=['latitude', 'longitude'])
        dropped_count = original_count - len(processed_df)
        if dropped_count > 0:
            print(f"Dropped {dropped_count} rows with missing coordinates")
    else:
        print("Warning: No valid coordinates found. Using dummy coordinates for visualization.")
        # Create dummy coordinates for all rows
        processed_df['latitude'] = 0.0
        processed_df['longitude'] = 0.0
    
    # Print summary of the preprocessing results
    print(f"Preprocessing complete: {len(processed_df)} valid records")
    
    return processed_df


def load_and_preprocess(file_path: str) -> pd.DataFrame:
    """
    Convenience function to load and preprocess data in one step.
    
    Args:
        file_path: Path to the JSON file containing location history
        
    Returns:
        Preprocessed DataFrame
    """
    raw_df = load_geopoints(file_path)
    if not raw_df.empty:
        return preprocess_data(raw_df)
    return raw_df


if __name__ == "__main__":
    # Example usage
    # Adjust the path based on your project structure
    default_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                               "data", "location_history_enriched_copy.json")
    
    # Get the actual path by checking if the default path exists
    if os.path.exists(default_path):
        print(f"Loading data from: {default_path}")
        df = load_and_preprocess(default_path)
        
        if not df.empty:
            print("\nDataFrame Summary:")
            print(f"Shape: {df.shape}")
            print("\nHead:")
            print(df.head(3))
            print("\nData Types:")
            print(df.dtypes)
    else:
        print(f"Default data file not found at: {default_path}")
        print("Please specify the correct path to the data file.")

