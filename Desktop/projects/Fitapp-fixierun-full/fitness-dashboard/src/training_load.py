"""
Training load analysis module for fitness dashboard.

This module provides functions for analyzing training load, performance trends,
and workout intensity distribution.
"""

import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import plotly.subplots as make_subplots
from datetime import datetime, timedelta
import random
import math
from typing import Dict, List, Tuple, Optional, Any

# Constants
FIXIE_COLORS = {
    'primary': '#FF5722',
    'secondary1': '#3F51B5',
    'secondary2': '#4CAF50',
    'secondary3': '#FFC107',
    'background': '#F5F5F5',
    'text': '#333333',
    'grid': '#DDDDDD'
}

def analyze_heart_rate_zones(df: pd.DataFrame) -> Optional[pd.Series]:
    """
    Analyze heart rate distribution across training zones.

    Args:
        df: DataFrame with heart rate data

    Returns:
        pd.Series: Percentage of time spent in each heart rate zone
    """
    if 'heart_rate' not in df.columns:
        return None

    zones = {
        'Zone 1 (50-60%)': (0.5, 0.6),
        'Zone 2 (60-70%)': (0.6, 0.7),
        'Zone 3 (70-80%)': (0.7, 0.8),
        'Zone 4 (80-90%)': (0.8, 0.9),
        'Zone 5 (90-100%)': (0.9, 1.0)
    }

    max_hr = 220 - 30  # Default age-based formula, can be customized
    zone_data = {}

    for zone, (low, high) in zones.items():
        mask = (df['heart_rate'] >= max_hr * low) & (df['heart_rate'] < max_hr * high)
        zone_data[zone] = len(df[mask]) / np.size(df['heart_rate']) * 100

    return pd.Series(zone_data)

def calculate_training_load(activities_df: pd.DataFrame) -> float:
    """
    Calculate training load based on heart rate and duration.
    Uses heart rate reserve (HRR) method to quantify workout intensity,
    or returns a default value if heart rate data is not available.

    Args:
        activities_df: DataFrame or Series with activity data

    Returns:
        float: Training load score
    """
    # Check if the input is a Series (single row) or DataFrame
    if isinstance(activities_df, pd.Series):
        # For a Series, just check if heart_rate exists as a key
        if 'heart_rate' not in activities_df:
            return activities_df.get('Distance (km)', 1.0) * 5.0  # Default: 5 points per km

        # Calculate with heart rate if available
        hr = activities_df['heart_rate']
        duration = 1.0  # Default duration in hours
        max_hr = 220 - 30  # Default max HR
        hrr = (hr - 60) / (max_hr - 60)
        return duration * hrr * 100

    else:
        # For a DataFrame, check columns
        if 'heart_rate' not in activities_df.columns or activities_df.empty:
            # Use distance-based calculation as fallback
            if 'Distance (km)' in activities_df.columns:
                return activities_df['Distance (km)'].sum() * 5.0  # Default: 5 points per km
            return 10.0  # Default minimum value

        # Calculate with heart rate data
        if 'timestamp' in activities_df.columns and len(activities_df['timestamp']) > 1:
            duration_hours = (activities_df['timestamp'].max() - activities_df['timestamp'].min()).total_seconds() / 3600
        else:
            duration_hours = 1.0  # Default duration

        avg_hr = activities_df['heart_rate'].mean()
        max_hr = np.int16(220 - 30)  # Default age-based formula, can be customized
        hrr = (avg_hr - 60) / (max_hr - 60)  # Heart Rate Reserve calculation

        # Training load formula: duration * intensity * 100
        return duration_hours * hrr * 100

