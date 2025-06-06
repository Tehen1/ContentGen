#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API integrations with third-party platforms like Strava, Komoot, and TrainingPeaks.
"""

import requests
import json
import os
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional, List, Union
from datetime import datetime, timedelta
import time

class StravaAPI:
    """Strava API integration for importing activities"""
    
    def __init__(self, client_id: str, client_secret: str, refresh_token: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.refresh_token = refresh_token
        self.access_token = None
        self.token_expires_at = 0
        self.rate_limit_count = 0
        self.rate_limit_reset = 0
    
    def _refresh_access_token(self) -> bool:
        """Get new access token using refresh token"""
        url = "https://www.strava.com/oauth/token"
        payload = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'refresh_token': self.refresh_token,
            'grant_type': 'refresh_token'
        }
        
        try:
            response = requests.post(url, data=payload)
            if response.status_code == 200:
                token_data = response.json()
                self.access_token = token_data['access_token']
                self.token_expires_at = token_data['expires_at']
                return True
            else:
                print(f"Error refreshing token: {response.status_code}")
                return False
        except Exception as e:
            print(f"Exception refreshing token: {e}")
            return False
    
    def _ensure_valid_token(self) -> bool:
        """Ensure we have a valid access token"""
        current_time = datetime.now().timestamp()
        if not self.access_token or current_time >= self.token_expires_at:
            return self._refresh_access_token()
        return True
    
    def _check_rate_limit(self, response) -> bool:
        """Check and handle API rate limits"""
        # Extract rate limit headers if they exist
        limit = response.headers.get('X-RateLimit-Limit')
        usage = response.headers.get('X-RateLimit-Usage')
        
        if limit and usage:
            print(f"Strava API Rate Limit: {usage}/{limit}")
            
            # Parse usage
            daily_usage = int(usage.split(',')[0])
            fifteen_min_usage = int(usage.split(',')[1])
            
            # If near the 15-minute limit (100 requests), wait for reset
            if fifteen_min_usage > 90:
                print("Approaching 15-minute rate limit, pausing for 15 minutes")
                time.sleep(60 * 15)  # Sleep for 15 minutes
                return True
            
            # If near the daily limit (1000 requests), warn the user
            if daily_usage > 900:
                print("WARNING: Approaching daily rate limit!")
        
        return True
    
    def get_activities(self, limit: int = 30, before: Optional[datetime] = None, after: Optional[datetime] = None) -> List[Dict]:
        """
        Get activities from Strava API
        
        Args:
            limit: Maximum number of activities to retrieve
            before: Only get activities before this datetime
            after: Only get activities after this datetime
            
        Returns:
            List of activity dictionaries
        """
        if not self._ensure_valid_token():
            return []
        
        url = "https://www.strava.com/api/v3/athlete/activities"
        headers = {'Authorization': f'Bearer {self.access_token}'}
        params = {'per_page': min(limit, 100), 'page': 1}
        
        # Add time filters if provided
        if before:
            params['before'] = int(before.timestamp())
        if after:
            params['after'] = int(after.timestamp())
        
        all_activities = []
        current_page = 1
        total_retrieved = 0
        
        while total_retrieved < limit:
            params['page'] = current_page
            
            try:
                response = requests.get(url, headers=headers, params=params)
                self._check_rate_limit(response)
                
                if response.status_code == 200:
                    activities = response.json()
                    if not activities:
                        # No more activities to retrieve
                        break
                        
                    # Only include cycling activities
                    cycling_activities = [a for a in activities if a.get('type') == 'Ride']
                    all_activities.extend(cycling_activities)
                    total_retrieved += len(cycling_activities)
                    
                    # Go to next page
                    current_page += 1
                else:
                    print(f"Error getting activities: {response.status_code}")
                    break
            except Exception as e:
                print(f"Exception getting activities: {e}")
                break
        
        return all_activities[:limit]
    
    def get_activity_streams(self, activity_id: int) -> Dict:
        """Get detailed data streams for an activity"""
        if not self._ensure_valid_token():
            return {}
        
        url = f"https://www.strava.com/api/v3/activities/{activity_id}/streams"
        headers = {'Authorization': f'Bearer {self.access_token}'}
        params = {
            'keys': 'time,latlng,distance,altitude,heartrate,cadence,watts,temp',
            'key_by_type': True
        }
        
        try:
            response = requests.get(url, headers=headers, params=params)
            self._check_rate_limit(response)
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error getting activity streams: {response.status_code}")
                return {}
        except Exception as e:
            print(f"Exception getting activity streams: {e}")
            return {}
    
    def activities_to_dataframe(self, activities: List[Dict]) -> pd.DataFrame:
        """Convert Strava activities to DataFrame format"""
        records = []
        
        for activity in activities:
            # Basic activity data
            activity_record = {
                'id': activity.get('id'),
                'name': activity.get('name'),
                'start_time': pd.to_datetime(activity.get('start_date')),
                'end_time': pd.to_datetime(activity.get('start_date')) + 
                           timedelta(seconds=activity.get('elapsed_time', 0)),
                'activity_type': 'cycling',
                'distance_km': activity.get('distance') / 1000 if activity.get('distance') else 0,
                'duration_minutes': activity.get('elapsed_time') / 60 if activity.get('elapsed_time') else 0,
                'avg_speed_km_h': activity.get('average_speed') * 3.6 if activity.get('average_speed') else 0,
                'max_speed_km_h': activity.get('max_speed') * 3.6 if activity.get('max_speed') else 0,
                'elevation_gain': activity.get('total_elevation_gain'),
                'avg_heart_rate': activity.get('average_heartrate'),
                'max_heart_rate': activity.get('max_heartrate'),
                'calories': activity.get('calories'),
                'moving_time_minutes': activity.get('moving_time') / 60 if activity.get('moving_time') else 0
            }
            
            # Add coordinates for start and end
            if activity.get('start_latlng'):
                activity_record['start_latitude'] = activity['start_latlng'][0]
                activity_record['start_longitude'] = activity['start_latlng'][1]
            
            if activity.get('end_latlng'):
                activity_record['end_latitude'] = activity['end_latlng'][0]
                activity_record['end_longitude'] = activity['end_latlng'][1]
            
            records.append(activity_record)
        
        return pd.DataFrame(records)
    
    def activity_streams_to_dataframe(self, activity_id: int, streams: Dict) -> pd.DataFrame:
        """Convert activity streams to DataFrame format"""
        if not streams:
            return pd.DataFrame()
        
        # Initialize dataframe with time points if available
        time_data = streams.get('time', {}).get('data', [])
        if not time_data:
            return pd.DataFrame()
        
        df = pd.DataFrame({'time_offset': time_data})
        
        # Add each stream type to the dataframe
        if 'latlng' in streams and streams['latlng'].get('data'):
            # latlng data is a list of [lat, lng] pairs
            latlng_data = streams['latlng']['data']
            df['latitude'] = [point[0] for point in latlng_data]
            df['longitude'] = [point[1] for point in latlng_data]
        
        # Add other streams
        for stream_type in ['distance', 'altitude', 'heartrate', 'cadence', 'watts', 'temp']:
            if stream_type in streams and streams[stream_type].get('data'):
                df[stream_type] = streams[stream_type]['data']
        
        # Calculate additional metrics
        if 'distance' in df.columns:
            # Convert from meters to kilometers
            df['distance_km'] = df['distance'] / 1000
            
            # Calculate segment distances
            df['segment_distance_km'] = df['distance_km'].diff().fillna(0)
            
            # Calculate speed (km/h)
            if 'time_offset' in df.columns:
                df['time_diff_sec'] = df['time_offset'].diff().fillna(0)
                # Avoid division by zero
                mask = df['time_diff_sec'] > 0
                df.loc[mask, 'speed_km_h'] = (
                    df.loc[mask, 'segment_distance_km'] / 
                    df.loc[mask, 'time_diff_sec'] * 3600
                )
        
        # Add activity ID
        df['activity_id'] = activity_id
        
        return df

    def get_complete_activity(self, activity_id: int) -> pd.DataFrame:
        """Get complete activity data including streams"""
        streams = self.get_activity_streams(activity_id)
        return self.activity_streams_to_dataframe(activity_id, streams)
    
    def get_recent_activities_data(self, count: int = 5) -> pd.DataFrame:
        """Get complete data for recent activities"""
        activities = self.get_activities(limit=count)
        
        all_dfs = []
        for activity in activities:
            activity_id = activity.get('id')
            if activity_id:
                # Get activity streams
                df = self.get_complete_activity(activity_id)
                
                # Add activity details to each row
                df['name'] = activity.get('name')
                df['start_date'] = pd.to_datetime(activity.get('start_date'))
                
                # Add start timestamp to time_offset to get absolute time
                if 'time_offset' in df.columns:
                    df['timestamp'] = df['start_date'] + pd.to_timedelta(df['time_offset'], unit='s')
                
                all_dfs.append(df)
                
                # Respect rate limits - pause between activities
                time.sleep(1)
        
        if all_dfs:
            return pd.concat(all_dfs, ignore_index=True)
        else:
            return pd.DataFrame()

class KomootAPI:
    """Simple Komoot integration for importing GPX files from Google Drive"""
    
    def __init__(self, drive_folder_path: str):
        self.drive_folder_path = drive_folder_path
    
    def list_gpx_files(self) -> List[str]:
        """List all GPX files in the specified Drive folder"""
        gpx_files = []
        
        if os.path.exists(self.drive_folder_path):
            for file_name in os.listdir(self.drive_folder_path):
                if file_name.lower().endswith('.gpx'):
                    gpx_files.append(os.path.join(self.drive_folder_path, file_name))
        
        return gpx_files
    
    def import_gpx_files(self) -> pd.DataFrame:
        """Import all GPX files from the Drive folder"""
        from import_processors import parse_gpx_file
        
        gpx_files = self.list_gpx_files()
        all_dfs = []
        
        for file_path in gpx_files:
            df = parse_gpx_file(file_path)
            if not df.empty:
                # Add file name as source
                df['source'] = os.path.basename(file_path)
                all_dfs.append(df)
        
        if all_dfs:
            return pd.concat(all_dfs, ignore_index=True)
        else:
            return pd.DataFrame()

def export_to_fit_format(df: pd.DataFrame, output_path: str) -> bool:
    """
    Export DataFrame to FIT format for Training Peaks
    This is a simplified version that requires the fitparse library
    """
    try:
        # Check if fitparse is available
        import fitparse
        from fitparse import FitFile, DataMessage, FitEncoder
        
        if df.empty:
            print("Cannot export empty DataFrame to FIT")
            return False
        
        # Create a new FIT file
        fit_file = FitEncoder()
        
        # Add file ID message
        fit_file.add_message('file_id', 
                            {'type': 'activity',
                             'manufacturer': 'development',
                             'product': 1,
                             'time_created': int(datetime.now().timestamp()),
                             'serial_number': 12345})
        
        # Add activity message
        activity_timestamp = df['timestamp'].min().timestamp() if 'timestamp' in df.columns else datetime.now().timestamp()
        fit_file.add_message('activity',
                           {'timestamp': int(activity_timestamp),
                            'total_timer_time': int(df['duration_minutes'].max() * 60) if 'duration_minutes' in df.columns else 0,
                            'num_sessions': 1,
                            'type': 'cycling'})
        
        # Add record messages for each data point
        if 'timestamp' in df.columns:
            for _, row in df.iterrows():
                record_msg = {}
                
                # Add required fields
                if 'timestamp' in df.columns:
                    record_msg['timestamp'] = int(row['timestamp'].timestamp())
                
                # Add position data
                if 'latitude' in df.columns and 'longitude' in df.columns:
                    record_msg['position_lat'] = int(row['latitude'] * 1e7)
                    record_msg['position_long'] = int(row['longitude'] * 1e7)
                
                # Add other optional fields
                if 'distance_km' in df.columns:
                    recor

