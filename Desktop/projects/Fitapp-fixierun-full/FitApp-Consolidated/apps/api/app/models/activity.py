from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field, validator
from uuid import UUID, uuid4

class ActivityType(str, Enum):
    """Types of physical activities"""
    RUN = "run"
    WALK = "walk"
    CYCLE = "cycle"
    SWIM = "swim"
    WORKOUT = "workout"
    OTHER = "other"

class ActivityPoint(BaseModel):
    """GPS point in an activity track"""
    timestamp: datetime
    latitude: float
    longitude: float
    altitude: Optional[float] = None
    heart_rate: Optional[int] = None
    cadence: Optional[int] = None
    speed: Optional[float] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "timestamp": "2023-11-01T07:30:45Z",
                "latitude": 48.8566,
                "longitude": 2.3522,
                "altitude": 35.5,
                "heart_rate": 142,
                "cadence": 85,
                "speed": 3.2
            }
        }

class ActivityCreate(BaseModel):
    """Schema for creating a new activity"""
    activity_type: ActivityType
    start_time: datetime
    end_time: datetime
    distance: int = Field(..., description="Distance in meters")
    duration: int = Field(..., description="Duration in seconds")
    calories: Optional[int] = None
    average_heart_rate: Optional[int] = None
    max_heart_rate: Optional[int] = None
    gps_data: Optional[List[ActivityPoint]] = None
    metadata: Optional[Dict[str, Any]] = None
    
    @validator('end_time')
    def end_time_after_start_time(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v
    
    @validator('distance')
    def distance_positive(cls, v):
        if v < 0:
            raise ValueError('distance must be positive')
        return v
    
    @validator('duration')
    def duration_positive(cls, v):
        if v < 0:
            raise ValueError('duration must be positive')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "activity_type": "run",
                "start_time": "2023-11-01T07:30:00Z",
                "end_time": "2023-11-01T08:15:00Z",
                "distance": 5000,
                "duration": 2700,
                "calories": 320,
                "average_heart_rate": 145,
                "max_heart_rate": 165,
                "metadata": {
                    "device": "Garmin Forerunner 945",
                    "weather": "Sunny, 18°C"
                }
            }
        }

class Activity(BaseModel):
    """Complete activity model with system fields"""
    id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    user_wallet_address: Optional[str] = None
    activity_type: ActivityType
    start_time: datetime
    end_time: datetime
    distance: int
    duration: int
    calories: Optional[int] = None
    average_heart_rate: Optional[int] = None
    max_heart_rate: Optional[int] = None
    gps_data: Optional[List[ActivityPoint]] = None
    metadata: Optional[Dict[str, Any]] = None
    verified: bool = False
    blockchain_tx_hash: Optional[str] = None
    rewards_processed: bool = False
    reward_amount: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        orm_mode = True

class ActivitySummary(BaseModel):
    """Summary data for an activity"""
    id: UUID
    user_id: UUID
    activity_type: ActivityType
    start_time: datetime
    distance: int
    duration: int
    calories: Optional[int] = None
    verified: bool
    reward_amount: Optional[int] = None
    
    class Config:
        orm_mode = True

class UserActivityStats(BaseModel):
    """Aggregated statistics for user activities"""
    total_activities: int
    total_distance: int
    total_duration: int
    total_calories: Optional[int] = None
    activities_by_type: Dict[ActivityType, int]
    rewards_earned: Optional[int] = None
    
    class Config:
        orm_mode = True