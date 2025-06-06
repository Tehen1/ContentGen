import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Union
import matplotlib.pyplot as plt
import io
import base64
from models.activity import Activity
from models.user import User

class ActivityAnalyzer:
    """Utility for analyzing user fitness activities"""
    
    @staticmethod
    def get_weekly_summary(user_id: str) -> Dict:
        """
        Get weekly activity summary for a user
        
        Args:
            user_id: User ID
            
        Returns:
            Dictionary with weekly summary data
        """
        # Get activities from the last 7 days
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)
        
        activities = Activity.objects(
            user_id=user_id,
            start_time__gte=start_date,
            start_time__lte=end_date
        )
        
        # Convert to DataFrame for easier analysis
        activities_data = []
        for activity in activities:
            activity_dict = activity.to_dict()
            
            # Convert string dates to datetime
            activity_dict['start_time'] = datetime.fromisoformat(activity_dict['start_time'])
            if activity_dict['end_time']:
                activity_dict['end_time'] = datetime.fromisoformat(activity_dict['end_time'])
                
            activities_data.append(activity_dict)
            
        if not activities_data:
            return {
                'total_activities': 0,
                'total_distance': 0,
                'total_duration': 0,
                'total_calories': 0,
                'activities_by_day': {},
                'activities_by_type': {}
            }
            
        df = pd.DataFrame(activities_data)
        
        # Add day of week
        df['day_of_week'] = df['start_time'].dt.strftime('%A')
        
        # Group by day of week
        daily_summary = df.groupby('day_of_week').agg({
            'id': 'count',
            'distance': 'sum',
            'duration': 'sum',
            'calories': 'sum'
        }).reset_index()
        
        daily_summary.columns = ['day_of_week', 'count', 'distance', 'duration', 'calories']
        
        # Group by activity type
        type_summary = df.groupby('activity_type').agg({
            'id': 'count',
            'distance': 'sum',
            'duration': 'sum',
            'calories': 'sum'
        }).reset_index()
        
        type_summary.columns = ['activity_type', 'count', 'distance', 'duration', 'calories']
        
        # Format result
        result = {
            'total_activities': len(df),
            'total_distance': float(df['distance'].sum()),
            'total_duration': int(df['duration'].sum()),
            'total_calories': int(df['calories'].sum()),
            'activities_by_day': {},
            'activities_by_type': {}
        }
        
        # Add daily summary
        for _, row in daily_summary.iterrows():
            result['activities_by_day'][row['day_of_week']] = {
                'count': int(row['count']),
                'distance': float(row['distance']),
                'duration': int(row['duration']),
                'calories': int(row['calories'])
            }
            
        # Add type summary
        for _, row in type_summary.iterrows():
            result['activities_by_type'][row['activity_type']] = {
                'count': int(row['count']),
                'distance': float(row['distance']),
                'duration': int(row['duration']),
                'calories': int(row['calories'])
            }
            
        return result
    
    @staticmethod
    def generate_activity_chart(user_id: str, days: int = 30, chart_type: str = 'bar') -> str:
        """
        Generate activity chart for a user
        
        Args:
            user_id: User ID
            days: Number of days to include in the chart
            chart_type: Type of chart ('bar', 'line', 'pie')
            
        Returns:
            Base64 encoded chart image
        """
        # Get activities from the specified period
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        activities = Activity.objects(
            user_id=user_id,
            start_time__gte=start_date,
            start_time__lte=end_date
        )
        
        # Convert to DataFrame for easier analysis
        activities_data = []
        for activity in activities:
            activity_dict = activity.to_dict()
            
            # Convert string dates to datetime
            activity_dict['start_time'] = datetime.fromisoformat(activity_dict['start_time'])
            if activity_dict['end_time']:
                activity_dict['end_time'] = datetime.fromisoformat(activity_dict['end_time'])
                
            activities_data.append(activity_dict)
            
        if not activities_data:
            # Create empty chart
            plt.figure(figsize=(10, 6))
            plt.title(f'No activities in the last {days} days')
            return ActivityAnalyzer._fig_to_base64(plt.gcf())
            
        df = pd.DataFrame(activities_data)
        
        # Add date
        df['date'] = df['start_time'].dt.date
        
        # Group by date and activity type
        daily_summary = df.groupby(['date', 'activity_type']).agg({
            'distance': 'sum',
            'duration': 'sum',
            'calories': 'sum'
        }).reset_index()
        
        # Create chart
        plt.figure(figsize=(12, 8))
        
        if chart_type == 'bar':
            # Bar chart of activities by date
            pivot = daily_summary.pivot(index='date', columns='activity_type', values='distance')
            pivot.plot(kind='bar', stacked=True, ax=plt.gca())
            plt.title(f'Distance by Activity Type (Last {days} Days)')
            plt.xlabel('Date')
            plt.ylabel('Distance (km)')
            plt.legend(title='Activity Type')
            plt.tight_layout()
            
        elif chart_type == 'line':
            # Line chart of distance over time
            daily_distance = df.groupby('date')['distance'].sum()
            plt.plot(daily_distance.index, daily_distance.values, marker='o')
            plt.title(f'Daily Distance (Last {days} Days)')
            plt.xlabel('Date')
            plt.ylabel('Distance (km)')
            plt.grid(True, linestyle='--', alpha=0.7)
            plt.tight_layout()
            
        elif chart_type == 'pie':
            # Pie chart of activity types
            type_summary = df.groupby('activity_type')['duration'].sum()
            plt.pie(type_summary, labels=type_summary.index, autopct='%1.1f%%')
            plt.title(f'Activity Types by Duration (Last {days} Days)')
            plt.axis('equal')
            
        else:
            # Default to bar chart
            pivot = daily_summary.pivot(index='date', columns='activity_type', values='distance')
            pivot.plot(kind='bar', stacked=True, ax=plt.gca())
            plt.title(f'Distance by Activity Type (Last {days} Days)')
            plt.xlabel('Date')
            plt.ylabel('Distance (km)')
            plt.legend(title='Activity Type')
            plt.tight_layout()
        
        # Convert chart to base64 string
        return ActivityAnalyzer._fig_to_base64(plt.gcf())
    
    @staticmethod
    def _fig_to_base64(fig):
        """
        Convert matplotlib figure to base64 encoded string
        
        Args:
            fig: Matplotlib figure
            
        Returns:
            Base64 encoded string
        """
        buffer = io.BytesIO()
        fig.savefig(buffer, format='png')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        plt.close(fig)
        return f"data:image/png;base64,{image_base64}"
    
    @staticmethod
    def get_user_trends(user_id: str, weeks: int = 4) -> Dict:
        """
        Get user activity trends over time
        
        Args:
            user_id: User ID
            weeks: Number of weeks of data to analyze
            
        Returns:
            Dictionary with trend analysis
        """
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(weeks=weeks)
        
        # Get user
        user = User.objects(id=user_id).first()
        if not user:
            return {'error': 'User not found'}
            
        # Get all activities in the period
        activities = Activity.objects(
            user_id=user_id,
            start_time__gte=start_date,
            start_time__lte=end_date
        )
        
        # Convert to DataFrame
        activities_data = []
        for activity in activities:
            activity_dict = activity.to_dict()
            
            # Convert string dates to datetime
            activity_dict['start_time'] = datetime.fromisoformat(activity_dict['start_time'])
            if activity_dict['end_time']:
                activity_dict['end_time'] = datetime.fromisoformat(activity_dict['end_time'])
                
            activities_data.append(activity_dict)
            
        if not activities_data:
            return {
                'user': user.to_dict(),
                'trend_analysis': {
                    'message': 'Not enough data for trend analysis'
                }
            }
            
        df = pd.DataFrame(activities_data)
        
        # Add week number
        df['week'] = (df['start_time'].dt.date - start_date.date()).dt.days // 7
        
        # Group by week
        weekly_summary = df.groupby('week').agg({
            'id': 'count',
            'distance': 'sum',
            'duration': 'sum',
            'calories': 'sum'
        }).reset_index()
        
        weekly_summary.columns = ['week', 'activities', 'distance', 'duration', 'calories']
        
        # Calculate trends
        trends = {}
        
        # Activity frequency trend
        if len(weekly_summary) > 1:
            activity_trend = np.polyfit(weekly_summary['week'], weekly_summary['activities'], 1)[0]
            trends['activity_frequency'] = {
                'trend': 'increasing' if activity_trend > 0 else 'decreasing',
                'value': float(activity_trend),
                'weekly_data': weekly_summary['activities'].tolist()
            }
            
            # Distance trend
            distance_trend = np.polyfit(weekly_summary['week'], weekly_summary['distance'], 1)[0]
            trends['distance'] = {
                'trend': 'increasing' if distance_trend > 0 else 'decreasing',
                'value': float(distance_trend),
                'weekly_data': weekly_summary['distance'].tolist()
            }
            
            # Duration trend
            duration_trend = np.polyfit(weekly_summary['week'], weekly_summary['duration'], 1)[0]
            trends['duration'] = {
                'trend': 'increasing' if duration_trend > 0 else 'decreasing',
                'value': float(duration_trend),
                'weekly_data': weekly_summary['duration'].tolist()
            }
            
            # Calories trend
            calories_trend = np.polyfit(weekly_summary['week'], weekly_summary['calories'], 1)[0]
            trends['calories'] = {
                'trend': 'increasing' if calories_trend > 0 else 'decreasing',
                'value': float(calories_trend),
                'weekly_data': weekly_summary['calories'].tolist()
            }
        else:
            trends['message'] = 'Not enough weekly data for trend analysis'
        
        # Generate insights
        insights = []
        
        if 'activity_frequency' in trends and trends['activity_frequency']['trend'] == 'increasing':
            insights.append('Your activity frequency is increasing! Keep up the good work.')
        elif 'activity_frequency' in trends and trends['activity_frequency']['trend'] == 'decreasing':
            insights.append('Your activity frequency is decreasing. Try to be more consistent with your workouts.')
            
        if 'distance' in trends and trends['distance']['trend'] == 'increasing':
            insights.append('You\'re covering more distance each week. Your endurance is improving!')
        
        # Identify preferred activity types
        if len(df) > 0:
            preferred_activities = df['activity_type'].value_counts().head(2).to_dict()
            
            if preferred_activities:
                top_activity = list(preferred_activities.keys())[0]
                insights.append(f'Your preferred activity is {top_activity}.')
        
        return {
            'user': user.to_dict(),
            'trend_analysis': trends,
            'insights': insights,
            'weeks_analyzed': weeks,
            'total_activities': len(df),
            'preferred_activities': df['activity_type'].value_counts().to_dict() if len(df) > 0 else {}
        }