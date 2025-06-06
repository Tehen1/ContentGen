from datetime import datetime
from typing import Dict, List, Optional, Union
import hashlib
import json
from eth_account import Account
from eth_account.messages import encode_defunct
from fastapi import HTTPException, status
from pydantic import BaseModel, Field

from app.models.activity import Activity, ActivityCreate, ActivityType
from app.db.repositories.activity_repository import ActivityRepository
from app.core.config import settings
from app.blockchain.contract_interface import ContractInterface


class ActivityService:
    """
    Service for handling fitness activities, verification, and blockchain interaction.
    """
    
    def __init__(
        self,
        activity_repository: ActivityRepository,
        contract_interface: ContractInterface
    ):
        self.activity_repository = activity_repository
        self.contract_interface = contract_interface
        self.verification_private_key = settings.ACTIVITY_VERIFICATION_PRIVATE_KEY
        
    async def create_activity(self, activity_data: ActivityCreate, user_id: str) -> Activity:
        """
        Create a new activity record and verify it
        
        Args:
            activity_data: The activity data submitted by the user
            user_id: The ID of the user creating the activity
            
        Returns:
            The created activity record
        """
        # First validate the activity data
        validation_result = await self._validate_activity_data(activity_data)
        if not validation_result["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid activity data: {validation_result['reason']}"
            )
        
        # Create activity in database
        activity = await self.activity_repository.create_activity(
            activity_data=activity_data,
            user_id=user_id
        )
        
        # If verification passes, sign the activity and submit to blockchain
        if validation_result["valid"]:
            try:
                # Generate signature for blockchain verification
                signature = self._generate_activity_signature(
                    user_address=activity.user_wallet_address,
                    activity_type=activity.activity_type.value,
                    distance=activity.distance,
                    duration=activity.duration,
                    timestamp=int(activity.start_time.timestamp())
                )
                
                # Submit to blockchain
                tx_hash = await self.contract_interface.verify_activity(
                    user_address=activity.user_wallet_address,
                    activity_type=activity.activity_type.value,
                    distance=activity.distance,
                    duration=activity.duration,
                    timestamp=int(activity.start_time.timestamp()),
                    signature=signature
                )
                
                # Update activity with blockchain transaction hash
                activity = await self.activity_repository.update_activity(
                    activity_id=activity.id,
                    update_data={"blockchain_tx_hash": tx_hash, "verified": True}
                )
                
            except Exception as e:
                # Log the error but don't fail the request
                # The activity is still recorded and can be verified later
                print(f"Error submitting activity to blockchain: {str(e)}")
                
        return activity
    
    async def get_user_activities(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 100,
        activity_type: Optional[ActivityType] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Activity]:
        """
        Get activities for a user with filtering options
        
        Args:
            user_id: User ID to get activities for
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return
            activity_type: Filter by activity type
            start_date: Filter by start date
            end_date: Filter by end date
            
        Returns:
            List of activities matching the criteria
        """
        return await self.activity_repository.get_user_activities(
            user_id=user_id,
            skip=skip,
            limit=limit,
            activity_type=activity_type,
            start_date=start_date,
            end_date=end_date
        )
    
    async def get_activity_stats(self, user_id: str) -> Dict[str, Union[int, float]]:
        """
        Get aggregated statistics for user activities
        
        Args:
            user_id: User ID to get statistics for
            
        Returns:
            Dictionary with activity statistics
        """
        activities = await self.activity_repository.get_user_activities(user_id=user_id)
        
        stats = {
            "total_activities": len(activities),
            "total_distance": sum(a.distance for a in activities),
            "total_duration": sum(a.duration for a in activities),
            "total_calories": sum(a.calories for a in activities if a.calories),
            "activity_counts": {}
        }
        
        # Count by activity type
        for activity_type in ActivityType:
            count = len([a for a in activities if a.activity_type == activity_type])
            if count > 0:
                stats["activity_counts"][activity_type.value] = count
        
        return stats
    
    async def _validate_activity_data(self, activity_data: ActivityCreate) -> Dict[str, Union[bool, str]]:
        """
        Validate activity data for consistency and potential fraud
        
        Args:
            activity_data: Activity data to validate
            
        Returns:
            Dictionary with validation result
        """
        # Basic validation
        if activity_data.end_time <= activity_data.start_time:
            return {
                "valid": False,
                "reason": "End time must be after start time"
            }
        
        # Calculate expected duration
        expected_duration = (activity_data.end_time - activity_data.start_time).total_seconds()
        if abs(expected_duration - activity_data.duration) > 60:  # Allow 60 seconds discrepancy
            return {
                "valid": False,
                "reason": "Duration doesn't match start and end times"
            }
        
        # Validate speed (distance/time) based on activity type
        if activity_data.duration > 0:
            speed_mps = activity_data.distance / activity_data.duration  # meters per second
            
            # Check for unrealistic speeds
            if activity_data.activity_type == ActivityType.RUN:
                # World record is about 10 m/s, we'll use 12 as an upper bound
                if speed_mps > 12:
                    return {
                        "valid": False,
                        "reason": "Running speed exceeds realistic limits"
                    }
            elif activity_data.activity_type == ActivityType.CYCLE:
                # Pro cyclists can reach about 20 m/s, we'll use 25 as an upper bound
                if speed_mps > 25:
                    return {
                        "valid": False,
                        "reason": "Cycling speed exceeds realistic limits"
                    }
            elif activity_data.activity_type == ActivityType.WALK:
                # Fast walking is about 2.5 m/s, we'll use 3 as an upper bound
                if speed_mps > 3:
                    return {
                        "valid": False,
                        "reason": "Walking speed exceeds realistic limits"
                    }
        
        # If GPS data is provided, validate it
        if activity_data.gps_data and len(activity_data.gps_data) > 0:
            # Check GPS data consistency
            # This would involve more complex validation of the GPS track
            # For example, checking that points form a realistic path
            # and total distance matches the reported distance
            pass
        
        # All checks passed
        return {"valid": True}
    
    def _generate_activity_signature(
        self,
        user_address: str,
        activity_type: int,
        distance: int,
        duration: int,
        timestamp: int
    ) -> str:
        """
        Generate a signature for activity verification on the blockchain
        
        Args:
            user_address: Ethereum address of the user
            activity_type: Type of activity as integer
            distance: Distance in meters
            duration: Duration in seconds
            timestamp: Unix timestamp of the activity
            
        Returns:
            Ethereum signature as a hex string
        """
        # Create message hash as expected by the smart contract
        message = f"{user_address}{activity_type}{distance}{duration}{timestamp}"
        message_hash = encode_defunct(text=message)
        
        # Sign the message
        account = Account.from_key(self.verification_private_key)
        signed_message = account.sign_message(message_hash)
        
        return signed_message.signature.hex()
    
    async def process_activity_rewards(self, activity_id: str) -> Dict[str, Union[str, int]]:
        """
        Process rewards for a verified activity
        
        Args:
            activity_id: ID of the activity to process rewards for
            
        Returns:
            Dictionary with reward details
        """
        activity = await self.activity_repository.get_activity_by_id(activity_id)
        if not activity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Activity with ID {activity_id} not found"
            )
        
        if not activity.verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Activity with ID {activity_id} is not verified yet"
            )
        
        # Check if rewards were already processed
        if activity.rewards_processed:
            return {
                "activity_id": activity.id,
                "reward_status": "already_processed",
                "reward_amount": activity.reward_amount
            }
        
        # Get reward amount from blockchain transaction
        reward_amount = await self.contract_interface.get_activity_reward(activity.blockchain_tx_hash)
        
        # Update activity with reward information
        activity = await self.activity_repository.update_activity(
            activity_id=activity.id,
            update_data={
                "rewards_processed": True,
                "reward_amount": reward_amount
            }
        )
        
        return {
            "activity_id": activity.id,
            "reward_status": "processed",
            "reward_amount": reward_amount
        }