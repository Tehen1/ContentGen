import mongoengine as db
from datetime import datetime
import bcrypt
import jwt
import os
from typing import Dict, Optional, Union

class WalletInfo(db.EmbeddedDocument):
    """User's blockchain wallet information"""
    address = db.StringField(required=True)
    connected_at = db.DateTimeField(default=datetime.utcnow)
    chain_id = db.IntField(default=1)  # Ethereum mainnet by default
    
    def to_dict(self) -> Dict:
        return {
            'address': self.address,
            'connected_at': self.connected_at.isoformat(),
            'chain_id': self.chain_id
        }

class User(db.Document):
    """User model with authentication and profile information"""
    email = db.EmailField(required=True, unique=True)
    password_hash = db.StringField(required=True)
    username = db.StringField(required=True, unique=True)
    created_at = db.DateTimeField(default=datetime.utcnow)
    last_login = db.DateTimeField()
    profile_image = db.StringField()
    bio = db.StringField(max_length=500)
    is_active = db.BooleanField(default=True)
    wallet = db.EmbeddedDocumentField(WalletInfo)
    fitness_goals = db.ListField(db.StringField())
    total_distance = db.FloatField(default=0.0)  # in km
    total_activities = db.IntField(default=0)
    nfts_earned = db.IntField(default=0)
    
    meta = {
        'collection': 'users',
        'indexes': [
            'email', 
            'username',
            {'fields': ['wallet.address'], 'sparse': True}
        ]
    }
    
    def set_password(self, password: str) -> None:
        """Hash and set user password"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password: str) -> bool:
        """Verify password"""
        return bcrypt.checkpw(
            password.encode('utf-8'),
            self.password_hash.encode('utf-8')
        )
    
    def generate_auth_token(self) -> str:
        """Generate JWT token for authentication"""
        payload = {
            'user_id': str(self.id),
            'email': self.email,
            'username': self.username,
            'exp': datetime.utcnow().timestamp() + float(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))
        }
        return jwt.encode(
            payload,
            os.getenv('JWT_SECRET_KEY', 'default-jwt-secret'),
            algorithm='HS256'
        )
    
    def connect_wallet(self, address: str, chain_id: int = 1) -> None:
        """Connect a blockchain wallet to the user"""
        self.wallet = WalletInfo(
            address=address,
            chain_id=chain_id,
            connected_at=datetime.utcnow()
        )
        self.save()
    
    def to_dict(self, include_private: bool = False) -> Dict:
        """Convert user to dictionary representation"""
        user_dict = {
            'id': str(self.id),
            'username': self.username,
            'email': self.email if include_private else None,
            'created_at': self.created_at.isoformat(),
            'profile_image': self.profile_image,
            'bio': self.bio,
            'is_active': self.is_active,
            'fitness_goals': self.fitness_goals,
            'total_distance': self.total_distance,
            'total_activities': self.total_activities,
            'nfts_earned': self.nfts_earned,
        }
        
        if self.wallet:
            user_dict['wallet'] = self.wallet.to_dict()
            
        if not include_private:
            user_dict = {k: v for k, v in user_dict.items() if v is not None}
            
        return user_dict
    
    @classmethod
    def get_by_email(cls, email: str) -> Optional['User']:
        """Get user by email"""
        return cls.objects(email=email).first()
    
    @classmethod
    def get_by_wallet(cls, address: str) -> Optional['User']:
        """Get user by wallet address"""
        return cls.objects(wallet__address=address).first()