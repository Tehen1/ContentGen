"""
Visualization functions for fitness dashboard.
"""
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import calplot

def create_activity_calendar(tcx_data):
    """Create activity calendar visualization."""
    if not tcx_data.empty:
        try:
            # Check if 'date' column exists, otherwise try 'Date'
            date_col = 'date' if 'date' in tcx_data.columns else 'Date'

            if date_col in tcx_data.columns:
                # Convert to datetime if not already
                tcx_data[date_col] = pd.to_datetime(tcx_data[date_col])

                # Group by date and count activities
                activity_counts = tcx_data.groupby(pd.Grouper(key=date_col, freq='D')).size()

                # Make sure we have a DatetimeIndex for calplot
                if not isinstance(activity_counts.index, pd.DatetimeIndex):
                    activity_counts.index = pd.to_datetime(activity_counts.index)

                try:
                    # Try with daylabel_kws (newer versions of calplot)
                    fig_calendar = calplot.calplot(
                        activity_counts,
                        cmap='YlOrRd',
                        figsize=(16, 8),
                        yearlabel_kws={'color': 'black'},
                        daylabel_kws={'color': 'black'}
                    )
                except TypeError:
                    # Fallback for older versions without daylabel_kws
                    fig_calendar = calplot.calplot(
                        activity_counts,
                        cmap='YlOrRd',
                        figsize=(16, 8),
                        yearlabel_kws={'color': 'black'}
                    )

                return fig_calendar
            else:
                # If no date column is available, return None
                return None
        except Exception as e:
            # Handle the exception gracefully
            import streamlit as st
            st.warning(f"Impossible de créer le calendrier d'activités: {str(e)}")
            return None
    return None

def create_activity_type_chart(tcx_data):
    """Create pie chart of activity types."""
    if not tcx_data.empty:
        activity_types = tcx_data['type'].value_counts()
        fig = px.pie(
            values=activity_types.values,
            names=activity_types.index,
            title="Répartition des Types d'Activités"
        )
        return fig
    return None

def create_trend_charts(df):
    """Create trend visualization charts."""
    fig_distance = px.line(df, x='Date', y='Distance (km)',
                        title='Évolution de la Distance')

    active_minutes = df['walking_minutes'] + df['cycling_minutes'] + df['running_minutes']
    fig_active = px.line(df, x='Date', y=active_minutes,
                        title='Minutes Actives par Jour')

    return fig_distance, fig_active

def create_speed_analysis_charts(df):
    """Create speed analysis visualizations."""
    fig_speed = px.line(df, x='Date', y=['Vitesse moyenne (m/s)', 'Vitesse maximale (m/s)'],
                        title='Analyse de la Vitesse')

    fig_speed_dist = px.histogram(df, x='Vitesse moyenne (m/s)',
                                title='Distribution des Vitesses')

    return fig_speed, fig_speed_dist

def create_activity_distribution_charts(df):
    """Create activity distribution visualizations."""
    activity_data = pd.DataFrame({
        'Activity': ['Marche', 'Vélo', 'Course'],
        'Minutes': [
            df['walking_minutes'].sum(),
            df['cycling_minutes'].sum(),
            df['running_minutes'].sum()
        ]
    })

    fig_pie = px.pie(
        activity_data,
        values='Minutes',
        names='Activity',
        title='Répartition des Activités',
        hole=0.3
    )
    fig_pie.update_traces(textposition='inside', textinfo='percent+label')

    monthly_data = df.resample('ME', on='Date').sum()
    fig_monthly = px.bar(monthly_data, y='Points cardio',
                        title='Points Cardio Mensuels')

    return fig_pie, fig_monthly

def create_activity_heatmap(df):
    """Create activity heatmap visualization."""
    df['Hour'] = pd.to_datetime(df['Heure de début']).dt.hour
    df['Weekday'] = pd.to_datetime(df['Date']).dt.day_name()

    activity_heatmap = pd.pivot_table(
        df,
        values='Points cardio',
        index='Hour',
        columns='Weekday',
        aggfunc='mean'
    ).fillna(0)

    fig_heatmap = px.imshow(
        activity_heatmap,
        labels=dict(x="Jour de la Semaine", y="Heure", color="Points Cardio"),
        title="Distribution des Activités par Heure et Jour"
    )

    return fig_heatmap

def create_performance_comparison_chart(df):
    """Create performance comparison visualization."""
    weekly_metrics = df.resample('W', on='Date').agg({
        'Distance (km)': 'sum',
        'Points cardio': 'sum',
        'Nombre de pas': 'sum',
        'walking_minutes': 'sum',
        'cycling_minutes': 'sum',
        'running_minutes': 'sum'
    })

    fig = go.Figure()

    metrics_to_plot = {
        'Distance (km)': 'Distance (km)',
        'Points cardio': 'Points Cardio',
        'Total Minutes': weekly_metrics['walking_minutes'] +
                        weekly_metrics['cycling_minutes'] +
                        weekly_metrics['running_minutes']
    }

    for metric_name, metric_data in metrics_to_plot.items():
        fig.add_trace(go.Scatter(
            x=weekly_metrics.index,
            y=metric_data,
            name=metric_name,
            mode='lines+markers'
        ))

    fig.update_layout(
        title='Évolution Hebdomadaire des Performances',
        xaxis_title='Semaine',
        yaxis_title='Valeur',
        showlegend=True
    )

    return fig

def create_activity_map(df):
    """Create activity map visualization."""
    map_data = df[
        df['Basse latitude (°)'].notna() &
        df['Basse longitude (°)'].notna()
    ].copy()

    if not map_data.empty:
        fig = px.scatter_mapbox(
            map_data,
            lat='Basse latitude (°)',
            lon='Basse longitude (°)',
            color='Distance (m)',
            size='Nombre de pas',
            hover_data=['Date', 'Distance (km)', 'Minutes cardio'],
            zoom=11,
            title="Carte des Activités"
        )
        fig.update_layout(
            mapbox_style="open-street-map",
            margin={"r":0,"t":0,"l":0,"b":0}
        )
        return fig
    return None
