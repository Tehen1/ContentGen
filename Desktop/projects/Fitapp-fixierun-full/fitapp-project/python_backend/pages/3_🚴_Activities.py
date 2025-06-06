import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import pydeck as pdk
from datetime import datetime, timedelta
import random
import json
import math
from PIL import Image
import colorsys

# Page configuration
st.set_page_config(
    page_title="FixieRun - Activities",
    page_icon="🚴",
    layout="wide"
)

# Check authentication status (from main app)
if 'authenticated' not in st.session_state or not st.session_state.authenticated:
    st.warning("Please login from the main page to access your activities.")
    st.stop()

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        color: #FF5A5F;
        font-weight: 700;
    }
    .sub-header {
        font-size: 1.5rem;
        color: #666;
        font-weight: 500;
    }
    .metric-card {
        background-color: #f7f7f7;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .metric-label {
        font-size: 1rem;
        color: #666;
    }
    .metric-value {
        font-size: 2rem;
        font-weight: 700;
        color: #FF5A5F;
    }
    .metric-delta {
        font-size: 0.9rem;
    }
    .positive-delta {
        color: #28a745;
    }
    .negative-delta {
        color: #dc3545;
    }
    .activity-card {
        background-color: #f7f7f7;
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 15px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: transform 0.2s ease;
    }
    .activity-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
    }
    .filter-container {
        background-color: #f0f0f0;
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 20px;
    }
    .detail-view {
        background-color: #f7f7f7;
        border-radius: 15px;
        padding: 20px;
        margin-top: 20px;
    }
    .stButton>button {
        background-color: #FF5A5F;
        color: white;
        border-radius: 5px;
        border: none;
        padding: 8px 16px;
    }
    .stButton>button:hover {
        background-color: #FF4046;
    }
    div[data-testid="stHorizontalBlock"] {
        gap: 10px;
    }
