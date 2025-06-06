import json
from eth_account import Account
from eth_typing import Address
from web3 import Web3
from web3.middleware import geth_poa_middleware
import logging
from typing import Dict, List, Optional, Any, Union, Tuple

from app.core.config import settings

logger = logging.getLogger(__name__)

class ContractInterface:
    """Interface for interacting with smart contracts"""
    
    def __init__(self):
        """Initialize the contract interface"""
        # Connect to blockchain node
        self.w3 = Web3(Web3.HTTPProvider(settings.BLOCKCHAIN_NODE_URL))
        
        # Add middleware for POA chains like Polygon
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        
        # Check connection
        if not self.w3.is_connected():
            logger.error(f"Could not connect to blockchain node at {settings.BLOCKCHAIN_NODE_URL}")
            raise ConnectionError(f"Failed to connect to blockchain node")
            
        logger.info(f"Connected to blockchain node at {settings.BLOCKCHAIN_NODE_URL}")
        
        # Load contract ABIs
        try:
            with open(settings.FIT_TOKEN_ABI_PATH, 'r') as f:
                self.fit_token_abi = json.load(f)
                
            with open(settings.FIT_ACHIEVEMENT_ABI_PATH, 'r') as f:
                self.fit_achievement_abi = json.load(f)
                
            with open(settings.ACTIVITY_VERIFIER_ABI_PATH, 'r') as f:
                self.activity_verifier_abi = json.load(f)
        except Exception as e:
            logger.error(f"Error loading contract ABIs: {str(e)}")
            raise
            
        # Initialize contract instances
        self.fit_token = self.w3.eth.contract(
            address=settings.FIT_TOKEN_ADDRESS,
            abi=self.fit_token_abi
        )
        
        self.fit_achievement = self.w3.eth.contract(
            address=settings.FIT_ACHIEVEMENT_ADDRESS,
            abi=self.fit_achievement_abi
        )
        
        self.activity_verifier = self.w3.eth.contract(
            address=settings.ACTIVITY_VERIFIER_ADDRESS,
            abi=self.activity_verifier_abi
        )
        
        # Load account for transaction signing
        self.account = Account.from_key(settings.BLOCKCHAIN_PRIVATE_KEY)
        logger.info(f"Using account: {self.account.address}")
    
    async def verify_activity(
        self, 
        user_address: str,
        activity_type: int,
        distance: int,
        duration: int,
        timestamp: int,
        signature: str
    ) -> str:
        """
        Submit activity verification to the blockchain
        
        Args:
            user_address: User's wallet address
            activity_type: Type of activity (0=run, 1=cycle, etc.)
            distance: Distance in meters
            duration: Duration in seconds
            timestamp: Unix timestamp of activity
            signature: Signature from verification service
            
        Returns:
            Transaction hash
        """
        try:
            # Build transaction
            tx = self.activity_verifier.functions.verifyActivity(
                activity_type,
                distance,
                duration,
                timestamp,
                signature
            ).build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': 500000,  # Gas limit
                'gasPrice': self.w3.eth.gas_price,
                'chainId': self.w3.eth.chain_id,
            })
            
            # Sign transaction
            signed_tx = self.account.sign_transaction(tx)
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            # Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            if receipt.status == 1:
                logger.info(f"Activity verification successful: {tx_hash.hex()}")
                return tx_hash.hex()
            else:
                logger.error(f"Activity verification failed: {tx_hash.hex()}")
                raise Exception("Transaction failed")
                
        except Exception as e:
            logger.error(f"Error verifying activity: {str(e)}")
            raise
            
    async def get_activity_reward(self, tx_hash: str) -> int:
        """
        Get reward amount from activity verification transaction
        
        Args:
            tx_hash: Transaction hash of activity verification
            
        Returns:
            Reward amount in tokens (wei)
        """
        try:
            # Get transaction receipt
            receipt = self.w3.eth.get_transaction_receipt(tx_hash)
            
            # Parse logs to find ActivityVerified event
            event_abi = next((x for x in self.activity_verifier_abi if x.get('name') == 'ActivityVerified'), None)
            if not event_abi:
                raise Exception("ActivityVerified event not found in ABI")
                
            # Create event signature
            event_signature = self.w3.keccak(text=f"ActivityVerified(uint256,address,uint8,uint256,uint256,uint256,uint256)").hex()
            
            # Find event in logs
            for log in receipt.logs:
                if log.topics[0].hex() == event_signature:
                    # Decode log
                    decoded_log = self.activity_verifier.events.ActivityVerified().process_log(log)
                    return decoded_log.args.rewardAmount
                    
            raise Exception("ActivityVerified event not found in transaction logs")
            
        except Exception as e:
            logger.error(f"Error getting activity reward: {str(e)}")
            raise
            
    async def get_user_achievements(self, user_address: str) -> List[Dict[str, Any]]:
        """
        Get list of achievements for a user
        
        Args:
            user_address: User's wallet address
            
        Returns:
            List of achievement data
        """
        try:
            # Get filter for AchievementMinted events
            achievement_filter = self.fit_achievement.events.AchievementMinted.create_filter(
                fromBlock=0,
                argument_filters={"to": user_address}
            )
            
            # Get all events
            events = achievement_filter.get_all_entries()
            
            achievements = []
            for event in events:
                token_id = event.args.tokenId
                
                # Get token URI
                token_uri = self.fit_achievement.functions.tokenURI(token_id).call()
                
                # Get achievement metadata
                metadata = self.fit_achievement.functions.getAchievementMetadata(token_id).call()
                
                achievements.append({
                    "token_id": token_id,
                    "name": event.args.name,
                    "category": metadata[2],  # Category enum value
                    "level": metadata[3],
                    "timestamp": metadata[4],
                    "token_uri": token_uri
                })
                
            return achievements
            
        except Exception as e:
            logger.error(f"Error getting user achievements: {str(e)}")
            raise
            
    async def get_token_balance(self, user_address: str) -> int:
        """
        Get FIT token balance for a user
        
        Args:
            user_address: User's wallet address
            
        Returns:
            Token balance in smallest unit (wei)
        """
        try:
            balance = self.fit_token.functions.balanceOf(user_address).call()
            return balance
        except Exception as e:
            logger.error(f"Error getting token balance: {str(e)}")
            raise