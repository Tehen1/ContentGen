import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3Context';
import { SocketProvider } from './contexts/SocketContext';
import BottomNavigation from './components/BottomNavigation';
import Dashboard from './components/Dashboard';
import Tracking from './components/Tracking';
import NFT from './components/NFT';
import Marketplace from './components/Marketplace';
import Profile from './components/Profile';
import './App.css';

function App() {
  return (
    <div className="app">
      <Web3Provider>
        <SocketProvider>
          <Router>
            <div className="app-container">
              <div className="main-content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/track" element={<Tracking />} />
                  <Route path="/nft" element={<NFT />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
              <BottomNavigation />
            </div>
          </Router>
        </SocketProvider>
      </Web3Provider>
    </div>
  );
}

export default App;