</style>
""", unsafe_allow_html=True)

# Generate sample activity data
@st.cache_data
def generate_activity_data(num_activities=30):
    activities = []
    
    # Paris coordinates as center point
    center_lat, center_lon = 48.8566, 2.3522
    
    # Generate activities for the past 30 days
    end_date = datetime.now()
    start_date = end_date - timedelta(days=num_activities)
    
    date_range = [start_date + timedelta(days=i) for i in range(num_activities)]
    
    activity_types = ["Morning Commute", "Evening Ride", "Weekend Exploration", "Fitness Ride", "City Tour"]
    weather_conditions = ["Sunny", "Cloudy", "Light Rain", "Overcast", "Clear"]
    
    for i, activity_date in enumerate(date_range):
        # Basic activity parameters
        activity_type = random.choice(activity_types)
        is_weekend = activity_date.weekday() >= 5
        
        # Generate more intense activities on weekends
        base_distance = random.uniform(8, 25) if is_weekend else random.uniform(3, 12)
        distance = round(base_distance, 2)
        
        # Calculate route duration based on distance and average speed
        avg_speed = random.uniform(15, 25)  # km/h
        duration_hours = distance / avg_speed
        duration_minutes = duration_hours * 60
        
        # Calculate calories burned (roughly 40 calories per km)
        calories = int(distance * random.uniform(35, 45))
        
        # Calculate token earnings (base + performance bonus)
        token_base = distance * random.uniform(0.5, 0.7)
        token_bonus = token_base * random.uniform(0, 0.3)  # Up to 30% bonus
        tokens_earned = round(token_base + token_bonus, 2)
        
        # Generate heart rate data
        avg_heart_rate = random.randint(130, 170)
        max_heart_rate = avg_heart_rate + random.randint(10, 30)
        
        # Generate elevation data
        elevation_gain = int(distance * random.uniform(5, 15))
        
        # Generate route coordinates (circular route around Paris with some randomness)
        num_points = int(distance * 10)  # More points for longer routes
        route_points = []
        
        # Create a circular route with some randomness
        radius = distance / (2 * math.pi) * 0.01  # Convert km to approximate degrees
        center_angle = random.uniform(0, 2 * math.pi)
        
        for j in range(num_points):
            angle = center_angle + (j / num_points) * 2 * math.pi
            # Add some randomness to the route
            r = radius * (1 + 0.2 * random.uniform(-1, 1))
            lat = center_lat + r * math.cos(angle)
            lon = center_lon + r * math.sin(angle)
            route_points.append([lon, lat])  # GeoJSON format is [longitude, latitude]
        
        # Close the loop
        route_points.append(route_points[0])
        
        # Generate start time (morning rides 6-9 AM, evening rides 5-7 PM)
        if "Morning" in activity_type:
            hour = random.randint(6, 9)
        elif "Evening" in activity_type:
            hour = random.randint(17, 19)
        else:
            hour = random.randint(10, 16)
            
        minute = random.randint(0, 59)
        start_time = activity_date.replace(hour=hour, minute=minute)
        
        # Create activity object
        activity = {
            "id": f"ACT-{i+1:04d}",
            "date": activity_date.strftime("%Y-%m-%d"),
            "time": start_time.strftime("%H:%M"),
            "datetime": start_time,
            "title": f"{activity_type} - {distance:.1f}km",
            "type": activity_type,
            "distance": distance,
            "duration": duration_minutes,
            "avg_speed": avg_speed,
            "max_speed": avg_speed * random.uniform(1.2, 1.5),
            "calories": calories,
            "tokens_earned": tokens_earned,
            "avg_heart_rate": avg_heart_rate,
            "max_heart_rate": max_heart_rate,
            "elevation_gain": elevation_gain,
            "weather": random.choice(weather_conditions),
            "temperature": random.randint(15, 30),
            "route_coordinates": route_points,
            "start_coordinates": route_points[0],
            "end_coordinates": route_points[-1]
        }
        activities.append(activity)
    
    return activities

# Main page header
st.markdown('<p class="main-header">Activity Tracking</p>', unsafe_allow_html=True)
st.markdown('<p class="sub-header">Monitor your cycling performance and token earnings</p>', unsafe_allow_html=True)

# Generate sample activity data
activity_data = generate_activity_data(45)
activities_df = pd.DataFrame(activity_data)
activities_df['datetime'] = pd.to_datetime(activities_df['datetime'])
activities_df['date'] = pd.to_datetime(activities_df['date'])

# Filters section
st.markdown('<div class="filter-container">', unsafe_allow_html=True)
col1, col2, col3 = st.columns(3)

with col1:
    # Date range filter
    min_date = activities_df['date'].min().date()
    max_date = activities_df['date'].max().date()
    default_start = max_date - timedelta(days=30)
    
    date_range = st.date_input(
        "Date range",
        value=(default_start, max_date),
        min_value=min_date,
        max_value=max_date
    )
    
    if len(date_range) == 2:
        start_date, end_date = date_range
        filtered_activities = activities_df[
            (activities_df['date'].dt.date >= start_date) & 
            (activities_df['date'].dt.date <= end_date)
        ]
    else:
        filtered_activities = activities_df.copy()

with col2:
    # Activity type filter
    activity_types = ['All'] + sorted(activities_df['type'].unique().tolist())
    selected_type = st.selectbox("Activity type", activity_types)
    
    if selected_type != 'All':
        filtered_activities = filtered_activities[filtered_activities['type'] == selected_type]

with col3:
    # Distance filter
    min_distance = int(activities_df['distance'].min())
    max_distance = int(activities_df['distance'].max()) + 1
    
    distance_range = st.slider(
        "Distance (km)",
        min_value=min_distance,
        max_value=max_distance,
        value=(min_distance, max_distance)
    )
    
    filtered_activities = filtered_activities[
        (filtered_activities['distance'] >= distance_range[0]) & 
        (filtered_activities['distance'] <= distance_range[1])
    ]

# Sort option
sort_options = {
    "Date (newest first)": ("datetime", False),
    "Date (oldest first)": ("datetime", True),
    "Distance (highest first)": ("distance", False),
    "Distance (lowest first)": ("distance", True),
    "Duration (longest first)": ("duration", False),
    "Tokens earned (highest first)": ("tokens_earned", False)
}

selected_sort = st.selectbox("Sort by", options=list(sort_options.keys()))
sort_column, ascending = sort_options[selected_sort]
filtered_activities = filtered_activities.sort_values(by=sort_column, ascending=ascending)

st.markdown('</div>', unsafe_allow_html=True)

# Activity Statistics
st.markdown("### Activity Statistics")
stats_col1, stats_col2, stats_col3, stats_col4 = st.columns(4)

with stats_col1:
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.markdown("**Total Activities**")
    st.markdown(f'<p class="metric-value">{len(filtered_activities)}</p>', unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

with stats_col2:
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.markdown("**Total Distance**")
    total_distance = filtered_activities['distance'].sum()
    st.markdown(f'<p class="metric-value">{total_distance:.1f} km</p>', unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

with stats_col3:
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.markdown("**Total Calories**")
    total_calories = filtered_activities['calories'].sum()
    st.markdown(f'<p class="metric-value">{total_calories:,}</p>', unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

with stats_col4:
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.markdown("**Total $FIXIE Earned**")
    total_tokens = filtered_activities['tokens_earned'].sum()
    st.markdown(f'<p class="metric-value">{total_tokens:.2f}</p>', unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

# Performance trends
st.markdown("### Performance Trends")

# Prepare data for trends
trends_df = filtered_activities.copy()
trends_df['week'] = trends_df['date'].dt.isocalendar().week
trends_df['month'] = trends_df['date'].dt.month
trends_df['year_month'] = trends_df['date'].dt.strftime('%Y-%m')

# Weekly distance trend
weekly_distance = trends_df.groupby('week')['distance'].sum().reset_index()
weekly_distance['week'] = weekly_distance['week'].astype(str)

fig_distance = px.line(
    weekly_distance, 
    x='week', 
    y='distance',
    markers=True,
    title="Weekly Distance (km)",
    labels={"week": "Week", "distance": "Distance (km)"}
)
fig_distance.update_traces(line_color='#FF5A5F', line_width=3)

# Weekly tokens trend
weekly_tokens = trends_df.groupby('week')['tokens_earned'].sum().reset_index()
weekly_tokens['week'] = weekly_tokens['week'].astype(str)

fig_tokens = px.line(
    weekly_tokens, 
    x='week', 
    y='tokens_earned',
    markers=True,
    title="Weekly $FIXIE Earnings",
    labels={"week": "Week", "tokens_earned": "$FIXIE Tokens"}
)
fig_tokens.update_traces(line_color='#28a745', line_width=3)

# Display charts side by side
col1, col2 = st.columns(2)
with col1:
    st.plotly_chart(fig_distance, use_container_width=True)
with col2:
    st.plotly_chart(fig_tokens, use_container_width=True)

# Performance metrics over time
st.markdown("### Performance Metrics")

# Speed vs Distance scatter plot
fig_performance = px.scatter(
    filtered_activities,
    x="distance",
    y="avg_speed",
    size="tokens_earned",
    color="type",
    hover_name="title",
    title="Speed vs Distance",
    labels={"distance": "Distance (km)", "avg_speed": "Average Speed (km/h)"},

