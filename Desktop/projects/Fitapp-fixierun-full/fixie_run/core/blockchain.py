"""
Blockchain integration for Fixie.Run using zkEVM.
"""

import os
from typing import Dict, Any, Optional
import logging
from web3 import Web3
from web3.exceptions import ContractLogicError

from fixie_run.config import settings

logger = logging.getLogger(__name__)

class BlockchainClient:
    """Client for interacting with the zkEVM blockchain."""
    
    def __init__(
        self,
        rpc_url: Optional[str] = None,
        token_contract_address: Optional[str] = None
    ):
        """
        Initialize the blockchain client.
        
        Args:
            rpc_url: URL for zkEVM RPC endpoint
            token_contract_address: Address of the FIXIE token contract
        """
        self.rpc_url = rpc_url or settings.BLOCKCHAIN_RPC_URL
        self.token_contract_address = token_contract_address or settings.TOKEN_CONTRACT_ADDRESS
        self.w3 = None
        self.token_contract = None
        self.contract_abi = self._load_contract_abi()
        
        # Only connect if blockchain is enabled in settings
        if settings.BLOCKCHAIN_ENABLED:
            self.connect()
    
    def connect(self) -> bool:
        """
        Connect to the zkEVM blockchain.
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
            
            if not self.w3.is_connected():
                logger.error("Failed to connect to RPC endpoint")
                return False
            
            # Load token contract if address is provided
            if self.token_contract_address and self.contract_abi:
                self.token_contract = self.w3.eth.contract(
                    address=self.token_contract_address,
                    abi=self.contract_abi
                )
                
            return True
        except Exception as e:
            logger.error(f"Blockchain connection error: {e}")
            return False
    
    def _load_contract_abi(self) -> Optional[list]:
        """
        Load the token contract ABI from file.
        
        Returns:
            Optional list of ABI definitions
        """
        # This is a simplified ABI for demo purposes
        # In a real application, load this from a JSON file
        return [
            {
                "constant": False,
                "inputs": [
                    {"name": "to", "type": "address"},
                    {"name": "value", "type": "uint256"}
                ],
                "name": "transfer",
                "outputs": [{"name": "", "type": "bool"}],
                "payable": False,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": True,
                "inputs": [{"name": "owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "", "type": "uint256"}],
                "payable": False,
                "stateMutability": "view",
                "type": "function"
            }
        ]
    
    def is_connected(self) -> bool:
        """Check if connected to blockchain."""
        return self.w3 is not None and self.w3.is_connected()
    
    def verify_cycling_activity(self, proof_data: Dict[str, Any]) -> bool:
        """
        Verify cycling activity using zero-knowledge proofs.
        
        Args:
            proof_data: Zero-knowledge proof data
            
        Returns:
            bool: True if verification is successful
        """
        # This is a placeholder for actual zkEVM verification
        # In a real implementation, this would use zkSNARK verification
        logger.info("Verifying cycling activity with zkEVM")
        return True
    
    def get_token_balance(self, address: str) -> float:
        """
        Get FIXIE token balance for an address.
        
        Args:
            address: Ethereum wallet address
            
        Returns:
            float: Token balance in standard units (not wei)
        """
        if not self.is_connected() or not self.token_contract:
            logger.error("Cannot get balance: not connected to blockchain or contract not loaded")
            return 0.0
            
        try:
            balance_wei = self.token_contract.functions.balanceOf(address).call()
            # Convert from wei (assuming 18 decimals for token)
            balance = balance_wei / 10**18
            return balance
        except Exception as e:
            logger.error(f"Error retrieving token balance: {e}")
            return 0.0
    
    def send_reward_tokens(
        self,
        recipient_address: str,
        amount: float,
        sender_private_key: Optional[str] = None
    ) -> Optional[str]:
        """
        Send FIXIE reward tokens to a user.
        
        Args:
            recipient_address: Recipient's Ethereum address
            amount: Amount of tokens to send (in standard units, not wei)
            sender_private_key: Private key of sender (defaults to environment variable)
            
        Returns:
            Optional[str]: Transaction hash if successful, None otherwise
        """
        if not self.is_connected() or not self.token_contract:
            logger.error("Cannot send tokens: not connected to blockchain or contract not loaded")
            return None
            
        try:
            # Get private key from environment if not provided
            private_key = sender_private_key or os.environ.get("FIXIE_SENDER_PRIVATE_KEY")
            if not private_key:
                logger.error("Sender private key not provided")
                return None
                
            # Get sender address from private key
            account = self.w3.eth.account.from_key(private_key)
            sender_address = account.address
            
            # Convert amount to wei (assuming 18 decimals)
            amount_wei = int(amount * 10**18)
            
            # Build transaction
            nonce = self.w3.eth.get_transaction_count(sender_address)
            txn = self.token_contract.functions.transfer(
                recipient_address,
                amount_wei
            ).build_transaction({
                'chainId': 1101,  # zkEVM chain ID
                'gas': 100000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': nonce,
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(txn, private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for transaction receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            if receipt.status == 1:  # 1 = success
                logger.info(f"Successfully sent {amount} FIXIE tokens to {recipient_address}")
                return tx_hash.hex()
            else:
                logger.error(f"Transaction failed: {receipt}")
                return None
                
        except ContractLogicError as e:
            logger.error(f"Contract error when sending tokens: {e}")
            return None
        except Exception as e:
            logger.error(f"Error sending tokens: {e}")
            return None
            
    def batch_send_rewards(
        self,
        rewards_data: Dict[str, float],
        sender_private_key: Optional[str] = None
    ) -> Dict[str, Optional[str]]:
        """
        Send rewards to multiple users in a batch to save gas.
        
        Args:
            rewards_data: Dictionary mapping user addresses to reward amounts
            sender_private_key: Private key of sender
            
        Returns:
            Dict mapping addresses to transaction hashes (or None if failed)
        """
        results = {}
        for address, amount in rewards_data.items():
            tx_hash = self.send_reward_tokens(address, amount, sender_private_key)
            results[address] = tx_hash
        return results