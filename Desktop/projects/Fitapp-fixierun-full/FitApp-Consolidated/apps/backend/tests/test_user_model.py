import unittest
import mongomock
import os
import sys
import pytest
from datetime import datetime
from bson import ObjectId

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Use pytest-dotenv to load environment variables from .env.test
from dotenv import load_dotenv
load_dotenv('.env.test')

from models.user import User, WalletInfo

class TestUserModel(unittest.TestCase):
    """Test cases for User model"""
    
    def setUp(self):
        """Set up test environment"""
        # Use mongomock for testing to avoid actual database connections
        self.db_patcher = mongomock.patch(servers=(('mongodb://localhost:27017', 27017),))
        self.db_patcher.start()
        
        # Create test user
        self.test_user = User(
            email="test@example.com",
            username="testuser",
            bio="Test bio",
            fitness_goals=["running", "cycling"]
        )
        self.test_user.set_password("TestPassword123!")
        self.test_user.save()
        
    def tearDown(self):
        """Tear down test environment"""
        # Delete test data
        User.objects.delete()
        
        # Stop mongomock patcher
        self.db_patcher.stop()
    
    def test_user_creation(self):
        """Test user creation"""
        # Verify the user was created
        user = User.objects(email="test@example.com").first()
        self.assertIsNotNone(user)
        self.assertEqual(user.username, "testuser")
        self.assertEqual(user.bio, "Test bio")
        self.assertEqual(user.fitness_goals, ["running", "cycling"])
        self.assertTrue(user.is_active)
        
    def test_password_hashing(self):
        """Test password hashing and verification"""
        user = User.objects(email="test@example.com").first()
        
        # Test correct password
        self.assertTrue(user.check_password("TestPassword123!"))
        
        # Test incorrect password
        self.assertFalse(user.check_password("WrongPassword"))
        
    def test_auth_token_generation(self):
        """Test auth token generation"""
        user = User.objects(email="test@example.com").first()
        token = user.generate_auth_token()
        
        # Verify token is not empty
        self.assertIsNotNone(token)
        self.assertTrue(len(token) > 0)
        
    def test_wallet_connection(self):
        """Test wallet connection"""
        user = User.objects(email="test@example.com").first()
        
        # Connect wallet
        test_address = "0x1234567890123456789012345678901234567890"
        user.connect_wallet(test_address, chain_id=1)
        
        # Verify wallet is connected
        self.assertIsNotNone(user.wallet)
        self.assertEqual(user.wallet.address, test_address)
        self.assertEqual(user.wallet.chain_id, 1)
        
        # Test getting user by wallet
        wallet_user = User.get_by_wallet(test_address)
        self.assertIsNotNone(wallet_user)
        self.assertEqual(wallet_user.email, "test@example.com")
        
    def test_to_dict_method(self):
        """Test to_dict method"""
        user = User.objects(email="test@example.com").first()
        
        # Test with private fields
        user_dict = user.to_dict(include_private=True)
        self.assertEqual(user_dict['email'], "test@example.com")
        self.assertEqual(user_dict['username'], "testuser")
        
        # Test without private fields
        user_dict = user.to_dict(include_private=False)
        self.assertNotIn('email', user_dict)
        self.assertEqual(user_dict['username'], "testuser")
        
    def test_get_by_email(self):
        """Test get_by_email method"""
        user = User.get_by_email("test@example.com")
        self.assertIsNotNone(user)
        self.assertEqual(user.username, "testuser")
        
        # Test with non-existent email
        user = User.get_by_email("nonexistent@example.com")
        self.assertIsNone(user)
        
    def test_user_stats_update(self):
        """Test updating user statistics"""
        user = User.objects(email="test@example.com").first()
        
        # Update stats
        user.total_distance = 10.5
        user.total_activities = 3
        user.nfts_earned = 1
        user.save()
        
        # Verify stats were updated
        updated_user = User.get_by_email("test@example.com")
        self.assertEqual(updated_user.total_distance, 10.5)
        self.assertEqual(updated_user.total_activities, 3)
        self.assertEqual(updated_user.nfts_earned, 1)

if __name__ == '__main__':
    unittest.main()