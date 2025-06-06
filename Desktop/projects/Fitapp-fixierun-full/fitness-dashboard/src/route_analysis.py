"""
Route analysis module for fitness dashboard.

This module provides functions for analyzing cycling routes, creating route maps,
and visualizing route metrics.
"""

import folium
import folium.plugins
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import plotly.subplots as make_subplots
import numpy as np
from datetime import datetime, timedelta
import math
import random
from typing import Dict, List, Tuple, Optional, Any

# Constants for styling
ROUTE_COLORS = {
    'primary': '#FF5722',
    'secondary1': '#3F51B5',
    'secondary2': '#4CAF50',
    'secondary3': '#FFC107'
}

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two points using Haversine formula.

    Args:
        lat1: Latitude of point 1
        lon1: Longitude of point 1
        lat2: Latitude of point 2
        lon2: Longitude of point 2

    Returns:
        float: Distance in kilometers
    """
    R = 6371  # Earth radius in km
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_pace(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate pace and speed from GPS data if not already present.

    Args:
        df: DataFrame with GPS tracking data

    Returns:
        pd.DataFrame: DataFrame with added pace and speed columns
    """
    if len(df) < 2:
        return pd.DataFrame()

    df = df.copy()

    if 'elevation' in df.columns and 'time' in df.columns:
        df = df.rename(columns={
            'elevation': 'altitude',
            'time': 'timestamp'
        })

    if 'speed' not in df.columns or df['speed'].sum() == 0:
        df['time_diff'] = df['timestamp'].diff().dt.total_seconds()

        df['calculated_distance'] = 0.0
        df['calculated_speed'] = 0.0

        if len(df) > 1:
            for i in range(1, len(df)):
                if df.iloc[i]['time_diff'] > 0:
                    try:
                        if 'latitude' in df.columns and 'longitude' in df.columns:
                            distance = calculate_distance(
                                df.iloc[i-1]['latitude'], df.iloc[i-1]['longitude'],
                                df.iloc[i]['latitude'], df.iloc[i]['longitude']
                            )

                            df.at[i, 'calculated_distance'] = df.iloc[i-1]['calculated_distance'] + distance

                            df.at[i, 'calculated_speed'] = (distance / df.iloc[i]['time_diff']) * 3600
                    except:
                        df.at[i, 'calculated_distance'] = df.iloc[i-1]['calculated_distance'] + 0.01
                        df.at[i, 'calculated_speed'] = 20.0  # Default speed

        if 'distance' not in df.columns or df['distance'].sum() == 0:
            df['distance'] = df['calculated_distance']

        if 'speed' not in df.columns or df['speed'].sum() == 0:
            df['speed'] = df['calculated_speed']

        df = df.drop(['calculated_distance', 'calculated_speed'], axis=1, errors='ignore')

    return df

