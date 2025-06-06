"""
Main application file for fitness dashboard.
"""
import streamlit as st
import pandas as pd

from src.data_loader import load_data, load_tcx_data
from src.analysis import (
    calculate_activity_summaries,
    analyze_activity_patterns,
    generate_activity_insights,
    analyze_performance_trends,
    calculate_activity_streaks,
    get_recent_achievements,
    generate_route_map,
    calculate_route_statistics
)
from src.visualization import (
    create_activity_calendar,
    create_activity_type_chart,
    create_trend_charts,
    create_speed_analysis_charts,
    create_activity_distribution_charts,
    create_activity_heatmap,
    create_performance_comparison_chart,
    create_activity_map
)
from config import UI_CONFIG

# Configure Streamlit page
st.set_page_config(**UI_CONFIG)

# Disable XSRF protection for cross-origin resource sharing
# Note: 'server.enableXsrfProtection' cannot be set on the fly.
# Set this in ~/.streamlit/config.toml or as a command line parameter:
# streamlit run app.py --server.enableXsrfProtection false

# Load data
df = load_data()
if df is None:
    st.stop()

# Load TCX data
tcx_data = load_tcx_data()

# Sidebar filters
st.sidebar.title("Filtres")

# Date range selector
min_date = df['Date'].min()
max_date = df['Date'].max()
if isinstance(min_date, pd.Timestamp):
    min_date = min_date.date()
if isinstance(max_date, pd.Timestamp):
    max_date = max_date.date()
    
date_range = st.sidebar.date_input(
    "Sélectionner une période",
    value=(min_date, max_date),
    min_value=min_date,
    max_value=max_date
)

# Filter data based on date range
if len(date_range) == 2:
    start_date, end_date = date_range
    mask = (df['Date'].dt.date >= start_date) & (df['Date'].dt.date <= end_date)
    filtered_df = df[mask]
else:
    filtered_df = df

# Activity Calendar
st.subheader("Calendrier d'Activités")
calendar_fig = create_activity_calendar(tcx_data)
if calendar_fig:
    st.pyplot(calendar_fig)

# Activity Type Analysis
st.subheader("Analyse par Type d'Activité")
activity_type_fig = create_activity_type_chart(tcx_data)
if activity_type_fig:
    st.plotly_chart(activity_type_fig)

# Top metrics
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric("Distance Totale (km)", 
            f"{filtered_df['Distance (km)'].sum():.1f}")
with col2:
    st.metric(
        "Minutes Actives", 
        f"{filtered_df['walking_minutes'].sum() + filtered_df['cycling_minutes'].sum() + filtered_df['running_minutes'].sum():.0f}"
    )
with col3:
    st.metric("Points Cardio", 
            f"{filtered_df['Points cardio'].sum():.0f}")
with col4:
    st.metric("Pas Total", 
            f"{filtered_df['Nombre de pas'].sum():,.0f}")

# Create tabs
tab1, tab2, tab3, tab4, tab5, tab6, tab7, tab8 = st.tabs([
    "Tendances", "Sessions", "Routes", "Vitesse", 
    "Distribution", "Métriques", "Parcours GPS", "Insights"
])

with tab1:
    col1, col2 = st.columns(2)
    fig_distance, fig_active = create_trend_charts(filtered_df)
    
    with col1:
        st.plotly_chart(fig_distance, use_container_width=True)
    with col2:
        st.plotly_chart(fig_active, use_container_width=True)

with tab2:
    col1, col2 = st.columns(2)
    fig_speed, fig_speed_dist = create_speed_analysis_charts(filtered_df)
    
    with col1:
        st.plotly_chart(fig_speed, use_container_width=True)
    with col2:
        st.plotly_chart(fig_speed_dist, use_container_width=True)

with tab3:
    col1, col2 = st.columns(2)
    fig_pie, fig_monthly = create_activity_distribution_charts(filtered_df)
    
    with col1:
        st.plotly_chart(fig_pie, use_container_width=True)
    with col2:
        st.plotly_chart(fig_monthly, use_container_width=True)

    st.subheader("Analyse des Sessions")
    trends = analyze_performance_trends(filtered_df)
    st.plotly_chart(trends['progress_chart'])

    streaks = calculate_activity_streaks(filtered_df)
    st.metric("Série Actuelle", f"{streaks['current_streak']} jours")
    st.metric("Plus Longue Série", f"{streaks['longest_streak']} jours")

    st.subheader("Réalisations Récentes")
    achievements = get_recent_achievements(filtered_df)
    for achievement in achievements:
        st.success(achievement)

with tab4:
    st.subheader("Carte des Activités")
    activity_map = create_activity_map(filtered_df)
    if activity_map:
        st.plotly_chart(activity_map, use_container_width=True)
    else:
        st.warning("Aucune donnée de localisation disponible pour afficher la carte.")

with tab5:
    fig_heatmap = create_activity_heatmap(filtered_df)
    st.plotly_chart(fig_heatmap, use_container_width=True)

with tab6:
    st.subheader("Métriques Détaillées")
    detailed_stats = st.container()
    with detailed_stats:
        col1, col2 = st.columns(2)
        with col1:
            st.dataframe(filtered_df.describe(), use_container_width=True)
        with col2:
            monthly_avg = filtered_df.resample('ME', on='Date').mean()
            st.write("Moyennes Mensuelles")
            st.dataframe(monthly_avg.round(2), use_container_width=True)

with tab7:
    st.subheader("Analyse des Parcours")
    if not tcx_data.empty:
        route_map = generate_route_map(tcx_data)
        st.components.v1.html(route_map._repr_html_(), height=500)
        
        route_stats = calculate_route_statistics(tcx_data)
        st.write("Statistiques des Parcours")
        st.dataframe(route_stats)
    else:
        st.warning("Aucune donnée de parcours disponible.")

with tab8:
    st.subheader("Analyses et Insights")
    patterns = analyze_activity_patterns(filtered_df)
    
    col1, col2 = st.columns(2)
    with col1:
        hourly_dist = patterns['hourly_distribution']
        st.bar_chart(hourly_dist)
    
    with col2:
        weekly_dist = patterns['weekday_distribution']
        st.bar_chart(weekly_dist)
    
    summaries = calculate_activity_summaries(filtered_df)
    st.subheader("Résumé par Type d'Activité")
    
    for activity, stats in summaries.items():
        with st.expander(f"Détails {activity.title()}"):
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Minutes Totales", f"{stats['total_minutes']:.0f}")
            with col2:
                st.metric("Jours Actifs", stats['active_days'])
            with col3:
                st.metric("Régularité", f"{stats['consistency']:.1f}%")
    
    st.subheader("Insights")
    insights = generate_activity_insights(filtered_df)
    for insight in insights:
        st.info(f"**{insight['title']}**: {insight['description']}")

# Performance comparison
st.subheader("Comparaison des Performances")
perf_comparison = create_performance_comparison_chart(filtered_df)
st.plotly_chart(perf_comparison, use_container_width=True)

# Export functionality
if st.button("Exporter les Données"):
    try:
        csv = filtered_df.to_csv(index=False).encode('utf-8')
        st.download_button(
            "Télécharger CSV",
            csv,
            "activity_data.csv",
            "text/csv",
            key='download-csv'
        )
    except Exception as e:
        st.error(f"Erreur lors de l'export des données: {str(e)}")