def plot_year_over_year_comparison(activities_df: Optional[pd.DataFrame] = None) -> go.Figure:
    """
    Compare monthly cycling metrics across different years.

    Args:
        activities_df: DataFrame with activity data

    Returns:
        go.Figure: Plotly figure with year-over-year comparison
    """
    if activities_df is None or activities_df.empty:
        # Generate sample data if real data is not available
        years = [datetime.now().year - i for i in range(3)]
        months = list(range(1, 13))

        data = []
        for year in years:
            for month in months:
                # Generate some realistic cycling distance values with seasonal pattern
                base_value = 120  # Base distance in km
                seasonal_factor = 0.7 + 0.6 * math.sin((month - 3) * math.pi / 6)  # Peak in summer
                yearly_improvement = 1.0 + 0.15 * (year - min(years))  # Improvement each year
                random_factor = random.uniform(0.8, 1.2)  # Random variation

                distance = base_value * seasonal_factor * yearly_improvement * random_factor

                data.append({
                    'Year': year,
                    'Month': month,
                    'Month_Name': datetime(2000, month, 1).strftime('%b'),
                    'Distance': distance,
                    'Date' : datetime(year, month, 1) # Add a date for plotting
                })

        comparison_df = pd.DataFrame(data)
    else:
        # Process real activities data
        comparison_df = activities_df.copy()

        # Ensure 'Date' is datetime type.
        comparison_df['Date'] = pd.to_datetime(comparison_df['Date'], errors='coerce')
        comparison_df.dropna(subset=['Date'], inplace=True)

        comparison_df['Year'] = comparison_df['Date'].dt.year
        comparison_df['Month'] = comparison_df['Date'].dt.month
        comparison_df['Month_Name'] = comparison_df['Date'].dt.strftime('%b')

        # Group by year and month
        comparison_df = comparison_df.groupby(['Year', 'Month', 'Month_Name']).agg({
            'Distance (km)': 'sum'
        }).reset_index()
        comparison_df.rename(columns={'Distance (km)': 'Distance'}, inplace=True)

    # Create the plot
    fig = px.line(
        comparison_df,
        x='Month_Name',
        y='Distance',
        color='Year',
        markers=True,
        labels={'Distance': 'Distance (km)', 'Month_Name': 'Month'},
        title='Year-over-Year Monthly Cycling Distance'
    )

    # Customize the layout
    fig.update_layout(
        xaxis_title='Month',
        yaxis_title='Distance (km)',
        legend_title='Year',
        xaxis={'categoryorder': 'array', 'categoryarray': [datetime(2000, i, 1).strftime('%b') for i in range(1, 13)]}
    )

    return apply_fixie_theme(fig)

def plot_training_load_chart(activities_df: Optional[pd.DataFrame] = None) -> go.Figure:
    """
    Show cumulative training load over time.

    Args:
        activities_df: DataFrame with activity data

    Returns:
        go.Figure: Plotly figure with training load chart
    """
    if activities_df is None or activities_df.empty:
        # Generate sample data if real data is not available
        days = 90  # Show 90 days of data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        dates = [start_date + timedelta(days=i) for i in range(days)]

        # Generate training load with weekly pattern and recovery weeks
        training_load = []

        base_load = 40  # Base training load
        weekly_pattern = [1.0, 0.7, 1.1, 0.6, 1.2, 1.4, 0.3]  # Weekly pattern with rest day

        current_load = 0
        decay_factor = 0.95  # Daily decay factor for previous training load

        for i, date in enumerate(dates):
            # Add weekly pattern
            day_of_week = date.weekday()
            day_load = base_load * weekly_pattern[day_of_week]

            # Add recovery weeks (lower load every 4th week)
            week_number = (date - start_date).days // 7
            if week_number % 4 == 3:  # Every 4th week is recovery
                day_load *= 0.6

            # Randomize a bit
            day_load *= random.uniform(0.8, 1.2)

            # Calculate accumulated load with decay
            current_load = current_load * decay_factor + day_load

            training_load.append({
                'Date': date,
                'Daily_Load': day_load,
                'Accumulated_Load': current_load
            })

        load_df = pd.DataFrame(training_load)
    else:
        # Process real activities data
        load_df = activities_df.copy()

        # Calculate training load for each activity
        load_df['Training_Load'] = load_df.apply(lambda x: calculate_training_load(x), axis=1)

        # Sort by date
        load_df = load_df.sort_values('Date')

        # Calculate accumulated load with decay
        decay_factor = 0.95
        accumulated_load = 0
        load_values = []

        for idx, row in load_df.iterrows():
            accumulated_load = accumulated_load * decay_factor + row['Training_Load']
            load_values.append(accumulated_load)

        load_df['Accumulated_Load'] = load_values
        load_df['Daily_Load'] = load_df['Training_Load']

    # Create figure with secondary y-axis
    fig = make_subplots.make_subplots(specs=[[{"secondary_y": True}]])

    # Add bar chart for daily load
    fig.add_trace(
        go.Bar(
            x=load_df['Date'],
            y=load_df['Daily_Load'],
            name='Daily Training Load',
            marker_color=FIXIE_COLORS['secondary1']
        ),
        secondary_y=False
    )

    # Add line chart for accumulated load
    fig.add_trace(
        go.Scatter(
            x=load_df['Date'],
            y=load_df['Accumulated_Load'],
            name='Accumulated Training Load',
            line=dict(color=FIXIE_COLORS['primary'], width=3)
        ),
        secondary_y=True
    )

    # Add titles and labels
    fig.update_layout(
        title_text='Training Load Over Time',
        xaxis_title='Date',
        barmode='overlay'
    )

    fig.update_yaxes(title_text='Daily Training Load', secondary_y=False)
    fig.update_yaxes(title_text='Accumulated Training Load', secondary_y=True)

    return apply_fixie_theme(fig)

