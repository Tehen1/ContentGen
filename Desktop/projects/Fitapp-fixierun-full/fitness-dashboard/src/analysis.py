"""
Analysis functions for fitness dashboard.
"""
import pandas as pd
import plotly.graph_objects as go
import folium

def calculate_activity_summaries(df):
    """Calculate summary statistics for different activity types."""
    summaries = {}
    activity_types = ['walking', 'cycling', 'running']
    
    for activity in activity_types:
        minutes_col = f'{activity}_minutes'
        if minutes_col in df.columns:
            summaries[activity] = {
                'total_minutes': df[minutes_col].sum(),
                'average_minutes': df[minutes_col].mean(),
                'active_days': (df[minutes_col] > 0).sum(),
                'peak_minutes': df[minutes_col].max(),
                'consistency': (df[minutes_col] > 0).mean() * 100
            }
    
    return summaries

def analyze_activity_patterns(df):
    """Analyze patterns in activity timing and frequency."""
    df = df.copy()
    df['hour'] = pd.to_datetime(df['Heure de début']).dt.hour
    df['weekday'] = pd.to_datetime(df['Date']).dt.day_name()
    
    patterns = {
        'hourly_distribution': df.groupby('hour')['Points cardio'].mean(),
        'weekday_distribution': df.groupby('weekday')['Points cardio'].mean(),
        'peak_hours': df.groupby('hour')['Points cardio'].mean().nlargest(3),
        'best_weekdays': df.groupby('weekday')['Points cardio'].mean().nlargest(3)
    }
    
    return patterns

def generate_activity_insights(df):
    """Generate insights about activity patterns and achievements."""
    insights = []
    
    patterns = analyze_activity_patterns(df)
    insights.append({
        'type': 'timing',
        'title': 'Heures Optimales',
        'description': f"Vos meilleures performances sont à {', '.join(f'{h}h' for h in patterns['peak_hours'].index)}"
    })
    
    weekly_data = df.resample('W', on='Date').sum()
    trends = weekly_data['Points cardio'].pct_change()
    improvement_weeks = (trends > 0.1).sum()
    insights.append({
        'type': 'progress',
        'title': 'Progression Hebdomadaire',
        'description': f"{improvement_weeks} semaines d'amélioration significative"
    })
    
    return insights

def analyze_performance_trends(df):
    """Calculate and visualize performance trends."""
    df_trends = df.copy()
    df_trends['Distance_MA'] = df_trends['Distance (km)'].rolling(window=7).mean()
    df_trends['Points_MA'] = df_trends['Points cardio'].rolling(window=7).mean()
    df_trends['Steps_MA'] = df_trends['Nombre de pas'].rolling(window=7).mean()
    
    df_trends['Distance_Growth'] = df_trends['Distance_MA'].pct_change(periods=30)
    df_trends['Points_Growth'] = df_trends['Points_MA'].pct_change(periods=30)
    df_trends['Steps_Growth'] = df_trends['Steps_MA'].pct_change(periods=30)
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=df_trends.index, y=df_trends['Distance_MA'],
                            name='Distance (km)', line=dict(color='blue')))
    fig.add_trace(go.Scatter(x=df_trends.index, y=df_trends['Points_MA'],
                            name='Points Cardio', line=dict(color='red')))
    
    fig.update_layout(title='Tendances de Performance',
                    xaxis_title='Date',
                    yaxis_title='Valeur')
    
    return {
        'progress_chart': fig,
        'improvements': {
            'distance': df_trends['Distance_Growth'].mean(),
            'points': df_trends['Points_Growth'].mean(),
            'steps': df_trends['Steps_Growth'].mean()
        }
    }

def calculate_activity_streaks(df):
    """Calculate activity streaks from the dataframe."""
    df = df.copy()
    MIN_DISTANCE = 1.0  # km
    MIN_POINTS = 10
    MIN_STEPS = 1000
    
    df['is_active'] = ((df['Distance (km)'] >= MIN_DISTANCE) |
                    (df['Points cardio'] >= MIN_POINTS) |
                    (df['Nombre de pas'] >= MIN_STEPS))
    
    streaks = []
    current_streak = 0
    
    for is_active in df['is_active']:
        if is_active:
            current_streak += 1
        else:
            streaks.append(current_streak)
            current_streak = 0
    
    streaks.append(current_streak)
    
    return {
        'current_streak': current_streak,
        'longest_streak': max(streaks),
        'average_streak': sum(streaks) / len(streaks) if streaks else 0
    }

def get_recent_achievements(df):
    """Identify recent achievements and milestones."""
    achievements = []
    last_30_days = df.tail(30)
    all_time = df
    
    if last_30_days['Distance (km)'].max() >= all_time['Distance (km)'].quantile(0.95):
        achievements.append(f"Nouveau record de distance: {last_30_days['Distance (km)'].max():.1f} km!")
        
    if last_30_days['Points cardio'].max() >= all_time['Points cardio'].quantile(0.95):
        achievements.append(f"Nouveau record de points cardio: {last_30_days['Points cardio'].max():.0f}!")
        
    if last_30_days['Nombre de pas'].max() >= all_time['Nombre de pas'].quantile(0.95):
        achievements.append(f"Nouveau record de pas: {last_30_days['Nombre de pas'].max():.0f}!")
    
    total_distance = df['Distance (km)'].sum()
    distance_milestones = [100, 500, 1000, 2000, 5000]
    for milestone in distance_milestones:
        if total_distance >= milestone:
            achievements.append(f"Félicitations! {milestone} km parcourus au total!")
    
    return achievements

def generate_route_map(tcx_data):
    """Generate an interactive map with activity routes."""
    m = folium.Map(location=[48.8566, 2.3522], zoom_start=12)
    
    activities = tcx_data['type'].unique()
    colors = ['red', 'blue', 'green', 'purple', 'orange']
    color_dict = dict(zip(activities, colors[:len(activities)]))
    
    for _, activity in tcx_data.iterrows():
        if 'trackpoints' in activity and activity['trackpoints']:
            coords = [(point['latitude'], point['longitude']) 
                    for point in activity['trackpoints']]
            
            folium.PolyLine(
                coords,
                weight=2,
                color=color_dict[activity['type']],
                popup=f"Type: {activity['type']}<br>Date: {activity['date']}"
            ).add_to(m)
            
            folium.Marker(
                coords[0],
                popup='Départ',
                icon=folium.Icon(color='green', icon='info-sign')
            ).add_to(m)
            folium.Marker(
                coords[-1],
                popup='Arrivée',
                icon=folium.Icon(color='red', icon='info-sign')
            ).add_to(m)
    
    return m

def calculate_route_statistics(tcx_data):
    """Calculate detailed statistics for each route."""
    stats = []
    
    for _, activity in tcx_data.iterrows():
        if 'trackpoints' in activity and activity['trackpoints']:
            trackpoints = activity['trackpoints']
            
            total_distance = sum(
                folium.vector_layers.path_options(
                    trackpoints[i]['latitude'],
                    trackpoints[i]['longitude'],
                    trackpoints[i+1]['latitude'],
                    trackpoints[i+1]['longitude']
                )
                for i in range(len(trackpoints)-1)
            )
            
            duration = (trackpoints[-1]['time'] - trackpoints[0]['time']).total_seconds() / 3600
            avg_speed = total_distance / duration if duration > 0 else 0
            
            stats.append({
                'Date': activity['date'],
                'Type': activity['type'],
                'Distance (km)': total_distance / 1000,
                'Durée (h)': duration,
                'Vitesse moyenne (km/h)': avg_speed,
            })
    
    return pd.DataFrame(stats)
