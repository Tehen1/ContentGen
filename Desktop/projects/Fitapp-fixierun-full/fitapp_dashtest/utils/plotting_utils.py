#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Plotting utility functions for cycling data visualizations.
"""

import os
import sys
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from typing import Optional, Dict, Any, List, Union

# Default styles for consistent visualization appearance
PLOT_BGCOLOR = "#0F172A"  # Dark background
PAPER_BGCOLOR = "#0F172A"
FONT_COLOR = "#F8FAFC"    # Light text
LINE_COLOR = "#38BDF8"    # Bright blue for lines
MARKER_COLOR = "#38BDF8"  # Same bright blue for markers
HEATMAP_COLORSCALE = "Viridis"  # Good colorscale for heatmaps

# Default layout settings
DEFAULT_LAYOUT = {
    "font": {"color": FONT_COLOR, "family": "Inter, sans-serif"},
    "paper_bgcolor": PAPER_BGCOLOR,
    "plot_bgcolor": PLOT_BGCOLOR,
    "margin": {"r": 10, "t": 30, "l": 10, "b": 10},
    "height": 600,
}


def create_route_map(df: pd.DataFrame, mapbox_token: Optional[str] = None) -> go.Figure:
    """
    Create a route map visualization using Mapbox.
    
    Args:
        df: DataFrame containing cycling location data with latitude and longitude
        mapbox_token: Optional Mapbox access token for map customization
        
    Returns:
        Plotly figure object with the route map
    """
    # Check for empty DataFrame or missing required columns
    if df.empty:
        print("Warning: Empty DataFrame provided to create_route_map")
        return go.Figure()
    
    required_cols = ['latitude', 'longitude']
    if not all(col in df.columns for col in required_cols):
        print(f"Error: Missing required columns: {required_cols}")
        return go.Figure()
    
    try:
        # Create a copy of the DataFrame with only necessary columns to avoid errors
        plot_df = df[['latitude', 'longitude']].copy()
        
        # Drop any rows with NaN values in coordinates
        plot_df = plot_df.dropna(subset=['latitude', 'longitude'])
        
        # If DataFrame is too large, sample it for better performance
        if len(plot_df) > 50000:
            print(f"Warning: Large dataset ({len(plot_df)} points). Sampling for performance.")
            plot_df = plot_df.sample(n=50000, random_state=42)
        
        # Additional data for hover information if available
        hover_data = []
        for col in ['distance', 'speed', 'heart_rate', 'elevation', 'duration_minutes']:
            if col in df.columns:
                hover_data.append(col)
        
        # Time column for color if available
        if 'start_time' in df.columns:
            color_col = 'start_time'
        else:
            color_col = None
            
        # Create the scatter mapbox plot
        fig = px.scatter_mapbox(
            plot_df,
            lat="latitude",
            lon="longitude",
            hover_name=df.index if 'start_time' not in df.columns else 'start_time',
            hover_data=hover_data,
            color=color_col,
            color_continuous_scale="Viridis" if color_col else None,
            zoom=11,
            height=600,
            opacity=0.8,
            size_max=10
        )
        
        # Add lines connecting the points in chronological order if time data is available
        if 'start_time' in df.columns and len(plot_df) > 1:
            sorted_df = plot_df.sort_values('start_time') if 'start_time' in plot_df.columns else plot_df
            fig.add_trace(go.Scattermapbox(
                lat=sorted_df['latitude'],
                lon=sorted_df['longitude'],
                mode='lines',
                line=dict(width=2, color=LINE_COLOR),
                hoverinfo='none'
            ))
        
        # Configure the map layout
        fig.update_layout(
            mapbox=dict(
                style="dark" if not mapbox_token else "mapbox://styles/mapbox/dark-v10",
                accesstoken=mapbox_token,
                zoom=11,
                center=dict(
                    lat=plot_df['latitude'].mean(),
                    lon=plot_df['longitude'].mean()
                )
            ),
            **DEFAULT_LAYOUT
        )
        
        return fig
    
    except Exception as e:
        print(f"Error creating route map: {e}")
        return go.Figure()


def create_time_distance_chart(df: pd.DataFrame) -> go.Figure:
    """
    Create a time vs distance chart for cycling activity.
    
    Args:
        df: DataFrame containing cycling data with start_time and distance
        
    Returns:
        Plotly figure object with the time-distance chart
    """
    # Check for empty DataFrame or missing required columns
    if df.empty:
        print("Warning: Empty DataFrame provided to create_time_distance_chart")
        return go.Figure()
    
    required_cols = []
    # We can use either start_time or timestamp
    if 'start_time' in df.columns:
        time_col = 'start_time'
        required_cols.append('start_time')
    elif 'timestamp' in df.columns:
        time_col = 'timestamp'
        required_cols.append('timestamp')
    else:
        print("Error: No time column (start_time or timestamp) found in DataFrame")
        return go.Figure()
    
    # Map column names from our data file format
    if 'distance_km' in df.columns and 'distance' not in df.columns:
        df['distance'] = df['distance_km']

    if 'avg_speed_km_h' in df.columns and 'speed' not in df.columns:
        df['speed'] = df['avg_speed_km_h']
        
    if 'distance' not in df.columns:
        print("Error: 'distance' column not found in DataFrame")
        return go.Figure()
    
    required_cols.append('distance')
    
    if not all(col in df.columns for col in required_cols):
        print(f"Error: Missing required columns: {required_cols}")
        return go.Figure()
    
    try:
        # Create a copy of the DataFrame with only necessary columns
        plot_df = df[required_cols].copy()
        
        # Drop any rows with NaN values
        plot_df = plot_df.dropna(subset=required_cols)
        
        # Sort by time for a proper chronological view
        plot_df = plot_df.sort_values(by=time_col)
        
        # Create the time-distance chart
        fig = px.line(
            plot_df,
            x=time_col,
            y="distance",
            title="Distance Over Time",
            labels={
                time_col: "Time",
                "distance": "Distance (km)"
            },
            height=600
        )
        
        # Add markers for each data point
        fig.add_trace(go.Scatter(
            x=plot_df[time_col],
            y=plot_df['distance'],
            mode='markers',
            marker=dict(size=8, color=MARKER_COLOR),
            name='Data Points'
        ))
        
        # Improve the formatting and appearance
        fig.update_traces(line=dict(color=LINE_COLOR, width=3))
        
        # Update layout
        fig.update_layout(
            xaxis=dict(
                title="Time",
                gridcolor="#2D3748",
                showgrid=True,
                zeroline=False
            ),
            yaxis=dict(
                title="Distance (km)",
                gridcolor="#2D3748",
                showgrid=True,
                zeroline=False
            ),
            **DEFAULT_LAYOUT
        )
        
        # Add range slider for time selection
        fig.update_xaxes(rangeslider_visible=True)
        
        return fig
    
    except Exception as e:
        print(f"Error creating time-distance chart: {e}")
        return go.Figure()


def create_geospatial_heatmap(df: pd.DataFrame, mapbox_token: Optional[str] = None) -> go.Figure:
    """
    Create a geospatial heatmap of cycling activity density.
    
    Args:
        df: DataFrame containing cycling location data with latitude and longitude
        mapbox_token: Optional Mapbox access token for map customization
        
    Returns:
        Plotly figure object with the heatmap
    """
    # Check for empty DataFrame or missing required columns
    if df.empty:
        print("Warning: Empty DataFrame provided to create_geospatial_heatmap")
        return go.Figure()
    
    required_cols = ['latitude', 'longitude']
    if not all(col in df.columns for col in required_cols):
        print(f"Error: Missing required columns: {required_cols}")
        return go.Figure()
    
    try:
        # Create a copy of the DataFrame with only necessary columns
        plot_df = df[required_cols].copy()
        
        # Drop any rows with NaN values in coordinates
        plot_df = plot_df.dropna(subset=['latitude', 'longitude'])
        
        # If we have distance or another numeric value to use for weight, include it
        weight_col = None
        for col in ['distance', 'speed', 'heart_rate', 'duration_minutes']:
            if col in df.columns:
                weight_col = col
                plot_df[col] = df[col]
                break
        
        # Create the density mapbox
        fig = px.density_mapbox(
            plot_df,
            lat="latitude",
            lon="longitude",
            z=weight_col,  # Use the selected column for intensity, if available
            radius=15,  # Adjust based on data density
            color_continuous_scale=HEATMAP_COLORSCALE,
            opacity=0.7,
            zoom=11,
            height=600,
        )
        
        # Configure the map layout
        fig.update_layout(
            mapbox=dict(
                style="dark" if not mapbox_token else "mapbox://styles/mapbox/dark-v10",
                accesstoken=mapbox_token,
                center=dict(
                    lat=plot_df['latitude'].mean(),
                    lon=plot_df['longitude'].mean()
                )
            ),
            **DEFAULT_LAYOUT
        )
        
        # Adjust colorbar
        fig.update_layout(
            coloraxis_colorbar=dict(
                title=weight_col.capitalize() if weight_col else "Density",
                titleside="right",
                thicknessmode="pixels", 
                thickness=20,
                lenmode="fraction", 
                len=0.75
            )
        )
        
        return fig
    
    except Exception as e:
        print(f"Error creating geospatial heatmap: {e}")
        return go.Figure()


def create_activity_stats(df: pd.DataFrame) -> List[Dict]:
    """
    Create summary statistics cards for cycling activity data.
    
    Args:
        df: DataFrame containing cycling activity data
        
    Returns:
        List of dictionaries with stats for display
    """
    if df.empty:
        return []
    
    stats = []
    
    try:
        # Map column names from our data file format
        if 'distance_km' in df.columns and 'distance' not in df.columns:
            df['distance'] = df['distance_km']
        
        if 'avg_speed_km_h' in df.columns and 'speed' not in df.columns:
            df['speed'] = df['avg_speed_km_h']
        
        # Total distance
        if 'distance' in df.columns:
            total_distance = df['distance'].max() if not df['distance'].empty else 0
            stats.append({
                'title': 'Total Distance',
                'value': f"{total_distance:.2f} km",
                'icon': 'route'
            })
        
        # Average speed
        if 'speed' in df.columns:
            avg_speed = df['speed'].mean() if not df['speed'].empty else 0
            stats.append({
                'title': 'Average Speed',
                'value': f"{avg_speed:.1f} km/h",
                'icon': 'tachometer-alt'
            })
        
        # Total duration
        if 'duration_minutes' in df.columns:
            total_duration = df['duration_minutes'].sum() if not df['duration_minutes'].empty else 0
            hours = int(total_duration // 60)
            minutes = int(total_duration % 60)
            stats.append({
                'title': 'Total Duration',
                'value': f"{hours}h {minutes}m",
                'icon': 'clock'
            })
        
        # Maximum heart rate
        if 'heart_rate' in df.columns:
            max_hr = df['heart_rate'].max() if not df['heart_rate'].empty else 0
            stats.append({
                'title': 'Max Heart Rate',
                'value': f"{max_hr} bpm",
                'icon': 'heartbeat'
            })
        
        # Maximum elevation
        if 'elevation' in df.columns:
            max_elevation = df['elevation'].max() if not df['elevation'].empty else 0
            stats.append({
                'title': 'Max Elevation',
                'value': f"{max_elevation:.1f} m",
                'icon': 'mountain'
            })
        
        return stats
    
    except Exception as e:
        print(f"Error creating activity stats: {e}")
        return []


# Test/demonstration code
if __name__ == "__main__":
    # Import data loader to get sample data
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    try:
        from scripts.data_loader import load_and_preprocess
        
        # Path to the sample data
        data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                                "data", "location_history_enriched_copy.json")
        
        # Test the plotting functions if data is available
        if os.path.exists(data_path):
            print(f"Loading test data from: {data_path}")
            df = load_and_preprocess(data_path)
            
            if not df.empty:
                print("\nCreating route map...")
                route_fig = create_route_map(df)
                # route_fig.show()  # Uncomment to display the figure
                
                print("Creating time-distance chart...")
                time_dist_fig = create_time_distance_chart(df)
                # time_dist_fig.show()  # Uncomment to display the figure
                
                print("Creating geospatial heatmap...")
                heatmap_fig = create_geospatial_heatmap(df)
                # heatmap_fig.show()  # Uncomment to display the figure
                
                print("Creating activity stats...")
                stats = create_activity_stats(df)
                print(f"Generated {len(stats)} statistics cards")
                
                print("\nAll visualizations created successfully!")
        else:
            print(f"Test data file not found at: {data_path}")
    
    except ImportError as e:
        print(f"Could not import data_loader module: {e}")
        print("Make sure you're running this from the correct directory structure.")
    except Exception as e:
        print(f"Error during testing: {e}")

