import json
import os
from web3 import Web3
from web3.middleware import geth_poa_middleware
import logging

class BlockchainConnector:
    """Connector for interacting with blockchain for cycling data."""
    
    def __init__(self, provider_url, contract_address=None, abi_path=None):
        """
        Initialize the blockchain connector.
        
        Args:
            provider_url (str): URL of the Web3 provider
            contract_address (str): Address of the deployed smart contract
            abi_path (str): Path to the contract ABI JSON file
        """
        self.provider_url = provider_url
        self.contract_address = contract_address
        self.abi_path = abi_path
        self.web3 = None
        self.contract = None
        self.connected = False
        self.logger = logging.getLogger(__name__)
        
        # Try to connect immediately
        self.connect()
        
    def connect(self):
        """Establish connection to the blockchain."""
        try:
            self.web3 = Web3(Web3.HTTPProvider(self.provider_url))
            
            # Add middleware for compatibility with POA chains like Polygon
            self.web3.middleware_onion.inject(geth_poa_middleware, layer=0)
            
            self.connected = self.web3.is_connected()
            
            if self.connected:
                self.logger.info(f"Connected to blockchain at {self.provider_url}")
                
                # Load contract if address and ABI are provided
                if self.contract_address and self.abi_path:
                    self.load_contract()
            else:
                self.logger.error(f"Failed to connect to blockchain at {self.provider_url}")
                
        except Exception as e:
            self.logger.error(f"Error connecting to blockchain: {str(e)}")
            self.connected = False
            
        return self.connected
    
    def load_contract(self):
        """Load the smart contract."""
        try:
            if os.path.exists(self.abi_path):
                with open(self.abi_path, 'r') as f:
                    contract_json = json.load(f)
                    
                # Extract ABI
                if 'abi' in contract_json:
                    abi = contract_json['abi']
                else:
                    abi = contract_json
                    
                # Create contract instance
                self.contract = self.web3.eth.contract(
                    address=self.web3.to_checksum_address(self.contract_address),
                    abi=abi
                )
                self.logger.info(f"Loaded contract at {self.contract_address}")
                return True
            else:
                self.logger.error(f"Contract ABI file not found at {self.abi_path}")
                return False
        except Exception as e:
            self.logger.error(f"Error loading contract: {str(e)}")
            return False
            
    def is_connected(self):
        """Check if connected to the blockchain."""
        if self.web3:
            self.connected = self.web3.is_connected()
        return self.connected
    
    def get_network_info(self):
        """Get information about the connected blockchain network."""
        if not self.is_connected():
            return None
            
        try:
            chain_id = self.web3.eth.chain_id
            gas_price = self.web3.eth.gas_price
            block_number = self.web3.eth.block_number
            
            return {
                'chain_id': chain_id,
                'gas_price_gwei': self.web3.from_wei(gas_price, 'gwei'),
                'latest_block': block_number,
                'connected_to': self.provider_url
            }
        except Exception as e:
            self.logger.error(f"Error getting network info: {str(e)}")
            return None
    
    def verify_cycling_data(self, route_hash):
        """
        Verify if a cycling route hash exists on the blockchain.
        
        Args:
            route_hash (str): The route hash to verify
            
        Returns:
            bool: True if verified, False otherwise
        """
        if not self.is_connected() or not self.contract:
            return False
            
        try:
            # Call the verification function on the smart contract
            return self.contract.functions.verifyRouteHash(route_hash).call()
        except Exception as e:
            self.logger.error(f"Error verifying route hash: {str(e)}")
            return False
    
    def store_cycling_session(self, account, private_key, session_data):
        """
        Store cycling session data on the blockchain.
        
        Args:
            account (str): The Ethereum account address
            private_key (str): Private key for transaction signing
            session_data (dict): Session data to store
            
        Returns:
            str: Transaction hash if successful, None otherwise
        """
        if not self.is_connected() or not self.contract:
            return None
            
        try:
            # Prepare transaction
            nonce = self.web3.eth.get_transaction_count(account)
            
            # Encode the function call
            session_id = session_data['session_id']
            distance = session_data['distance_km']
            duration = session_data['duration_min']
            route_hash = session_data['route_hash']
            timestamp = session_data['start_time']
            
            tx = self.contract.functions.recordCyclingSession(
                session_id, 
                int(distance * 1000),  # Convert to meters and store as integer
                int(duration * 60),    # Convert to seconds and store as integer
                route_hash,
                timestamp
            ).build_transaction({
                'from': account,
                'gas': 200000,
                'gasPrice': self.web3.eth.gas_price,
                'nonce': nonce
            })
            
            # Sign and send transaction
            signed_tx = self.web3.eth.account.sign_transaction(tx, private_key)
            tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            return self.web3.to_hex(tx_hash)
        except Exception as e:
            self.logger.error(f"Error storing cycling session: {str(e)}")
            return None
            
    def get_user_achievements(self, account):
        """
        Get user cycling achievements from the blockchain.
        
        Args:
            account (str): The Ethereum account address
            
        Returns:
            dict: Achievement data if successful, None otherwise
        """
        if not self.is_connected() or not self.contract:
            return None
            
        try:
            achievements = self.contract.functions.getUserAchievements(account).call()
            
            return {
                'total_sessions': achievements[0],
                'total_distance': achievements[1] / 1000,  # Convert back to km
                'total_duration': achievements[2] / 60,    # Convert back to minutes
                'achievement_badges': achievements[3]
            }
        except Exception as e:
            self.logger.error(f"Error getting user achievements: {str(e)}")
            return None