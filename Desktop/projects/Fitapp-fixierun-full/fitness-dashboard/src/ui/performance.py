"""
Performance UI components for the fitness dashboard.

This module provides functions to create performance analysis views,
including trends, training load, and year-over-year comparisons.
"""

import streamlit as st
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any

from src.analysis import (
    analyze_performance_trends,
    calculate_activity_streaks,
    get_recent_achievements
)
from src.training_load import (
    plot_year_over_year_comparison,
    plot_training_load_chart,
    plot_performance_trends
)

def create_performance_section(df: pd.DataFrame, tcx_data: pd.DataFrame) -> None:
    """
    Create the performance analysis section with trends and visualizations.

    Args:
        df: DataFrame with activity data
        tcx_data: DataFrame with TCX data
    """
    st.header("Analyse de Performance")

    # Create tabs for different performance views
    performance_tabs = st.tabs([
        "Tendances",
        "Charge d'Entraînement",
        "Comparaison Annuelle",
        "Statistiques"
    ])

    # Display trends in the first tab
    with performance_tabs[0]:
        create_trends_section(df)

    # Display training load in the second tab
    with performance_tabs[1]:
        create_training_load_section(df)

    # Display year-over-year comparison in the third tab
    with performance_tabs[2]:
        create_yearly_comparison_section(df)

    # Display statistics in the fourth tab
    with performance_tabs[3]:
        create_statistics_section(df)

def create_trends_section(df: pd.DataFrame) -> None:
    """
    Create a section showing performance trends over time.

    Args:
        df: DataFrame with activity data
    """
    st.subheader("Tendances de Performance")

    # Performance trends visualization
    trends_fig = plot_performance_trends(df)
    st.plotly_chart(trends_fig, use_container_width=True)

    # Additional trend analysis
    trends = analyze_performance_trends(df)
    if 'improvements' in trends:
        st.subheader("Améliorations sur 30 jours")

        improvements = trends['improvements']

        # Display improvement metrics
        cols = st.columns(3)
        with cols[0]:
            pct_change = improvements.get('distance', 0) * 100
            direction = "↑" if pct_change > 0 else "↓"
            st.metric("Distance", f"{abs(pct_change):.1f}% {direction}")

        with cols[1]:
            pct_change = improvements.get('points', 0) * 100
            direction = "↑" if pct_change > 0 else "↓"
            st.metric("Points Cardio", f"{abs(pct_change):.1f}% {direction}")

        with cols[2]:
            pct_change = improvements.get('steps', 0) * 100
            direction = "↑" if pct_change > 0 else "↓"
            st.metric("Pas", f"{abs(pct_change):.1f}% {direction}")

def create_training_load_section(df: pd.DataFrame) -> None:
    """
    Create a section showing training load analysis.

    Args:
        df: DataFrame with activity data
    """
    st.subheader("Analyse de la Charge d'Entraînement")

    # Training load chart
    training_load_fig = plot_training_load_chart(df)
    st.plotly_chart(training_load_fig, use_container_width=True)

    # Training zones explanation
    with st.expander("Comprendre la Charge d'Entraînement"):
        st.markdown("""
        ### Charge d'Entraînement

        La charge d'entraînement est une mesure qui combine la durée et l'intensité de vos activités
        pour quantifier l'impact global sur votre corps.

        - **Charge Quotidienne**: Représente l'intensité de chaque session individuelle
        - **Charge Cumulée**: Représente l'accumulation de fatigue au fil du temps

        Pour optimiser vos progrès, visez une augmentation progressive de la charge avec des
        semaines de récupération périodiques (généralement toutes les 4 semaines).
        """)

def create_yearly_comparison_section(df: pd.DataFrame) -> None:
    """
    Create a section showing year-over-year comparisons.

    Args:
        df: DataFrame with activity data
    """
    st.subheader("Comparaison Année par Année")

    # Year-over-year comparison chart
    yoy_fig = plot_year_over_year_comparison(df)
    st.plotly_chart(yoy_fig, use_container_width=True)

    # Add explanation about seasonal patterns
    with st.expander("Tendances Saisonnières"):
        st.markdown("""
        ### Tendances Saisonnières

        Les activités physiques suivent souvent des patterns saisonniers:

        - **Printemps (Mars-Mai)**: Augmentation progressive de l'activité
        - **Été (Juin-Août)**: Pic d'activité, distances plus longues
        - **Automne (Sept-Nov)**: Maintien de l'activité, baisse progressive
        - **Hiver (Déc-Fév)**: Activité réduite, sessions plus courtes

        Ces tendances sont normales et reflètent les variations climatiques et de disponibilité.
        """)

def create_statistics_section(df: pd.DataFrame) -> None:
    """
    Create a section showing detailed activity statistics.

    Args:
        df: DataFrame with activity data
    """
    st.subheader("Statistiques Détaillées")

    # Calculate key statistics
    if not df.empty:
        total_activities = len(df)
        total_distance = df['Distance (km)'].sum()
        total_points = df['Points cardio'].sum()
        total_steps = df['Nombre de pas'].sum()

        # Activity type breakdown
        walking_minutes = df['walking_minutes'].sum()
        cycling_minutes = df['cycling_minutes'].sum()
        running_minutes = df['running_minutes'].sum()
        total_minutes = walking_minutes + cycling_minutes + running_minutes

        # Calculate percentages
        walking_pct = (walking_minutes / total_minutes * 100) if total_minutes > 0 else 0
        cycling_pct = (cycling_minutes / total_minutes * 100) if total_minutes > 0 else 0
        running_pct = (running_minutes / total_minutes * 100) if total_minutes > 0 else 0

        # Display statistics in a table
        stats_data = {
            "Métrique": ["Activités Totales", "Distance Totale", "Points Cardio", "Pas Totaux",
                        "Minutes de Marche", "Minutes de Vélo", "Minutes de Course"],
            "Valeur": [f"{total_activities}", f"{total_distance:.1f} km", f"{total_points:.0f}",
                      f"{total_steps:,.0f}", f"{walking_minutes:.0f} ({walking_pct:.1f}%)",
                      f"{cycling_minutes:.0f} ({cycling_pct:.1f}%)", f"{running_minutes:.0f} ({running_pct:.1f}%)"]
        }

        stats_df = pd.DataFrame(stats_data)
        st.table(stats_df)

        # Top 5 days by distance
        st.subheader("Top 5 Jours par Distance")
        top_distance = df.nlargest(5, 'Distance (km)')
        top_distance_display = top_distance[['Date', 'Distance (km)', 'Points cardio']]
<<<<<<< HEAD
        # Fix: Convert Date column to datetime type first if it's not already
        # This prevents AttributeError when using .dt accessor on non-datetime columns
        if not pd.api.types.is_datetime64_any_dtype(top_distance_display['Date']):
            top_distance_display['Date'] = pd.to_datetime(top_distance_display['Date'], errors='coerce')
            # Format the dates as strings
            top_distance_display['Date'] = top_distance_display['Date'].dt.strftime('%Y-%m-%d')
        else:
            # If it's already datetime type, just format it
            top_distance_display['Date'] = top_distance_display['Date'].dt.strftime('%Y-%m-%d')
=======
        top_distance_display = top_distance_display.copy()
        top_distance_display.loc[:, 'Date'] = top_distance_display['Date'].dt.strftime('%Y-%m-%d')
>>>>>>> dbc67c274da6b2f2f0f2f76cbd62f0bdaf4942da
        st.table(top_distance_display)

    else:
        st.info("Aucune donnée disponible pour calculer les statistiques.")