def create_route_map(track_df: pd.DataFrame) -> folium.Map:
    """
    Create an interactive map with activity route with color-coded speed and custom icons.

    Args:
        track_df: DataFrame with GPS tracking data

    Returns:
        folium.Map: Interactive map with the route
    """
    center_lat = track_df['latitude'].mean()
    center_lon = track_df['longitude'].mean()

    m = folium.Map(location=[center_lat, center_lon], zoom_start=13)

    # Create gradient color-coded segments based on speed
    if 'speed' in track_df.columns and len(track_df) > 1:
        # Normalize speeds for color gradient (0-100%)
        min_speed = track_df['speed'].min()
        max_speed = track_df['speed'].max()
        speed_range = max_speed - min_speed

        # Create line segments with color based on speed
        for i in range(len(track_df) - 1):
            start_point = [track_df.iloc[i]['latitude'], track_df.iloc[i]['longitude']]
            end_point = [track_df.iloc[i+1]['latitude'], track_df.iloc[i+1]['longitude']]

            # Get normalized speed for color (0-100%)
            speed = track_df.iloc[i]['speed']
            norm_speed = (speed - min_speed) / speed_range if speed_range > 0 else 0.5

            # Generate color from green (fast) to red (slow) through yellow
            if norm_speed < 0.5:
                # Red to Yellow gradient (slow to medium)
                red = 255
                green = int(norm_speed * 2 * 255)
                blue = 0
            else:
                # Yellow to Green gradient (medium to fast)
                red = int((1 - norm_speed) * 2 * 255)
                green = 255
                blue = 0

            color = f'#{red:02x}{green:02x}{blue:02x}'

            # Add the line segment with the calculated color
            folium.PolyLine(
                [start_point, end_point],
                weight=4,
                color=color,
                opacity=0.8,
                tooltip=f"Speed: {speed:.1f} km/h"
            ).add_to(m)
    else:
        # Fallback to simple line if no speed data
        points = [[row['latitude'], row['longitude']] for _, row in track_df.iterrows()]
        folium.PolyLine(
            points,
            weight=3,
            color=ROUTE_COLORS['primary'],
            opacity=0.8
        ).add_to(m)

    # Add custom icons for start and finish
    if len(track_df) > 1:
        # Start point (green marker)
        start_icon = folium.Icon(color="green")
        start_point = [track_df.iloc[0]['latitude'], track_df.iloc[0]['longitude']]
        start_time = track_df.iloc[0]['timestamp'].strftime('%H:%M:%S') if 'timestamp' in track_df.columns else 'N/A'
        start_popup = f"<b>Start</b><br>Time: {start_time}"
        folium.Marker(
            start_point,
            popup=start_popup,
            icon=start_icon
        ).add_to(m)

        # End point (red marker)
        end_icon = folium.Icon(color="red")
        end_point = [track_df.iloc[-1]['latitude'], track_df.iloc[-1]['longitude']]
        end_time = track_df.iloc[-1]['timestamp'].strftime('%H:%M:%S') if 'timestamp' in track_df.columns else 'N/A'
        end_popup = f"<b>Finish</b><br>Time: {end_time}"
        folium.Marker(
            end_point,
            popup=end_popup,
            icon=end_icon
        ).add_to(m)

    return m

def create_route_heatmap(track_df: pd.DataFrame) -> folium.Map:
    """
    Create a heatmap of frequently used cycling routes.

    Args:
        track_df: DataFrame with GPS tracking data

    Returns:
        folium.Map: Interactive heatmap
    """
    if len(track_df) < 2:
        # Return an empty map if there are not enough points
        return folium.Map(location=[50.6326, 5.5797], zoom_start=13)  # Default location

    center_lat = track_df['latitude'].mean()
    center_lon = track_df['longitude'].mean()

    m = folium.Map(location=[center_lat, center_lon], zoom_start=13)

    # Add heatmap layer
    heat_data = [[row['latitude'], row['longitude']] for _, row in track_df.iterrows()]
    folium.plugins.HeatMap(heat_data, radius=15).add_to(m)

    # Add the regular route line in blue for clarity
    folium.PolyLine(
        [[row['latitude'], row['longitude']] for _, row in track_df.iterrows()],
        color='blue',
        weight=2,
        opacity=0.7
    ).add_to(m)

    return m

def plot_elevation_profile(track_df: pd.DataFrame) -> go.Figure:
    """
    Create elevation profile plot.

    Args:
        track_df: DataFrame with GPS tracking data

    Returns:
        go.Figure: Plotly figure with elevation profile
    """
    # Ensure we have the right column name (altitude or elevation)
    elevation_col = 'altitude' if 'altitude' in track_df.columns else 'elevation'

    if elevation_col not in track_df.columns:
        # If neither column exists, return a message
        fig = go.Figure()
        fig.update_layout(
            title="No elevation data available",
            xaxis_title="Distance",
            yaxis_title="Elevation (m)"
        )
        return fig

    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=track_df.index,
        y=track_df[elevation_col],
        mode='lines',
        name='Elevation',
        fill='tozeroy'
    ))
    fig.update_layout(
        title="Elevation Profile",
        xaxis_title="Distance (km)",
        yaxis_title="Elevation (m)"
    )
    return fig

