import os
from typing import Dict, Optional, Any
from web3.contracts import contract_manager
from models.activity import Activity
from models.user import User

class NFTFactory:
    """Factory for creating fitness achievement NFTs"""
    
    @staticmethod
    def mint_activity_nft(activity_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Mint an NFT for a completed activity
        
        Args:
            activity_id: ID of the completed activity
            user_id: ID of the user who completed the activity
            
        Returns:
            Dictionary with transaction details if successful, None otherwise
        """
        # Get activity from database
        activity = Activity.objects(id=activity_id).first()
        if not activity:
            raise ValueError(f"Activity {activity_id} not found")
            
        # Check if activity is completed
        if not activity.is_completed:
            raise ValueError("Cannot mint NFT for incomplete activity")
            
        # Check if NFT is already minted
        if activity.nft_minted:
            raise ValueError("NFT already minted for this activity")
            
        # Get user
        user = User.objects(id=user_id).first()
        if not user:
            raise ValueError(f"User {user_id} not found")
            
        # Check if user has a connected wallet
        if not user.wallet or not user.wallet.address:
            raise ValueError("User does not have a connected wallet")
            
        # Create NFT metadata
        metadata = NFTFactory._create_nft_metadata(activity, user)
        
        # Mint NFT
        tx_hash = contract_manager.mint_activity_nft(
            user.wallet.address,
            activity.to_dict()
        )
        
        if not tx_hash:
            return None
            
        # Update activity with NFT information
        activity.nft_minted = True
        activity.nft_token_id = tx_hash  # This is simplified, in reality you'd get the token ID from the event
        activity.save()
        
        # Update user's NFT count
        user.nfts_earned += 1
        user.save()
        
        # Return transaction details
        return {
            'activity_id': str(activity.id),
            'user_id': str(user.id),
            'transaction_hash': tx_hash,
            'blockchain': os.getenv('NETWORK_NAME', 'ethereum'),
            'status': 'pending'  # In a real app, you'd check the transaction status
        }
    
    @staticmethod
    def _create_nft_metadata(activity: Activity, user: User) -> Dict[str, Any]:
        """
        Create metadata for the activity NFT
        
        Args:
            activity: Activity to create metadata for
            user: User who completed the activity
            
        Returns:
            NFT metadata dictionary
        """
        # Create basic NFT attributes
        attributes = [
            {"trait_type": "Activity Type", "value": activity.activity_type},
            {"trait_type": "Distance", "value": activity.distance, "unit": "km"},
            {"trait_type": "Duration", "value": activity.duration, "unit": "seconds"},
        ]
        
        # Add additional attributes if available
        if activity.calories:
            attributes.append({"trait_type": "Calories", "value": activity.calories, "unit": "kcal"})
            
        if activity.elevation_gain:
            attributes.append({"trait_type": "Elevation Gain", "value": activity.elevation_gain, "unit": "m"})
            
        if activity.average_heart_rate:
            attributes.append({"trait_type": "Avg Heart Rate", "value": activity.average_heart_rate, "unit": "bpm"})
        
        # Create full metadata object
        metadata = {
            "name": f"{user.username}'s {activity.activity_type.title()} Achievement",
            "description": f"This NFT represents a {activity.distance} km {activity.activity_type} activity completed on {activity.start_time.strftime('%Y-%m-%d')}.",
            "image": f"https://api.fitapp.example/activity-image/{activity.id}",  # Placeholder
            "external_url": f"https://fitapp.example/activities/{activity.id}",
            "attributes": attributes
        }
        
        return metadata
    
    @staticmethod
    def check_eligibility(activity: Activity) -> bool:
        """
        Check if an activity is eligible for NFT minting
        
        Args:
            activity: Activity to check
            
        Returns:
            True if eligible, False otherwise
        """
        # Basic eligibility criteria
        if not activity.is_completed:
            return False
            
        if activity.nft_minted:
            return False
            
        # Add custom eligibility rules
        # For example, only activities over a certain distance
        if activity.activity_type == 'running' and (not activity.distance or activity.distance < 5.0):
            return False
            
        if activity.activity_type == 'cycling' and (not activity.distance or activity.distance < 20.0):
            return False
            
        return True