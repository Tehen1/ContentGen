"""
Route maps UI components for the fitness dashboard.

This module provides functions to create route map visualizations,
including interactive maps, route analysis, and elevation profiles.
"""

import streamlit as st
import pandas as pd
from streamlit_folium import st_folium
from typing import Dict, List, Tuple, Optional, Any

from src.route_analysis import (
    create_route_map,
    create_route_heatmap,
    plot_elevation_profile,
    plot_speed_vs_elevation,
    calculate_route_difficulty
)

def create_route_maps_section(df: pd.DataFrame, tcx_data: pd.DataFrame) -> None:
    """
    Create the route maps section with interactive maps and route analysis.

    Args:
        df: DataFrame with activity data
        tcx_data: DataFrame with TCX data
    """
    st.header("Analyse des Itinéraires")

    # Create tabs for different route visualizations
    route_tabs = st.tabs(["Carte d'Itinéraire", "Carte de Chaleur", "Profil d'Élévation", "Vitesse vs Élévation"])

    # Get selected activity (if applicable)
    selected_activity = get_selected_activity(tcx_data)

    if selected_activity is not None:
        # Process the selected activity data
        track_df = selected_activity

        # Display route map in the first tab
        with route_tabs[0]:
            display_route_map(track_df)

        # Display heatmap in the second tab
        with route_tabs[1]:
            display_route_heatmap(track_df)

        # Display elevation profile in the third tab
        with route_tabs[2]:
            display_elevation_profile(track_df)

        # Display speed vs elevation in the fourth tab
        with route_tabs[3]:
            display_speed_vs_elevation(track_df)

        # Display route metrics
        display_route_metrics(track_df)
    else:
        st.info("Aucune donnée d'activité disponible pour afficher les itinéraires.")

def get_selected_activity(tcx_data: pd.DataFrame) -> Optional[pd.DataFrame]:
    """
    Get the selected activity data from TCX data.

    Args:
        tcx_data: DataFrame with TCX data

    Returns:
        Optional[pd.DataFrame]: Selected activity data or None if no data available
    """
    if tcx_data is None or tcx_data.empty:
        return None

    # If there's only one activity, select it automatically
    if len(tcx_data) == 1:
        return tcx_data

    # Otherwise, let the user select an activity
    activity_labels = []

    # Create labels for each activity, handling missing or NaT dates
    for i, row in tcx_data.iterrows():
        # Get the date and activity type, with fallbacks for missing values
        date_val = row.get('date', None) if 'date' in tcx_data.columns else None
        activity_type = row.get('type', 'Unknown') if 'type' in tcx_data.columns else f"Activity {i+1}"

        # Format the date string, handling NaT values
        if date_val is None or pd.isna(date_val):
            date_str = "Date inconnue"
        else:
            try:
                date_str = date_val.strftime('%Y-%m-%d %H:%M')
            except:
                date_str = str(date_val)

        # Create the label
        activity_labels.append(f"{date_str} - {activity_type}")

    # If no labels could be created, use generic fallback
    if not activity_labels:
        activity_labels = [f"Activité {i+1}" for i in range(len(tcx_data))]

    # Create the selection dropdown
    selected_index = st.selectbox(
        "Sélectionnez une activité",
        range(len(activity_labels)),
        format_func=lambda i: activity_labels[i]
    )

    return tcx_data.iloc[[selected_index]]

def display_route_map(track_df: pd.DataFrame) -> None:
    """
    Display an interactive route map using Folium.

    Args:
        track_df: DataFrame with GPS tracking data
    """
    if 'latitude' in track_df.columns and 'longitude' in track_df.columns:
        route_map = create_route_map(track_df)
        st_folium(route_map, width=None, height=400, key="route_map")
    else:
        st.warning("Données de localisation manquantes pour créer la carte d'itinéraire.")

def display_route_heatmap(track_df: pd.DataFrame) -> None:
    """
    Display a route heatmap using Folium.

    Args:
        track_df: DataFrame with GPS tracking data
    """
    if 'latitude' in track_df.columns and 'longitude' in track_df.columns:
        heatmap = create_route_heatmap(track_df)
        st_folium(heatmap, width=None, height=400, key="route_heatmap")
    else:
        st.warning("Données de localisation manquantes pour créer la carte de chaleur.")

def display_elevation_profile(track_df: pd.DataFrame) -> None:
    """
    Display an elevation profile chart.

    Args:
        track_df: DataFrame with GPS tracking data
    """
    elevation_fig = plot_elevation_profile(track_df)
    st.plotly_chart(elevation_fig, use_container_width=True)

def display_speed_vs_elevation(track_df: pd.DataFrame) -> None:
    """
    Display a speed vs elevation chart.

    Args:
        track_df: DataFrame with GPS tracking data
    """
    speed_elev_fig = plot_speed_vs_elevation(track_df)
    st.plotly_chart(speed_elev_fig, use_container_width=True)

def display_route_metrics(track_df: pd.DataFrame) -> None:
    """
    Display key metrics for the selected route.

    Args:
        track_df: DataFrame with GPS tracking data
    """
    st.subheader("Métriques de l'Itinéraire")

    # Calculate metrics
    total_distance = track_df['distance'].max() if 'distance' in track_df.columns else 0

    # Calculate duration if timestamp is available
    duration_minutes = 0
    if 'timestamp' in track_df.columns:
        start_time = track_df['timestamp'].min()
        end_time = track_df['timestamp'].max()
        duration_minutes = (end_time - start_time).total_seconds() / 60

    # Calculate average speed
    avg_speed = track_df['speed'].mean() if 'speed' in track_df.columns else 0

    # Calculate elevation gain
    elevation_gain = 0
    elevation_col = 'altitude' if 'altitude' in track_df.columns else 'elevation'
    if elevation_col in track_df.columns:
        elev_diff = track_df[elevation_col].diff()
        elevation_gain = elev_diff[elev_diff > 0].sum()

    # Calculate route difficulty
    difficulty, difficulty_score = calculate_route_difficulty(total_distance, elevation_gain)

    # Display metrics in columns
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric("Distance", f"{total_distance:.2f} km")

    with col2:
        st.metric("Durée", f"{int(duration_minutes // 60)}h {int(duration_minutes % 60)}m")

    with col3:
        st.metric("Vitesse Moyenne", f"{avg_speed:.1f} km/h")

    with col4:
        st.metric("Dénivelé", f"{elevation_gain:.0f} m")

    # Display difficulty rating
    st.info(f"Difficulté de l'itinéraire: **{difficulty}** (Score: {difficulty_score:.1f}/20)")