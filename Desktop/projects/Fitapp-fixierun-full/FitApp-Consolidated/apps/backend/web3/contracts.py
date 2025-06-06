import json
import os
from web3 import Web3
from web3.middleware import geth_poa_middleware
from typing import Dict, Tuple, Any, Optional

class ContractManager:
    """Manager for blockchain contract interactions"""
    
    def __init__(self):
        self.provider_uri = os.getenv('WEB3_PROVIDER_URI')
        self.private_key = os.getenv('WALLET_PRIVATE_KEY')
        self.nft_contract_address = os.getenv('NFT_CONTRACT_ADDRESS')
        self.web3 = None
        self.nft_contract = None
        self._connect()
        
    def _connect(self) -> None:
        """Connect to blockchain and initialize contracts"""
        if not self.provider_uri:
            raise ValueError("WEB3_PROVIDER_URI environment variable not set")
            
        # Initialize web3 connection
        self.web3 = Web3(Web3.HTTPProvider(self.provider_uri))
        
        # Add middleware for POA chains like Polygon
        self.web3.middleware_onion.inject(geth_poa_middleware, layer=0)
        
        # Check connection
        if not self.web3.is_connected():
            raise ConnectionError("Failed to connect to Ethereum node")
            
        # Load contract ABI
        self._load_nft_contract()
        
    def _load_nft_contract(self) -> None:
        """Load NFT contract from ABI file"""
        try:
            # Load ABI from file
            contract_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)), 
                'contracts', 
                'FitnessNFT.json'
            )
            
            with open(contract_path, 'r') as f:
                contract_data = json.load(f)
                
            # Initialize contract
            self.nft_contract = self.web3.eth.contract(
                address=self.nft_contract_address,
                abi=contract_data['abi']
            )
            
        except (FileNotFoundError, json.JSONDecodeError) as e:
            raise ValueError(f"Failed to load NFT contract ABI: {str(e)}")
            
    def mint_activity_nft(self, 
                         user_address: str, 
                         activity_data: Dict[str, Any]) -> Optional[str]:
        """
        Mint an NFT for a completed activity
        
        Args:
            user_address: Ethereum address of the user
            activity_data: Activity data to be stored on-chain
            
        Returns:
            Transaction hash if successful, None otherwise
        """
        if not self.nft_contract:
            raise ValueError("NFT contract not initialized")
            
        if not self.private_key:
            raise ValueError("WALLET_PRIVATE_KEY environment variable not set")
            
        try:
            # Create account from private key
            account = self.web3.eth.account.from_key(self.private_key)
            
            # Prepare activity data for on-chain storage
            activity_hash = self._compute_activity_hash(activity_data)
            activity_uri = self._generate_activity_metadata_uri(activity_data)
            
            # Get nonce for the transaction
            nonce = self.web3.eth.get_transaction_count(account.address)
            
            # Build mint transaction
            mint_tx = self.nft_contract.functions.mintActivityNFT(
                user_address,
                activity_hash,
                activity_uri
            ).build_transaction({
                'chainId': int(os.getenv('CHAIN_ID', 1)),
                'gas': 200000,
                'gasPrice': self.web3.eth.gas_price,
                'nonce': nonce,
            })
            
            # Sign transaction
            signed_tx = self.web3.eth.account.sign_transaction(
                mint_tx, 
                private_key=self.private_key
            )
            
            # Send transaction
            tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            # Return transaction hash
            return self.web3.to_hex(tx_hash)
            
        except Exception as e:
            print(f"Error minting NFT: {str(e)}")
            return None
            
    def _compute_activity_hash(self, activity_data: Dict[str, Any]) -> str:
        """
        Compute a unique hash for the activity data
        
        Args:
            activity_data: Activity data to hash
            
        Returns:
            Keccak256 hash of the activity data
        """
        # Create a string representation of the activity data
        activity_string = f"id:{activity_data.get('id', '')}"
        activity_string += f"|user:{activity_data.get('user_id', '')}"
        activity_string += f"|time:{activity_data.get('start_time', '')}"
        activity_string += f"|type:{activity_data.get('activity_type', '')}"
        activity_string += f"|distance:{activity_data.get('distance', 0)}"
        
        # Hash the string
        return self.web3.keccak(text=activity_string).hex()
        
    def _generate_activity_metadata_uri(self, activity_data: Dict[str, Any]) -> str:
        """
        Generate a metadata URI for the activity NFT
        In a real app, this would upload to IPFS or similar
        
        Args:
            activity_data: Activity data to store
            
        Returns:
            URI string
        """
        # This is a placeholder
        # In a real app, you would upload to IPFS or a centralized server
        activity_id = activity_data.get('id', '')
        return f"https://api.fitapp.example/metadata/{activity_id}"
        
    def get_user_nfts(self, user_address: str) -> list:
        """
        Get all NFTs owned by a user
        
        Args:
            user_address: Ethereum address of the user
            
        Returns:
            List of NFT token IDs
        """
        if not self.nft_contract:
            raise ValueError("NFT contract not initialized")
            
        try:
            # Call contract method to get user's NFTs
            token_count = self.nft_contract.functions.balanceOf(user_address).call()
            
            tokens = []
            for i in range(token_count):
                token_id = self.nft_contract.functions.tokenOfOwnerByIndex(
                    user_address, 
                    i
                ).call()
                
                token_uri = self.nft_contract.functions.tokenURI(token_id).call()
                
                tokens.append({
                    'token_id': token_id,
                    'token_uri': token_uri
                })
                
            return tokens
            
        except Exception as e:
            print(f"Error getting user NFTs: {str(e)}")
            return []

# Singleton instance
contract_manager = ContractManager()