def plot_speed_vs_elevation(track_df: pd.DataFrame) -> go.Figure:
    """
    Create a dual-axis chart showing speed changes relative to elevation.

    Args:
        track_df: DataFrame with GPS tracking data

    Returns:
        go.Figure: Plotly figure with speed vs elevation chart
    """
    if len(track_df) < 2:
        fig = go.Figure()
        fig.update_layout(
            title="Insufficient data for analysis",
            xaxis_title="Distance",
            yaxis_title="Value"
        )
        return fig

    # Ensure we have the right column name (altitude or elevation)
    elevation_col = 'altitude' if 'altitude' in track_df.columns else 'elevation'

    # If we don't have elevation data, show only speed
    if elevation_col not in track_df.columns:
        fig = go.Figure()
        # Calculate a rolling average for speed to smooth the data
        if 'speed' in track_df.columns:
            track_df['smooth_speed'] = track_df['speed'].rolling(window=5, min_periods=1).mean()
            fig.add_trace(go.Scatter(
                x=track_df.index,
                y=track_df['smooth_speed'],
                name="Speed (km/h)"
            ))
        fig.update_layout(
            title="Speed Profile",
            xaxis_title="Distance (km)",
            yaxis_title="Speed (km/h)"
        )
        return fig

    # Create a rolling average for speed to smooth the data
    track_df['smooth_speed'] = track_df['speed'].rolling(window=5, min_periods=1).mean()

    # Create a figure with secondary y-axis
    fig = make_subplots.make_subplots(specs=[[{"secondary_y": True}]])

    # Add elevation trace
    fig.add_trace(
        go.Scatter(
            x=list(range(len(track_df))),
            y=track_df[elevation_col],
            name="Elevation",
            line=dict(color='green', width=2)
        ),
        secondary_y=False
    )

    # Add speed trace on secondary axis
    fig.add_trace(
        go.Scatter(
            x=list(range(len(track_df))),
            y=track_df['smooth_speed'],
            name="Speed",
            line=dict(color='blue', width=2)
        ),
        secondary_y=True
    )

    # Set titles
    fig.update_layout(
        title_text="Speed vs. Elevation Profile",
        xaxis_title="Distance (points)",
    )

    # Set y-axes titles
    fig.update_yaxes(title_text="Elevation (meters)", secondary_y=False)
    fig.update_yaxes(title_text="Speed (km/h)", secondary_y=True)

    return fig

def calculate_route_difficulty(distance: float, elevation: float) -> Tuple[str, float]:
    """
    Calculate route difficulty based on distance and elevation.

    Args:
        distance: Route distance in km
        elevation: Elevation gain in meters

    Returns:
        Tuple[str, float]: Difficulty category and score
    """
    # Simple algorithm: base difficulty on distance and elevation gain
    base_score = (distance / 10) + (elevation / 100)

    # Categorize
    if base_score < 5:
        return "Easy", base_score
    elif base_score < 10:
        return "Moderate", base_score
    elif base_score < 15:
        return "Challenging", base_score
    else:
        return "Hard", base_score

def identify_common_routes(activities: List[Dict], min_similarity: float = 0.7, min_length: float = 5.0) -> Dict[str, Dict]:
    """
    Identify common cycling routes based on start/end points and path similarity.

    Args:
        activities: List of activity dictionaries
        min_similarity: Minimum similarity threshold (0-1)
        min_length: Minimum route length in km

    Returns:
        Dict: Dictionary of identified routes with details
    """
    # Filter out short rides
    long_rides = [ride for ride in activities if ride['distance_km'] >= min_length]

    # Group similar routes
    routes = {}
    route_id = 1

    # Implementation would go here
    # This is a placeholder for the complete implementation

    return routes