def plot_performance_trends(activities_df: Optional[pd.DataFrame] = None) -> go.Figure:
    """
    Shows trends in speed, distance, and elevation gain over time.

    Args:
        activities_df: DataFrame with activity data

    Returns:
        go.Figure: Plotly figure with performance trends
    """
    if activities_df is None or activities_df.empty:
        # Generate sample data if real data is not available
        days = 60  # Show 60 days of data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        # Generate random dates within the range (not every day will have an activity)
        num_activities = 30  # About every other day
        activity_dates = sorted([start_date + timedelta(days=random.randint(0, days))
                              for _ in range(num_activities)])

        # Generate performance metrics with overall improving trend
        trend_data = []

        # Base values
        base_speed = 25  # km/h
        base_distance = 30  # km
        base_elevation = 350  # meters

        # Improvement factors over time
        for i, date in enumerate(activity_dates):
            progress_factor = i / num_activities  # 0 to 1 over time period
            improvement = 1 + (progress_factor * 0.15)  # Up to 15% improvement

            # Add some randomness
            speed = base_speed * improvement * random.uniform(0.9, 1.1)
            distance = base_distance * improvement * random.uniform(0.8, 1.2)
            elevation = base_elevation * improvement * random.uniform(0.85, 1.15)

            trend_data.append({
                'Date': date,
                'Speed': speed,
                'Distance': distance,
                'Elevation': elevation
            })

        trend_df = pd.DataFrame(trend_data)
    else:
        # Process real activities data
        trend_df = activities_df.copy()

        # Ensure we have the Speed column
        if 'Speed' not in trend_df.columns:
            if 'Avg Speed (km/h)' in trend_df.columns:
                trend_df['Speed'] = trend_df['Avg Speed (km/h)']
            elif 'Vitesse moyenne (m/s)' in trend_df.columns:
                # Convert m/s to km/h
                trend_df['Speed'] = trend_df['Vitesse moyenne (m/s)'] * 3.6
            else:
                # Create a sample speed based on distance if available
                if 'Distance (km)' in trend_df.columns:
                    trend_df['Speed'] = trend_df['Distance (km)'] / 2 + 15  # Rough estimate: 15 km/h + variation
                else:
                    # Default speed
                    trend_df['Speed'] = 25.0

        # Ensure we have the Distance column
        if 'Distance' not in trend_df.columns and 'Distance (km)' in trend_df.columns:
            trend_df['Distance'] = trend_df['Distance (km)']
        elif 'Distance' not in trend_df.columns and 'Distance (m)' in trend_df.columns:
            trend_df['Distance'] = trend_df['Distance (m)'] / 1000
        elif 'Distance' not in trend_df.columns:
            # Default distance
            trend_df['Distance'] = 30.0

        # If elevation data is not available, estimate it
        if 'Elevation' not in trend_df.columns:
            trend_df['Elevation'] = trend_df['Distance'] * 10  # Rough estimate: 10m per km

    # Create the performance trend plots
    fig = make_subplots.make_subplots(rows=3, cols=1,
                                   shared_xaxes=True,
                                   subplot_titles=('Average Speed', 'Ride Distance', 'Elevation Gain'),
                                   vertical_spacing=0.1)

    # Add speed trend
    fig.add_trace(
        go.Scatter(
            x=trend_df['Date'],
            y=trend_df['Speed'],
            mode='markers+lines',
            name='Speed',
            marker=dict(color=FIXIE_COLORS['primary']),
            line=dict(color=FIXIE_COLORS['primary'])
        ),
        row=1, col=1
    )

    # Add rolling average line for speed
    if len(trend_df) >= 5:  # Need at least 5 points for meaningful rolling average
        trend_df['Speed_Rolling'] = trend_df['Speed'].rolling(window=5, min_periods=1).mean()
        fig.add_trace(
            go.Scatter(
                x=trend_df['Date'],
                y=trend_df['Speed_Rolling'],
                mode='lines',
                name='Speed Trend',
                line=dict(color=FIXIE_COLORS['secondary1'], width=3, dash='dash')
            ),
            row=1, col=1
        )

    # Add distance trend
    fig.add_trace(
        go.Scatter(
            x=trend_df['Date'],
            y=trend_df['Distance'],
            mode='markers+lines',
            name='Distance',
            marker=dict(color=FIXIE_COLORS['secondary2']),
            line=dict(color=FIXIE_COLORS['secondary2'])
        ),
        row=2, col=1
    )

    # Add elevation trend
    fig.add_trace(
        go.Scatter(
            x=trend_df['Date'],
            y=trend_df['Elevation'],
            mode='markers+lines',
            name='Elevation',
            marker=dict(color=FIXIE_COLORS['secondary3']),
            line=dict(color=FIXIE_COLORS['secondary3'])
        ),
        row=3, col=1
    )

    # Update layout
    fig.update_layout(
        height=800,
        title_text='Performance Trends Over Time',
        showlegend=True
    )

    return apply_fixie_theme(fig)

