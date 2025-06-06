import json
import pandas as pd
import numpy as np
from datetime import datetime
import pytz
from geopy.distance import geodesic
from sklearn.cluster import DBSCAN
import hashlib

class DataProcessor:
    def __init__(self, location_history_path, cache=None):
        """
        Initialize the data processor with the location history file path.
        
        Args:
            location_history_path (str): Path to the location history JSON file
            cache: Optional caching mechanism
        """
        self.location_history_path = location_history_path
        self.cache = cache
        self.df = None
        self.cycling_df = None
        self._load_data()
        
    def _load_data(self):
        """Load the location history data and perform initial processing."""
        # Use cache if available
        if self.cache:
            self.df = self.cache.get('location_df')
            self.cycling_df = self.cache.get('cycling_df')
            
            if self.df is not None and self.cycling_df is not None:
                return
                
        # Load the raw data
        with open(self.location_history_path, 'r') as f:
            data = json.load(f)
            
        # Convert to dataframe
        locations = []
        for item in data.get('locations', []):
            loc = {
                'timestamp': int(item.get('timestampMs', 0)),
                'latitude': item.get('latitudeE7', 0) / 1e7,
                'longitude': item.get('longitudeE7', 0) / 1e7,
                'accuracy': item.get('accuracy', None),
                'activity': None,
                'activity_confidence': None,
                'velocity': item.get('velocity', None),
                'altitude': item.get('altitude', None)
            }
            
            # Extract activity information if available
            if 'activity' in item:
                activities = item['activity']
                if activities and len(activities) > 0:
                    activities_list = activities[0].get('activity', [])
                    if activities_list:
                        # Get the most likely activity
                        most_likely = max(activities_list, key=lambda x: x.get('confidence', 0))
                        loc['activity'] = most_likely.get('type', None)
                        loc['activity_confidence'] = most_likely.get('confidence', None)
                
            locations.append(loc)
            
        # Create main dataframe
        self.df = pd.DataFrame(locations)
        
        # Convert timestamp to datetime
        self.df['datetime'] = pd.to_datetime(self.df['timestamp'], unit='ms')
        
        # Filter for cycling activities
        self.cycling_df = self.df[self.df['activity'] == 'ON_BICYCLE'].copy()
        
        # Sort by timestamp
        self.cycling_df.sort_values('datetime', inplace=True)
        
        # Identify separate cycling sessions
        self.cycling_df['time_diff'] = self.cycling_df['datetime'].diff().dt.total_seconds()
        self.cycling_df['new_session'] = self.cycling_df['time_diff'] > 300  # 5 minute gap = new session
        self.cycling_df['session_id'] = self.cycling_df['new_session'].cumsum()
        
        # Calculate distances
        self.cycling_df['next_lat'] = self.cycling_df['latitude'].shift(-1)
        self.cycling_df['next_lon'] = self.cycling_df['longitude'].shift(-1)
        self.cycling_df['distance_km'] = self.cycling_df.apply(
            lambda row: geodesic(
                (row['latitude'], row['longitude']), 
                (row['next_lat'], row['next_lon'])
            ).kilometers if pd.notna(row['next_lat']) and row['session_id'] == self.cycling_df['session_id'].shift(-1) else 0, 
            axis=1
        )
        
        # Calculate session distances
        session_distances = self.cycling_df.groupby('session_id')['distance_km'].sum().reset_index()
        session_info = self.cycling_df.groupby('session_id').agg(
            start_time=('datetime', 'min'),
            end_time=('datetime', 'max'),
            avg_speed=('velocity', 'mean'),
            points=('datetime', 'count')
        ).reset_index()
        
        # Merge session information
        self.sessions = pd.merge(session_info, session_distances, on='session_id')
        self.sessions['duration_minutes'] = (self.sessions['end_time'] - self.sessions['start_time']).dt.total_seconds() / 60
        
        # Calculate route hashes for uniqueness
        self.cycling_df['route_point'] = self.cycling_df.apply(
            lambda row: f"{round(row['latitude'], 4)},{round(row['longitude'], 4)}", axis=1
        )
        
        # Cache the results if cache is available
        if self.cache:
            self.cache.set('location_df', self.df)
            self.cache.set('cycling_df', self.cycling_df)
            
    def get_cycling_summary(self):
        """Get summary statistics of cycling activities."""
        return {
            'total_sessions': len(self.sessions),
            'total_distance_km': self.sessions['distance_km'].sum(),
            'total_duration_minutes': self.sessions['duration_minutes'].sum(),
            'avg_distance_km': self.sessions['distance_km'].mean(),
            'avg_duration_minutes': self.sessions['duration_minutes'].mean(),
            'first_date': self.cycling_df['datetime'].min(),
            'last_date': self.cycling_df['datetime'].max(),
            'avg_speed_ms': self.cycling_df['velocity'].mean()
        }
        
    def get_sessions(self):
        """Get all cycling sessions."""
        return self.sessions
    
    def get_session_details(self, session_id):
        """Get details for a specific cycling session."""
        return self.cycling_df[self.cycling_df['session_id'] == session_id]
    
    def get_route_clusters(self, eps=0.005, min_samples=5):
        """
        Identify clusters of starting and ending points to find common routes.
        
        Args:
            eps (float): DBSCAN epsilon parameter (distance threshold)
            min_samples (int): DBSCAN min_samples parameter
        
        Returns:
            DataFrame with cluster information
        """
        # Get starting points for each session
        start_points = self.cycling_df.groupby('session_id').first().reset_index()
        
        # Cluster starting points
        coords = start_points[['latitude', 'longitude']].values
        clustering = DBSCAN(eps=eps, min_samples=min_samples).fit(coords)
        start_points['cluster'] = clustering.labels_
        
        return start_points
    
    def identify_unique_routes(self):
        """
        Identify unique cycling routes using route hashing.
        
        Returns:
            Dictionary mapping route hashes to session IDs
        """
        route_hashes = {}
        
        for session_id in self.sessions['session_id']:
            session_data = self.get_session_details(session_id)
            
            # Create a simplified route signature
            route_points = session_data.iloc[::5]['route_point'].tolist()  # Sample every 5th point
            route_signature = '_'.join(route_points)
            route_hash = hashlib.md5(route_signature.encode()).hexdigest()
            
            if route_hash in route_hashes:
                route_hashes[route_hash]['sessions'].append(session_id)
                route_hashes[route_hash]['count'] += 1
            else:
                route_hashes[route_hash] = {
                    'sessions': [session_id],
                    'count': 1,
                    'distance': session_data['distance_km'].sum(),
                    'sample_session': session_id
                }
                
        return route_hashes
    
    def generate_blockchain_data(self):
        """
        Generate data suitable for blockchain storage.
        
        Returns:
            List of dictionaries with session data optimized for blockchain storage
        """
        blockchain_data = []
        
        for _, session in self.sessions.iterrows():
            # Create a compact representation for blockchain
            session_data = {
                'session_id': int(session['session_id']),
                'start_time': int(session['start_time'].timestamp()),
                'end_time': int(session['end_time'].timestamp()),
                'distance_km': round(session['distance_km'], 3),
                'duration_min': round(session['duration_minutes'], 1),
                'points': int(session['points'])
            }
            
            # Get route information
            route_data = self.get_session_details(session['session_id'])
            
            # Calculate bounding box
            session_data['bounds'] = {
                'min_lat': round(route_data['latitude'].min(), 5),
                'max_lat': round(route_data['latitude'].max(), 5),
                'min_lon': round(route_data['longitude'].min(), 5),
                'max_lon': round(route_data['longitude'].max(), 5)
            }
            
            # Create a route hash for verification
            route_points = route_data['route_point'].tolist()
            route_signature = '_'.join(route_points)
            session_data['route_hash'] = hashlib.sha256(route_signature.encode()).hexdigest()
            
            blockchain_data.append(session_data)
            
        return blockchain_data