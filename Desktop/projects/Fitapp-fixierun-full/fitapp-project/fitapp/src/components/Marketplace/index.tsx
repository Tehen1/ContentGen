import { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import './styles.css';

interface MarketItem {
  id: number;
  name: string;
  image: string;
  description: string;
  price: number;
  category: string;
  seller: string;
}

const Marketplace = () => {
  const { walletState, tokenBalance } = useWeb3();
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);

  // Fetch marketplace items (mock data for now)
  useEffect(() => {
    // This would be replaced with actual API call
    const fetchMarketItems = async () => {
      // Mock data
      const items: MarketItem[] = [
        {
          id: 1,
          name: 'Premium Running Shoes',
          image: 'https://via.placeholder.com/150',
          description: 'Earn +10% tokens when running with these shoes equipped.',
          price: 500,
          category: 'equipment',
          seller: '0x123...456'
        },
        {
          id: 2,
          name: 'Fitness Badge: Marathon',
          image: 'https://via.placeholder.com/150',
          description: 'Badge for completing a marathon. Boosts your reputation.',
          price: 300,
          category: 'badge',
          seller: '0x789...012'
        },
        {
          id: 3,
          name: 'Recovery Boost',
          image: 'https://via.placeholder.com/150',
          description: 'Reduces recovery time after workouts by 20% for 7 days.',
          price: 200,
          category: 'consumable',
          seller: '0x345...678'
        },
        {
          id: 4,
          name: 'Elite Training Program',
          image: 'https://via.placeholder.com/150',
          description: 'A 12-week program designed to improve your stamina and speed.',
          price: 750,
          category: 'program',
          seller: '0x901...234'
        },
        {
          id: 5,
          name: 'Golden Running Shorts',
          image: 'https://via.placeholder.com/150',
          description: 'Legendary item - Gives +15% token earning rate on all activities.',
          price: 1200,
          category: 'equipment',
          seller: '0x567...890'
        }
      ];
      
      setMarketItems(items);
      setFilteredItems(items);
    };

    fetchMarketItems();
  }, []);

  // Handle search and filtering
  useEffect(() => {
    let result = [...marketItems];
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        item => 
          item.name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredItems(result);
  }, [marketItems, selectedCategory, searchQuery]);

  // Handle item selection
  const handleItemSelect = (item: MarketItem) => {
    setSelectedItem(item);
  };

  // Close detail modal
  const closeItemDetail = () => {
    setSelectedItem(null);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle item purchase
  const handlePurchase = (item: MarketItem) => {
    if (!walletState.connected) {
      alert('Please connect your wallet to make purchases');
      return;
    }

    if (parseFloat(tokenBalance) < item.price) {
      alert('Insufficient tokens to purchase this item');
      return;
    }

    // This would be replaced with actual purchase logic
    alert(`Item "${item.name}" purchased successfully!`);
    closeItemDetail();
  };

  return (
    <div className="marketplace-container">
      <header className="marketplace-header">
        <h1>Marketplace</h1>
        <div className="wallet-status">
          {walletState.connected ? (
            <span className="wallet-connected">Wallet Connected</span>
          ) : (
            <button className="connect-wallet-btn">Connect Wallet</button>
          )}
        </div>
      </header>

      <div className="search-filter-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="category-filters">
          <button 
            className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('all')}
          >
            All
          </button>
          <button 
            className={`category-btn ${selectedCategory === 'equipment' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('equipment')}
          >
            Equipment
          </button>
          <button 
            className={`category-btn ${selectedCategory === 'badge' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('badge')}
          >
            Badges
          </button>
          <button 
            className={`category-btn ${selectedCategory === 'consumable' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('consumable')}
          >
            Consumables
          </button>
          <button 
            className={`category-btn ${selectedCategory === 'program' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('program')}
          >
            Programs
          </button>
        </div>
      </div>

      <div className="token-balance-display">
        <span className="token-icon">🪙</span>
        <span className="token-amount">{tokenBalance} FIT</span>
      </div>

      <section className="marketplace-items">
        {filteredItems.length > 0 ? (
          <div className="market-grid">
            {filteredItems.map((item) => (
              <div 
                className="market-item" 
                key={item.id}
                onClick={() => handleItemSelect(item)}
              >
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <span className="item-category">{item.category}</span>
                  <div className="item-price">
                    <span className="price-icon">🪙</span>
                    <span className="price-value">{item.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-results">
            <p>No items found matching your criteria.</p>
            <button className="reset-btn" onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}>
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="item-detail-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={closeItemDetail}>×</button>
            <div className="item-detail">
              <div className="item-detail-image">
                <img src={selectedItem.image} alt={selectedItem.name} />
              </div>
              <div className="item-detail-info">
                <h2>{selectedItem.name}</h2>
                <span className="item-category">{selectedItem.category}</span>
                <p className="item-description">{selectedItem.description}</p>
                
                <div className="item-metadata">
                  <div className="metadata-item">
                    <span className="metadata-label">Seller</span>
                    <span className="metadata-value">{selectedItem.seller}</span>
                  </div>
                </div>
                
                <div className="purchase-section">
                  <div className="purchase-price">
                    <span className="price-label">Price:</span>
                    <div className="price-display">
                      <span className="price-icon">🪙</span>
                      <span className="price-value">{selectedItem.price} FIT</span>
                    </div>
                  </div>
                  
                  <button 
                    className="purchase-btn"
                    onClick={() => handlePurchase(selectedItem)}
                    disabled={parseFloat(tokenBalance) < selectedItem.price || !walletState.connected}
                  >
                    Purchase Now
                  </button>
                  
                  {parseFloat(tokenBalance) < selectedItem.price && (
                    <p className="insufficient-funds">
                
