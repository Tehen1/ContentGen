"""
Dashboard UI components for the fitness dashboard.

This module provides functions to create the main dashboard view with key metrics,
activity calendar, and summary statistics.
"""

import streamlit as st
import pandas as pd
import plotly.express as px
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Any

from src.visualization import create_activity_calendar
from src.training_load import apply_fixie_theme

def create_dashboard(df: pd.DataFrame, tcx_data: pd.DataFrame) -> None:
    """
    Create the main dashboard overview with key metrics and visualizations.

    Args:
        df: DataFrame with activity data
        tcx_data: DataFrame with TCX data
    """
    st.header("Tableau de Bord Fitness")

    # Activity calendar
    st.subheader("Calendrier d'Activités")
    calendar_fig = create_activity_calendar(tcx_data)
    if calendar_fig:
        st.pyplot(calendar_fig)

    # Top metrics
    create_metrics_section(df)

    # Activity summary
    create_activity_summary(df)

def create_metrics_section(df: pd.DataFrame) -> None:
    """
    Create a section with key metrics in a multi-column layout.

    Args:
        df: DataFrame with activity data
    """
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric("Distance Totale (km)", f"{df['Distance (km)'].sum():.1f}")
    with col2:
        st.metric(
            "Minutes Actives",
            f"{df['walking_minutes'].sum() + df['cycling_minutes'].sum() + df['running_minutes'].sum():.0f}"
        )
    with col3:
        st.metric("Points Cardio", f"{df['Points cardio'].sum():.0f}")
    with col4:
        st.metric("Pas Total", f"{df['Nombre de pas'].sum():,.0f}")

def create_activity_summary(df: pd.DataFrame) -> None:
    """
    Create a summary of recent activities.

    Args:
        df: DataFrame with activity data
    """
    st.subheader("Résumé des Activités Récentes")

    # Recent activity chart
    recent_df = df.sort_values('Date', ascending=False).head(14)

    if not recent_df.empty:
        # Create a bar chart for recent activities
        fig = px.bar(
            recent_df,
            x='Date',
            y='Distance (km)',
            color='Points cardio',
            title='Activités des 14 derniers jours',
            labels={'Distance (km)': 'Distance (km)', 'Date': 'Date'}
        )

        # Apply consistent styling
        fig = apply_fixie_theme(fig)

        st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("Aucune activité récente à afficher.")

def create_activity_breakdown(df: pd.DataFrame) -> None:
    """
    Create a breakdown of activities by type.

    Args:
        df: DataFrame with activity data
    """
    st.subheader("Répartition par Type d'Activité")

    # Calculate total minutes per activity type
    activity_data = pd.DataFrame({
        'Activity': ['Marche', 'Vélo', 'Course'],
        'Minutes': [
            df['walking_minutes'].sum(),
            df['cycling_minutes'].sum(),
            df['running_minutes'].sum()
        ]
    })

    # Create pie chart
    fig = px.pie(
        activity_data,
        values='Minutes',
        names='Activity',
        title='Répartition des Activités',
        hole=0.3
    )

    # Apply consistent styling
    fig = apply_fixie_theme(fig)
    fig.update_traces(textposition='inside', textinfo='percent+label')

    st.plotly_chart(fig, use_container_width=True)

def create_streak_section(df: pd.DataFrame) -> None:
    """
    Create a section showing activity streaks and achievements.

    Args:
        df: DataFrame with activity data
    """
    from src.analysis import calculate_activity_streaks, get_recent_achievements

    # Calculate streaks
    streaks = calculate_activity_streaks(df)

    # Display streak metrics
    col1, col2 = st.columns(2)

    with col1:
        st.metric("Série Actuelle", f"{streaks['current_streak']} jours")

    with col2:
        st.metric("Plus Longue Série", f"{streaks['longest_streak']} jours")

    # Recent achievements
    st.subheader("Réalisations Récentes")
    achievements = get_recent_achievements(df)

    if achievements:
        for achievement in achievements:
            st.success(achievement)
    else:
        st.info("Continuez à vous entraîner pour débloquer des réalisations!")