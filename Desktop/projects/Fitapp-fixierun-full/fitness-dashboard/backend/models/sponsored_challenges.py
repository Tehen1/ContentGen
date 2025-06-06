from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from database import Base
from datetime import datetime, timedelta

class SponsoredChallenge(Base):
    __tablename__ = "sponsored_challenges"

    id = Column(Integer, primary_key=True, index=True)
    sponsor_wallet = Column(String(42), ForeignKey("users.wallet_address"))
    reward_pool = Column(Float)
    participant_limit = Column(Integer)
    metadata_uri = Column(String(255))
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime)
    is_active = Column(Boolean, default=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.end_time and 'duration_days' in kwargs:
            self.end_time = self.start_time + timedelta(days=kwargs['duration_days'])

    def to_dict(self):
        return {
            "id": self.id,
            "sponsor_wallet": self.sponsor_wallet,
            "reward_pool": self.reward_pool,
            "participant_limit": self.participant_limit,
            "metadata_uri": self.metadata_uri,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat(),
            "is_active": self.is_active
        }

class ChallengeParticipant(Base):
    __tablename__ = "challenge_participants"

    id = Column(Integer, primary_key=True, index=True)
    challenge_id = Column(Integer, ForeignKey("sponsored_challenges.id"))
    user_wallet = Column(String(42), ForeignKey("users.wallet_address"))
    joined_at = Column(DateTime, default=datetime.utcnow)
    completed = Column(Boolean, default=False)