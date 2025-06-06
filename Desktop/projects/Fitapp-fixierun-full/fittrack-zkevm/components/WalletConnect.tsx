import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { ZKEVM_TESTNET } from '../lib/zkEvmConfig';
import { WalletInfo } from '../types';

const WalletConnect = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          // Check if already connected
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            const address = accounts[0].address;
            const network = await provider.getNetwork();
            const balance = await provider.getBalance(address);
            
            setWalletInfo({
              address,
              chainId: network.chainId.toString(),
              balance: ethers.formatEther(balance),
              isConnected: true,
            });
          }
        } catch (err) {
          console.error("Error checking wallet connection:", err);
        }
      }
    };

    checkWalletConnection();
  }, []);

  // Connect to wallet
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error("No Ethereum wallet found. Please install MetaMask or another compatible wallet.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length === 0) {
        throw new Error("No accounts found. Please allow access to your Ethereum accounts.");
      }

      const address = accounts[0];
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(address);

      setWalletInfo({
        address,
        chainId: network.chainId.toString(),
        balance: ethers.formatEther(balance),
        isConnected: true,
      });

      // Check if we need to switch networks
      if (network.chainId.toString() !== ZKEVM_TESTNET.chainId) {
        await switchToZkEVM();
      }
    } catch (err: any) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Switch to zkEVM network
  const switchToZkEVM = async () => {
    if (!window.ethereum) return;

    try {
      // Try to switch to the zkEVM network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${parseInt(ZKEVM_TESTNET.chainId).toString(16)}` }],
      });
    } catch (switchError: any) {
      // If the network is not added to MetaMask, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${parseInt(ZKEVM_TESTNET.chainId).toString(16)}`,
                chainName: ZKEVM_TESTNET.name,
                nativeCurrency: {
                  name: ZKEVM_TESTNET.nativeCurrency.name,
                  symbol: ZKEVM_TESTNET.nativeCurrency.symbol,
                  decimals: ZKEVM_TESTNET.nativeCurrency.decimals,
                },
                rpcUrls: [ZKEVM_TESTNET.rpcUrls[0]],
                blockExplorerUrls: [ZKEVM_TESTNET.blockExplorerUrls[0]],
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding zkEVM network:", addError);
          setError("Failed to add zkEVM network. Please add it manually.");
        }
      } else {
        console.error("Error switching to zkEVM network:", switchError);
        setError("Failed to switch to zkEVM network.");
      }
    }
  };

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setWalletInfo(null);
    setError(null);
  }, []);

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="wallet-connect">
      <h2>Wallet Connection</h2>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {!walletInfo?.isConnected ? (
        <button 
          onClick={connectWallet} 
          disabled={isConnecting}
          className="connect-button"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="wallet-info">
          <div className="address-row">
            <span>Address: </span>
            <strong>{formatAddress(walletInfo.address)}</strong>
          </div>
          
          <div className="network-row">
            <span>Network: </span>
            <strong>
              {walletInfo.chainId === ZKEVM_TESTNET.chainId 
                ? `${ZKEVM_TESTNET.name} (zkEVM)` 
                : `Unknown Network (${walletInfo.chainId})`}
            </strong>
            
            {walletInfo.chainId !== ZKEVM_TESTNET.chainId && (
              <button onClick={switchToZkEVM} className="switch-network-button">
                Switch to zkEVM
              </button>
            )}
          </div>
          
          <div className="balance-row">
            <span>Balance: </span>
            <strong>{parseFloat(walletInfo.balance).toFixed(4)} ETH</strong>
          </div>
          
          <button 
            onClick={disconnectWallet} 
            className="disconnect-button"
          >
            Disconnect
          </button>
        </div>
      )}

      <style jsx>{`
        .wallet-connect {
          padding: 20px;
          border-radius: 10px;
          background-color: #f8f9fa;
          max-width: 400px;
          margin: 0 auto;
        }
        
        h2 {
          margin-top: 0;
          color: #333;
          margin-bottom: 20px;
        }
        
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .error-message button {
          background: none;
          border: none;
          color: #c62828;
          cursor: pointer;
          font-weight: bold;
        }
        
        .connect-button {
          width: 100%;
          padding: 12px;
          background-color: #3f51b5;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: background-color 0.3s;
        }
        
        .connect-button:hover {
          background-color: #303f9f;
        }
        
        .connect-button:disabled {
          background-color: #bdbdbd;
          cursor: not-allowed;
        }
        
        .wallet-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .address-row, .network-row, .balance-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .switch-network-button {
          margin-left: 10px;
          padding: 5px 10px;
          background-color: #ff9800;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
        }
        
        .disconnect-button {
          margin-top: 15px;
          padding: 10px;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .disconnect-button:hover {
          background-color: #d32f2f;
        }
      `}</style>
    </div>
  );
};

export default WalletConnect;

