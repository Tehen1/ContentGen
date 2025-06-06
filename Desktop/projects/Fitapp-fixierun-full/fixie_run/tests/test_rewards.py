"""
Unit tests for the reward calculation functionality.
"""

import unittest
from dataclasses import asdict
import pytest

from fixie_run.core.rewards import (
    ActivityData,
    RewardBreakdown,
    calculate_rewards,
    rewards_to_dict,
    calculate_reward_tier
)

class TestRewardCalculations(unittest.TestCase):
    """Test cases for reward calculation functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.activity_data = ActivityData(
            distance_km=25.0,
            duration_hours=2.0,
            elevation_m=150.0,
            num_activities=1,
            avg_speed=12.5
        )
        
        # Custom reward parameters for testing
        self.base_reward = 10.0
        self.distance_rate = 0.5
        self.time_rate = 2.0
        self.challenge_threshold = 20.0
        self.challenge_bonus = 15.0
    
    def test_basic_reward_calculation(self):
        """Test basic reward calculation with no bonuses."""
        # Create activity data below the threshold
        small_activity = ActivityData(
            distance_km=10.0,
            duration_hours=1.0
        )
        
        rewards = calculate_rewards(
            small_activity,
            base_reward=self.base_reward,
            distance_rate=self.distance_rate,
            time_rate=self.time_rate,
            challenge_threshold=self.challenge_threshold,
            challenge_bonus=self.challenge_bonus
        )
        
        # Base reward + distance reward + time reward
        # 10 + (10*0.5) + (1*2) = 10 + 5 + 2 = 17
        expected_total = 17.0
        
        self.assertEqual(rewards.base, self.base_reward)
        self.assertEqual(rewards.distance, 5.0)
        self.assertEqual(rewards.time, 2.0)
        self.assertEqual(rewards.weekly_bonus, 0.0)  # No bonus below threshold
        self.assertEqual(rewards.total, expected_total)
    
    def test_challenge_bonus_applied(self):
        """Test that weekly challenge bonus applies when over threshold."""
        rewards = calculate_rewards(
            self.activity_data,
            base_reward=self.base_reward,
            distance_rate=self.distance_rate,
            time_rate=self.time_rate,
            challenge_threshold=self.challenge_threshold,
            challenge_bonus=self.challenge_bonus
        )
        
        # Total should include bonus
        # 10 + (25*0.5) + (2*2) + 15 = 10 + 12.5 + 4 + 15 = 41.5
        expected_total = 41.5
        
        self.assertEqual(rewards.weekly_bonus, self.challenge_bonus)
        self.assertEqual(rewards.total, expected_total)
    
    def test_rewards_to_dict(self):
        """Test conversion of RewardBreakdown to dictionary."""
        reward_breakdown = RewardBreakdown(
            base=10.0,
            distance=5.0,
            time=2.0,
            weekly_bonus=0.0,
            total=17.0
        )
        
        reward_dict = rewards_to_dict(reward_breakdown)
        
        self.assertIsInstance(reward_dict, dict)
        self.assertEqual(reward_dict['base'], 10.0)
        self.assertEqual(reward_dict['distance'], 5.0)
        self.assertEqual(reward_dict['time'], 2.0)
        self.assertEqual(reward_dict['weekly_bonus'], 0.0)
        self.assertEqual(reward_dict['total'], 17.0)
    
    def test_calculate_reward_tier(self):
        """Test reward tier calculation based on distance."""
        self.assertEqual(calculate_reward_tier(50), "Bronze")
        self.assertEqual(calculate_reward_tier(150), "Silver")
        self.assertEqual(calculate_reward_tier(300), "Gold")
        self.assertEqual(calculate_reward_tier(600), "Platinum")
        self.assertEqual(calculate_reward_tier(1200), "Diamond")

# PyTest style tests
def test_activity_data_defaults():
    """Test that ActivityData class has proper defaults."""
    # Only required fields
    activity = ActivityData(distance_km=10.0, duration_hours=1.0)
    
    assert activity.distance_km == 10.0
    assert activity.duration_hours == 1.0
    assert activity.elevation_m is None
    assert activity.num_activities is None
    assert activity.avg_speed is None

def test_reward_calculation_with_default_params():
    """Test reward calculation using default parameters."""
    activity = ActivityData(distance_km=30.0, duration_hours=3.0)
    
    # Using default parameters from config
    rewards = calculate_rewards(activity)
    
    # We can't test exact values since they depend on settings
    # But we can check the structure and relations
    assert rewards.base > 0
    assert rewards.distance == pytest.approx(activity.distance_km * 0.5, 0.01)
    assert rewards.time == pytest.approx(activity.duration_hours * 2.0, 0.01)
    assert rewards.weekly_bonus > 0  # Should get bonus for 30km
    assert rewards.total == pytest.approx(
        rewards.base + rewards.distance + rewards.time + rewards.weekly_bonus, 0.01
    )