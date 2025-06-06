import unittest
import json
import mongomock
import os
import sys
import jwt
from datetime import datetime, timedelta
from flask import Flask
from bson import ObjectId

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Use pytest-dotenv to load environment variables from .env.tes't
from dotenv import load_dotenv
load_dotenv('.env.test')

# Import app and models
from app import app as _app
from models.user import User
from models.activity import Activity
from routes.auth_routes import token_required

class TestActivityAPI(unittest.TestCase):
    """Test cases for Activity API"""
    
    def setUp(self):
        """Set up test environment"""
        # Configure app for testing
        self.app = _app
        self.app.config['TESTING'] = True
        self.app.config['SECRET_KEY'] = 'test_secret_key'
        
        # Use mongomock for testing
        self.db_patcher = mongomock.patch(servers=(('mongodb://localhost:27017', 27017),))
        self.db_patcher.start()
        
        # Create test client
        self.client = self.app.test_client()
        
        # Create test user
        self.test_user = User(
            email="test@example.com",
            username="testuser"
        )
        self.test_user.set_password("TestPassword123!")
        self.test_user.save()
        
        # Generate auth token
        self.auth_token = self.test_user.generate_auth_token()
        
        # Create test activity
        self.test_activity = Activity(
            user_id=self.test_user.id,
            activity_type="running",
            start_time=datetime.utcnow() - timedelta(hours=1),
            end_time=datetime.utcnow(),
            distance=5.0,
            duration=3600,
            calories=500
        )
        self.test_activity.save()
        
    def tearDown(self):
        """Tear down test environment"""
        # Delete test data
        User.objects.delete()
        Activity.objects.delete()
        
        # Stop mongomock patcher
        self.db_patcher.stop()
    
    def test_create_activity(self):
        """Test creating a new activity"""
        # Prepare request data
        data = {
            'activity_type': 'cycling',
            'distance': 15.0,
            'calories': 600
        }
        
        # Send request
        response = self.client.post(
            '/api/activities/',
            headers={
                'Authorization': f'Bearer {self.auth_token}',
                'Content-Type': 'application/json'
            },
            data=json.dumps(data)
        )
        
        # Check response
        self.assertEqual(response.status_code, 201)
        response_data = json.loads(response.data)
        self.assertEqual(response_data['message'], 'Activity created successfully')
        self.assertEqual(response_data['activity']['activity_type'], 'cycling')
        self.assertEqual(response_data['activity']['distance'], 15.0)
        self.assertEqual(response_data['activity']['calories'], 600)
        
    def test_get_activity(self):
        """Test getting activity details"""
        # Send request
        response = self.client.get(
            f'/api/activities/{self.test_activity.id}',
            headers={'Authorization': f'Bearer {self.auth_token}'}
        )
        
        # Check response
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertEqual(response_data['activity_type'], 'running')
        self.assertEqual(response_data['distance'], 5.0)
        self.assertEqual(response_data['calories'], 500)
        
    def test_update_activity(self):
        """Test updating activity details"""
        # Prepare update data
        data = {
            'distance': 6.0,
            'calories': 600
        }
        
        # Send request
        response = self.client.put(
            f'/api/activities/{self.test_activity.id}',
            headers={
                'Authorization': f'Bearer {self.auth_token}',
                'Content-Type': 'application/json'
            },
            data=json.dumps(data)
        )
        
        # Check response
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertEqual(response_data['message'], 'Activity updated successfully')
        self.assertEqual(response_data['activity']['distance'], 6.0)
        self.assertEqual(response_data['activity']['calories'], 600)
        
        # Verify database update
        updated_activity = Activity.objects(id=self.test_activity.id).first()
        self.assertEqual(updated_activity.distance, 6.0)
        self.assertEqual(updated_activity.calories, 600)
        
    def test_get_activities(self):
        """Test getting user activities"""
        # Create additional activities
        for i in range(3):
            activity = Activity(
                user_id=self.test_user.id,
                activity_type="walking",
                start_time=datetime.utcnow() - timedelta(days=i),
                distance=2.0 + i,
                duration=1800 + i*300,
                calories=200 + i*50
            )
            activity.save()
            
        # Send request
        response = self.client.get(
            '/api/activities/',
            headers={'Authorization': f'Bearer {self.auth_token}'}
        )
        
        # Check response
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertEqual(response_data['count'], 4)  # 3 new + 1 from setup
        
        # Test pagination
        response = self.client.get(
            '/api/activities/?limit=2&skip=1',
            headers={'Authorization': f'Bearer {self.auth_token}'}
        )
        response_data = json.loads(response.data)
        self.assertEqual(response_data['count'], 2)
        self.assertEqual(response_data['limit'], 2)
        self.assertEqual(response_data['skip'], 1)
        
    def test_activity_stats(self):
        """Test getting activity statistics"""
        # Create activities of different types
        activities = [
            {"type": "running", "distance": 5.0, "duration": 1800, "calories": 400},
            {"type": "running", "distance": 10.0, "duration": 3600, "calories": 800},
            {"type": "cycling", "distance": 20.0, "duration": 3600, "calories": 600},
            {"type": "walking", "distance": 3.0, "duration": 2700, "calories": 250}
        ]
        
        for activity_data in activities:
            activity = Activity(
                user_id=self.test_user.id,
                activity_type=activity_data["type"],
                start_time=datetime.utcnow() - timedelta(days=len(activities)),
                end_time=datetime.utcnow() - timedelta(days=len(activities)-1),
                distance=activity_data["distance"],
                duration=activity_data["duration"],
                calories=activity_data["calories"]
            )
            activity.save()
            
        # Send request
        response = self.client.get(
            '/api/activities/stats',
            headers={'Authorization': f'Bearer {self.auth_token}'}
        )
        
        # Check response
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        
        # The total includes the test activity from setup plus the 4 new ones
        self.assertEqual(response_data['total_activities'], 5)
        self.assertIn('activities_by_type', response_data)
        self.assertIn('running', response_data['activities_by_type'])
        self.assertEqual(response_data['activities_by_type']['running']['count'], 3)  # 2 new + 1 from setup
        
    def test_unauthorized_access(self):
        """Test unauthorized access to activities"""
        # Create another user
        other_user = User(
            email="other@example.com",
            username="otheruser"
        )
        other_user.set_password("OtherPassword123!")
        other_user.save()
        
        # Create activity for other user
        other_activity = Activity(
            user_id=other_user.id,
            activity_type="yoga",
            start_time=datetime.utcnow(),
            duration=1800
        )
        other_activity.save()
        
        # Try to access other user's activity
        response = self.client.get(
            f'/api/activities/{other_activity.id}',
            headers={'Authorization': f'Bearer {self.auth_token}'}
        )
        
        # Check response
        self.assertEqual(response.status_code, 403)
        response_data = json.loads(response.data)
        self.assertEqual(response_data['message'], 'Unauthorized access to activity')
        
        def test_delete_activity(self):
            """Test deleting an activity"""
            # Send delete request
            response = self.client.delete(
                f'/api/activities/{self.test_activity.id}',
                headers={'Authorization': f'Bearer {self.auth_token}'}
            )
        
            # Check response
            self.assertEqual(response.status_code, 204)
        
            # Verify activity is deleted from database
            deleted_activity = Activity.objects(id=self.test_activity.id).first()
            self.assertIsNone(deleted_activity)
        
        if __name__ == '__main__':
            unittest.main()