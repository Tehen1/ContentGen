import { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import './styles.css';

interface NFTItem {
  id: number;
  name: string;
  image: string;
  rarity: string;
  attributes: {
    type: string;
    value: string;
  }[];
}

const NFT = () => {
  const { walletState, tokenBalance, ownedNFTs, nftContract } = useWeb3();
  const [nftItems, setNftItems] = useState<NFTItem[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);
  const [showMintModal, setShowMintModal] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [mintSuccess, setMintSuccess] = useState<boolean>(false);

  // Placeholder for fetching NFTs
  useEffect(() => {
    // This would be replaced with actual NFT data fetching
    const fetchNFTs = async () => {
      // Mock data
      const mockNFTs: NFTItem[] = [
        {
          id: 1,
          name: 'Marathon Runner',
          image: 'https://via.placeholder.com/200',
          rarity: 'Rare',
          attributes: [
            { type: 'Boost', value: '+10% Speed' },
            { type: 'Stamina', value: 'High' },
            { type: 'Distance', value: '42.2 km' }
          ]
        },
        {
          id: 2,
          name: 'Trail Explorer',
          image: 'https://via.placeholder.com/200',
          rarity: 'Common',
          attributes: [
            { type: 'Boost', value: '+5% Stamina' },
            { type: 'Terrain', value: 'All' },
            { type: 'Elevation', value: '+15% Points' }
          ]
        },
      ];
      
      setNftItems(mockNFTs);
    };

    fetchNFTs();
  }, [ownedNFTs]);

  // Handle NFT selection
  const handleNFTSelect = (nft: NFTItem) => {
    setSelectedNFT(nft);
  };

  // Close NFT detail modal
  const closeNFTDetail = () => {
    setSelectedNFT(null);
  };

  // Toggle mint modal
  const toggleMintModal = () => {
    setShowMintModal(!showMintModal);
    setMintSuccess(false);
  };

  // Mint new NFT
  const handleMintNFT = async () => {
    if (!walletState.connected) {
      alert('Please connect your wallet first');
      return;
    }

    setIsMinting(true);
    
    try {
      // This would be replaced with actual minting logic
      setTimeout(() => {
        setIsMinting(false);
        setMintSuccess(true);
        
        // Add a new minted NFT to the collection
        const newNFT: NFTItem = {
          id: nftItems.length + 1,
          name: 'Newly Minted NFT',
          image: 'https://via.placeholder.com/200',
          rarity: 'Common',
          attributes: [
            { type: 'Boost', value: '+3% Tokens' },
            { type: 'Luck', value: 'Medium' }
          ]
        };
        
        setNftItems([...nftItems, newNFT]);
      }, 2000);
    } catch (error) {
      console.error('Error minting NFT:', error);
      setIsMinting(false);
    }
  };

  return (
    <div className="nft-container">
      <header className="nft-header">
        <h1>NFT Collection</h1>
        <div className="wallet-status">
          {walletState.connected ? (
            <span className="wallet-connected">Wallet Connected</span>
          ) : (
            <button className="connect-wallet-btn">Connect Wallet</button>
          )}
        </div>
      </header>

      <div className="nft-actions">
        <button className="mint-btn" onClick={toggleMintModal}>
          Mint New NFT
        </button>
        <div className="token-balance">
          <span className="token-icon">🪙</span>
          <span className="token-amount">{tokenBalance} FIT</span>
        </div>
      </div>

      <section className="nft-gallery">
        <h2>Your Collection</h2>
        {nftItems.length > 0 ? (
          <div className="nft-grid">
            {nftItems.map((nft) => (
              <div 
                className="nft-card" 
                key={nft.id}
                onClick={() => handleNFTSelect(nft)}
              >
                <div className="nft-image">
                  <img src={nft.image} alt={nft.name} />
                </div>
                <div className="nft-info">
                  <h3>{nft.name}</h3>
                  <span className={`nft-rarity ${nft.rarity.toLowerCase()}`}>{nft.rarity}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-nfts">
            <p>No NFTs in your collection yet.</p>
            <button className="primary-btn" onClick={toggleMintModal}>
              Mint your first NFT
            </button>
          </div>
        )}
      </section>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <div className="nft-detail-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={closeNFTDetail}>×</button>
            <div className="nft-detail">
              <div className="nft-detail-image">
                <img src={selectedNFT.image} alt={selectedNFT.name} />
              </div>
              <div className="nft-detail-info">
                <h2>{selectedNFT.name}</h2>
                <span className={`nft-rarity ${selectedNFT.rarity.toLowerCase()}`}>
                  {selectedNFT.rarity}
                </span>
                
                <div className="nft-attributes">
                  <h3>Attributes</h3>
                  <div className="attributes-grid">
                    {selectedNFT.attributes.map((attr, index) => (
                      <div className="attribute-item" key={index}>
                        <span className="attribute-type">{attr.type}</span>
                        <span className="attribute-value">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="nft-actions">
                  <button className="action-btn">Equip</button>
                  <button className="action-btn secondary">Transfer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mint Modal */}
      {showMintModal && (
        <div className="mint-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={toggleMintModal}>×</button>
            <h2>Mint New NFT</h2>
            
            {!mintSuccess ? (
              <>
                <div className="mint-options">
                  <div className="mint-option">
                    <div className="mint-preview">
                      <img src="https://via.placeholder.com/200" alt="Random NFT" />
                    </div>
                    <h3>Random Fitness NFT</h3>
                    <p>Get a random fitness NFT with unique attributes</p>
                    <div className="mint-price">
                      <span className="price-label">Price:</span>
                      <span className="price-value">100 FIT</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="mint-confirm-btn" 
                  onClick={handleMintNFT}
                  disabled={isMinting || parseFloat(tokenBalance) < 100}
                >
                  {isMinting ? 'Minting...' : 'Mint Now'}
                </button>
                
                {parseFloat(tokenBalance) < 100 && (
                  <p className="insufficient-funds">
                    Insufficient tokens. You need 100 FIT to mint.
                  </p>
                )}
              </>
            ) : (
              <div className="mint-success">
                <div className="success-icon">🎉</div>
                <h3>NFT Minted Successfully!</h3>
                <p>Your new NFT has been added to your collection.</p>
                <button className="primary-btn" onClick={toggleMintModal}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NFT;

