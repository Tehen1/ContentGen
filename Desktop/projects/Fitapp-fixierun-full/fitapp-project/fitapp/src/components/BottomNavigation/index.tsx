import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles.css';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>(location.pathname);

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  // Handle tab click
  const handleTabClick = (path: string) => {
    navigate(path);
    setActiveTab(path);
  };

  return (
    <div className="bottom-navigation">
      <div 
        className={`nav-item ${activeTab === '/' ? 'active' : ''}`}
        onClick={() => handleTabClick('/')}
      >
        <div className="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <span className="nav-label">Dashboard</span>
      </div>

      <div 
        className={`nav-item ${activeTab === '/track' ? 'active' : ''}`}
        onClick={() => handleTabClick('/track')}
      >
        <div className="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
          </svg>
        </div>
        <span className="nav-label">Track</span>
      </div>

      <div 
        className={`nav-item ${activeTab === '/nft' ? 'active' : ''}`}
        onClick={() => handleTabClick('/nft')}
      >
        <div className="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
        <span className="nav-label">NFTs</span>
      </div>

      <div 
        className={`nav-item ${activeTab === '/marketplace' ? 'active' : ''}`}
        onClick={() => handleTabClick('/marketplace')}
      >
        <div className="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        </div>
        <span className="nav-label">Market</span>
      </div>

      <div 
        className={`nav-item ${activeTab === '/profile' ? 'active' : ''}`}
        onClick={() => handleTabClick('/profile')}
      >
        <div className="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <span className="nav-label">Profile</span>
      </div>
    </div>
  );
};

export default BottomNavigation;