def apply_fixie_theme(fig: go.Figure) -> go.Figure:
    """Apply consistent styling to Plotly figures."""
    # Apply layout settings
    layout_settings = {
        'font_family': "Arial, sans-serif",
        'title_font_family': "Arial, sans-serif",
        'plot_bgcolor': FIXIE_COLORS['background'],
        'paper_bgcolor': FIXIE_COLORS['background'],
        'font_color': FIXIE_COLORS['text'],
        'title_font_color': FIXIE_COLORS['primary'],
        'legend_title_font_color': FIXIE_COLORS['primary'],
        'margin': dict(l=40, r=40, t=50, b=40)
    }

    # Create colorway
    colorway = [
        FIXIE_COLORS['primary'],
        FIXIE_COLORS['secondary1'],
        FIXIE_COLORS['secondary2'],
        FIXIE_COLORS['secondary3']
    ]

    # Apply layout settings and colorway
    fig.update_layout(layout_settings, colorway=colorway)


    # Update x-axes
    xaxes_settings = {
        'gridcolor': FIXIE_COLORS['grid'],
        'zeroline': False,
        'title_font': dict(family="Arial, sans-serif", color=FIXIE_COLORS['primary']),
        'tickfont': dict(family="Arial, sans-serif", color=FIXIE_COLORS['text'])
    }
    fig.update_xaxes(**xaxes_settings)

    # Update y-axes
    yaxes_settings = {
        'gridcolor': FIXIE_COLORS['grid'],
        'zeroline': False,
        'title_font': dict(family="Arial, sans-serif", color=FIXIE_COLORS['primary']),
        'tickfont': dict(family="Arial, sans-serif", color=FIXIE_COLORS['text'])
    }
    fig.update_yaxes(**yaxes_settings)

    return fig