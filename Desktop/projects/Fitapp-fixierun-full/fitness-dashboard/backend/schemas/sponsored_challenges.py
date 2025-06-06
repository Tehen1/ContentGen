from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class ChallengeBase(BaseModel):
    reward_pool: float
    participant_limit: int
    metadata_uri: str
    duration_days: int

class ChallengeCreate(ChallengeBase):
    pass

class ChallengeDetails(ChallengeBase):
    id: int
    sponsor_wallet: str
    start_time: datetime
    end_time: datetime
    is_active: bool
    participant_count: int
    
    class Config:
        orm_mode = True

class ChallengeList(BaseModel):
    challenges: list[ChallengeDetails]
    total: int

class ChallengeUpdate(BaseModel):
    reward_pool: Optional[float] = None
    participant_limit: Optional[int] = None
    duration_days: Optional[int] = None