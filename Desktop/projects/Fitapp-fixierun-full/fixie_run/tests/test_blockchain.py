"""
Unit tests for blockchain integration.
"""

import unittest
from unittest.mock import patch, MagicMock
import os
import json
from web3.exceptions import ContractLogicError

from fixie_run.core.blockchain import BlockchainClient

class TestBlockchainClient(unittest.TestCase):
    """Test cases for BlockchainClient functionality."""
    
    def setUp(self):
        """Set up test environment."""
        # Create a mock for Web3
        self.mock_web3_patcher = patch('fixie_run.core.blockchain.Web3')
        self.mock_web3 = self.mock_web3_patcher.start()
        
        # Configure mock web3 instance
        self.mock_w3 = MagicMock()
        self.mock_web3.HTTPProvider.return_value = "http_provider"
        self.mock_web3.return_value = self.mock_w3
        
        # Configure the mock w3 instance to be connected
        self.mock_w3.is_connected.return_value = True
        
        # Mock contract
        self.mock_contract = MagicMock()
        self.mock_w3.eth.contract.return_value = self.mock_contract
        
        # Set up test RPC URL and contract address
        self.test_rpc_url = "https://test-rpc.example.com"
        self.test_contract_address = "0x1234567890123456789012345678901234567890"
        
        # Create client with blockchain enabled
        with patch('fixie_run.core.blockchain.settings.BLOCKCHAIN_ENABLED', True):
            self.client = BlockchainClient(
                rpc_url=self.test_rpc_url,
                token_contract_address=self.test_contract_address
            )
    
    def tearDown(self):
        """Clean up after tests."""
        self.mock_web3_patcher.stop()
    
    def test_initialization(self):
        """Test client initialization."""
        self.assertEqual(self.client.rpc_url, self.test_rpc_url)
        self.assertEqual(self.client.token_contract_address, self.test_contract_address)
        self.assertIsNotNone(self.client.contract_abi)
        self.mock_web3.HTTPProvider.assert_called_once_with(self.test_rpc_url)
        self.assertEqual(self.client.w3, self.mock_w3)
    
    def test_blockchain_disabled(self):
        """Test initialization with blockchain disabled."""
        with patch('fixie_run.core.blockchain.settings.BLOCKCHAIN_ENABLED', False):
            client = BlockchainClient(
                rpc_url=self.test_rpc_url,
                token_contract_address=self.test_contract_address
            )
            self.assertIsNone(client.w3)
    
    def test_connection_failure(self):
        """Test handling of connection failure."""
        # Set up the mock to fail connection
        self.mock_w3.is_connected.return_value = False
        
        # Test connect method
        result = self.client.connect()
        self.assertFalse(result)
    
    def test_contract_loading(self):
        """Test that contract is loaded correctly."""
        # Reset mock to verify call
        self.mock_w3.eth.contract.reset_mock()
        
        # Reconnect to trigger contract loading
        self.client.connect()
        
        # Verify contract was loaded
        self.mock_w3.eth.contract.assert_called_once_with(
            address=self.test_contract_address,
            abi=self.client.contract_abi
        )
    
    def test_is_connected(self):
        """Test is_connected method."""
        self.assertTrue(self.client.is_connected())
        
        # Test when not connected
        self.client.w3 = None
        self.assertFalse(self.client.is_connected())
    
    def test_verify_cycling_activity(self):
        """Test verification of cycling activity."""
        # This is currently a placeholder function
        result = self.client.verify_cycling_activity({"proof": "test"})
        self.assertTrue(result)
    
    def test_get_token_balance(self):
        """Test getting token balance."""
        # Configure mock contract call
        balance_wei = 1500000000000000000  # 1.5 tokens in wei
        mock_balance_func = MagicMock()
        mock_balance_func.call.return_value = balance_wei
        self.mock_contract.functions.balanceOf.return_value = mock_balance_func
        
        # Call the method
        balance = self.client.get_token_balance("0xtest")
        
        # Verify result
        self.assertEqual(balance, 1.5)
        self.mock_contract.functions.balanceOf.assert_called_once_with("0xtest")
    
    def test_get_token_balance_error(self):
        """Test error handling in get_token_balance."""
        # Configure mock to raise an exception
        self.mock_contract.functions.balanceOf.side_effect = Exception("Test error")
        
        # Call should return 0.0 instead of raising
        balance = self.client.get_token_balance("0xtest")
        self.assertEqual(balance, 0.0)
    
    @patch('fixie_run.core.blockchain.os.environ.get')
    def test_send_reward_tokens(self, mock_env_get):
        """Test sending reward tokens."""
        # Mock private key retrieval
        test_private_key = "0x1234567890abcdef"
        mock_env_get.return_value = test_private_key
        
        # Mock account from private key
        mock_account = MagicMock()
        mock_account.address = "0xsender"
        self.mock_w3.eth.account.from_key.return_value = mock_account
        
        # Mock transaction related methods
        self.mock_w3.eth.get_transaction_count.return_value = 5
        self.mock_w3.eth.gas_price = 20000000000  # 20 Gwei
        
        # Mock contract transaction
        mock_tx_function = MagicMock()
        self.mock_contract.functions.transfer.return_value = mock_tx_function
        build_tx_result = {"tx": "data"}
        mock_tx_function.build_transaction.return_value = build_tx_result
        
        # Mock transaction signing and sending
        mock_signed_tx = MagicMock()
        mock_signed_tx.rawTransaction = b'signed_raw_tx'
        self.mock_w3.eth.account.sign_transaction.return_value = mock_signed_tx
        self.mock_w3.eth.send_raw_transaction.return_value = b'tx_hash'
        
        # Mock transaction receipt
        mock_receipt = MagicMock()
        mock_receipt.status = 1  # success
        self.mock_w3.eth.wait_for_transaction_receipt.return_value = mock_receipt
        
        # Call the method
        result = self.client.send_reward_tokens(
            recipient_address="0xrecipient",
            amount=5.0
        )
        
        # Verify the results
        self.assertEqual(result, "7478685f68617368")  # hex encoding of b'tx_hash'
        
        # Check that contract call was made correctly
        self.mock_contract.functions.transfer.assert_called_once_with(
            "0xrecipient",
            5000000000000000000  # 5.0 tokens in wei
        )
        
        # Check transaction was signed with private key
        self.mock_w3.eth.account.sign_transaction.assert_called_once_with(
            build_tx_result, 
            test_private_key
        )
    
    def test_send_reward_tokens_failure(self):
        """Test handling of transaction failure."""
        # Mock private key retrieval
        with patch('fixie_run.core.blockchain.os.environ.get', return_value="0xkey"):
            # Mock account
            mock_account = MagicMock()
            mock_account.address = "0xsender"
            self.mock_w3.eth.account.from_key.return_value = mock_account
            
            # Mock transaction process
            self.mock_w3.eth.get_transaction_count.return_value = 5
            
            # Mock contract function
            mock_tx_function = MagicMock()
            self.mock_contract.functions.transfer.return_value = mock_tx_function
            mock_tx_function.build_transaction.return_value = {"tx": "data"}
            
            # Mock signing
            mock_signed_tx = MagicMock()
            self.mock_w3.eth.account.sign_transaction.return_value = mock_signed_tx
            
            # Mock transaction receipt with failure status
            mock_receipt = MagicMock()
            mock_receipt.status = 0  # failure
            self.mock_w3.eth.wait_for_transaction_receipt.return_value = mock_receipt
            
            # Call should return None for failed transaction
            result = self.client.send_reward_tokens("0xrecipient", 5.0)
            self.assertIsNone(result)
    
    def test_batch_send_rewards(self):
        """Test batch sending of rewards."""
        # Patch the send_reward_tokens method
        with patch.object(self.client, 'send_reward_tokens') as mock_send:
            # Configure mock return values
            mock_send.side_effect = ["tx1", "tx2", None]  # last one fails
            
            # Call batch method
            rewards_data = {
                "0xuser1": 10.0,
                "0xuser2": 15.0,
                "0xuser3": 5.0  # this one will "fail"
            }
            
            results = self.client.batch_send_rewards(rewards_data)
            
            # Verify results
            self.assertEqual(results, {
                "0xuser1": "tx1",
                "0xuser2": "tx2",
                "0xuser3": None
            })
            
            # Check that send_reward_tokens was called for each user
            self.assertEqual(mock_send.call_count, 3)
            mock_send.assert_any_call("0xuser1", 10.0, None)
            mock_send.assert_any_call("0xuser2", 15.0, None)
            mock_send.assert_any_call("0xuser3", 5.0, None)