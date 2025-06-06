"""
Core reward calculation logic for Fixie.Run.
"""

from typing import Dict, Union, Optional, List
from dataclasses import dataclass

from fixie_run.config import settings

@dataclass
class ActivityData:
    """Data class to hold cycling activity metrics."""
    distance_km: float
    duration_hours: float
    elevation_m: Optional[float] = None
    num_activities: Optional[int] = None
    avg_speed: Optional[float] = None

@dataclass
class RewardBreakdown:
    """Data class to hold reward breakdown."""
    base: float
    distance: float
    time: float
    weekly_bonus: float
    total: float

def calculate_rewards(
    activity_data: ActivityData,
    base_reward: Optional[float] = None,
    distance_rate: Optional[float] = None,
    time_rate: Optional[float] = None,
    challenge_threshold: Optional[float] = None,
    challenge_bonus: Optional[float] = None
) -> RewardBreakdown:
    """
    Calculate token rewards based on cycling activity data.
    
    Args:
        activity_data: ActivityData object containing cycling metrics
        base_reward: Base reward amount (defaults to settings value)
        distance_rate: Token rate per km (defaults to settings value)
        time_rate: Token rate per hour (defaults to settings value)
        challenge_threshold: Weekly challenge threshold in km (defaults to settings value)
        challenge_bonus: Weekly challenge bonus amount (defaults to settings value)
        
    Returns:
        RewardBreakdown object with all calculated rewards
    """
    # Use provided values or defaults from settings
    base = base_reward if base_reward is not None else settings.REWARD_BASE
    dist_rate = distance_rate if distance_rate is not None else settings.REWARD_DISTANCE_RATE
    t_rate = time_rate if time_rate is not None else settings.REWARD_TIME_RATE
    w_threshold = challenge_threshold if challenge_threshold is not None else settings.WEEKLY_CHALLENGE_THRESHOLD
    w_bonus = challenge_bonus if challenge_bonus is not None else settings.WEEKLY_CHALLENGE_BONUS
    
    # Calculate individual reward components
    distance_reward = activity_data.distance_km * dist_rate
    time_reward = activity_data.duration_hours * t_rate
    
    # Weekly challenge bonus
    weekly_challenge_bonus = w_bonus if activity_data.distance_km > w_threshold else 0
    
    # Calculate total reward
    total_reward = base + distance_reward + time_reward + weekly_challenge_bonus
    
    # Return reward breakdown
    return RewardBreakdown(
        base=round(base, 2),
        distance=round(distance_reward, 2),
        time=round(time_reward, 2),
        weekly_bonus=weekly_challenge_bonus,
        total=round(total_reward, 2)
    )

def rewards_to_dict(rewards: RewardBreakdown) -> Dict[str, float]:
    """Convert RewardBreakdown to dictionary for serialization."""
    return {
        "base": rewards.base,
        "distance": rewards.distance,
        "time": rewards.time,
        "weekly_bonus": rewards.weekly_bonus,
        "total": rewards.total
    }

def calculate_reward_tier(total_distance: float) -> str:
    """Calculate the user's reward tier based on total distance."""
    if total_distance > 1000:
        return "Diamond"
    elif total_distance > 500:
        return "Platinum"
    elif total_distance > 250:
        return "Gold"
    elif total_distance > 100:
        return "Silver"
    else:
        return "Bronze"