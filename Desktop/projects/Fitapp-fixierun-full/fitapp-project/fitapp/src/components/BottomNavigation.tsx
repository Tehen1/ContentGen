import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BottomNavigation.css';

const BottomNavigation = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);

  // Update active tab when location changes
  useState(() => {
    setActiveTab(location.pathname);
  });

  return (
    <nav className="bottom-navigation">
      <Link 
        to="/" 
        className={`nav-item ${activeTab === '/' ? 'active' : ''}`}
        onClick={() => setActiveTab('/')}
      >
        <div className="nav-icon">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <span>Dashboard</span>
      </Link>
      
      <Link 
        to="/track" 
        className={`nav-item ${activeTab === '/track' ? 'active' : ''}`}
        onClick={() => setActiveTab('/track')}
      >
        <div className="nav-icon">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
          </svg>
        </div>
        <span>Track</span>
      </Link>
      
      <Link 
        to="/nft" 
        className={`nav-item ${activeTab === '/nft' ? 'active' : ''}`}
        onClick={() => setActiveTab('/nft')}
      >
        <div className="nav-icon">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </div>
        <span>NFTs</span>
      </Link>
      
      <Link 
        to="/marketplace" 
        className={`nav-item ${activeTab === '/marketplace' ? 'active' : ''}`}
        onClick={() => setActiveTab('/marketplace')}
      >
        <div className="nav-icon">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        </div>
        <span>Market</span>
      </Link>
      
      <Link 
        to="/profile" 
        className={`nav-item ${activeTab === '/profile' ? 'active' : ''}`}
        onClick={() => setActiveTab('/profile')}
      >
        <div className="nav-icon">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <span>Profile</span>
      </Link>
    </nav>
  );
};

export default BottomNavigation;

