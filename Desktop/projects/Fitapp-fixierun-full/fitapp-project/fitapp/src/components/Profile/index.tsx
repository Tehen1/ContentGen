import { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useSocket } from '../../contexts/SocketContext';
import './styles.css';

interface ActivitySummary {
  totalDistance: number;
  totalActivities: number;
  averageSpeed: number;
  bestDistances: number[];
}

interface UserSetting {
  id: string;
  name: string;
  value: string | boolean;
  type: 'toggle' | 'select' | 'input';
  options?: string[];
}

interface Badge {
  id: number;
  name: string;
  icon: string;
  earned: boolean;
}

const Profile = () => {
  const { walletState, tokenBalance, disconnect, connectWallet } = useWeb3();
  const { trackingStats } = useSocket();
  
  const [activitySummary, setActivitySummary] = useState<ActivitySummary>({
    totalDistance: 0,
    totalActivities: 0,
    averageSpeed: 0,
    bestDistances: [5, 10, 15]
  });
  
  const [settings, setSettings] = useState<UserSetting[]>([
    { id: 'darkMode', name: 'Dark Mode', value: false, type: 'toggle' },
    { id: 'notifications', name: 'Notifications', value: true, type: 'toggle' },
    { id: 'distanceUnit', name: 'Distance Units', value: 'km', type: 'select', options: ['km', 'miles'] },
    { id: 'gpsAccuracy', name: 'GPS Accuracy', value: 'high', type: 'select', options: ['low', 'medium', 'high'] }
  ]);
  
  const [badges, setBadges] = useState<Badge[]>([
    { id: 1, name: 'Early Bird', icon: '🌅', earned: true },
    { id: 2, name: '5K Finisher', icon: '🏃', earned: true },
    { id: 3, name: 'Marathon Master', icon: '🏆', earned: false },
    { id: 4, name: 'Night Owl', icon: '🦉', earned: true },
    { id: 5, name: 'Trail Explorer', icon: '🏞️', earned: false },
    { id: 6, name: 'Speed Demon', icon: '⚡', earned: false }
  ]);

  // Fetch user profile data (mock for now)
  useEffect(() => {
    // This would be replaced with actual API call
    const fetchUserProfile = async () => {
      // Mock data
      setActivitySummary({
        totalDistance: 127.5,
        totalActivities: 15,
        averageSpeed: 10.2,
        bestDistances: [5, 10, 15]
      });
    };

    fetchUserProfile();
  }, []);
  
  // Handle wallet connection
  const handleWalletConnect = async () => {
    try {
      await connectWallet('metamask');
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };
  
  // Handle wallet disconnection
  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  // Toggle setting value
  const handleToggleSetting = (id: string) => {
    setSettings(prevSettings => 
      prevSettings.map(setting => 
        setting.id === id ? { ...setting, value: !setting.value } : setting
      )
    );
  };

  // Change setting value
  const handleChangeSettingValue = (id: string, value: string) => {
    setSettings(prevSettings => 
      prevSettings.map(setting => 
        setting.id === id ? { ...setting, value } : setting
      )
    );
  };

  // Format distance based on settings
  const formatDistance = (meters: number): string => {
    const distanceUnit = settings.find(s => s.id === 'distanceUnit')?.value as string || 'km';
    
    if (distanceUnit === 'miles') {
      const miles = meters / 1609.34;
      return `${miles.toFixed(1)} mi`;
    } else {
      return meters < 1000 
        ? `${meters.toFixed(0)} m` 
        : `${(meters / 1000).toFixed(1)} km`;
    }
  };

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1>Profile</h1>
      </header>

      <section className="user-info-section">
        <div className="user-avatar">
          <div className="avatar-placeholder">
            <span>👤</span>
          </div>
        </div>
        <div className="user-details">
          <h2>User Name</h2>
          <p className="user-level">Level 10</p>
          {walletState.connected ? (
            <div className="wallet-info">
              <p className="wallet-address">
                {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
              </p>
              <div className="token-balance">
                <span className="token-icon">🪙</span>
                <span className="token-amount">{tokenBalance} FIT</span>
              </div>
              <button className="disconnect-btn" onClick={handleDisconnect}>
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <button className="connect-wallet-btn" onClick={handleWalletConnect}>
              Connect Wallet
            </button>
          )}
        </div>
      </section>

      <section className="performance-section">
        <h2>Performance Stats</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Distance</h3>
            <div className="stat-value">{formatDistance(activitySummary.totalDistance * 1000)}</div>
          </div>
          <div className="stat-card">
            <h3>Total Activities</h3>
            <div className="stat-value">{activitySummary.totalActivities}</div>
          </div>
          <div className="stat-card">
            <h3>Average Speed</h3>
            <div className="stat-value">{activitySummary.averageSpeed.toFixed(1)} km/h</div>
          </div>
        </div>

        <h3 className="sub-heading">Best Distances</h3>
        <div className="best-distances">
          {activitySummary.bestDistances.map((distance, index) => (
            <div className="distance-badge" key={index}>
              {distance} km
            </div>
          ))}
        </div>
      </section>

      <section className="badges-section">
        <h2>Badges</h2>
        <div className="badges-grid">
          {badges.map((badge) => (
            <div className={`badge-card ${badge.earned ? 'earned' : 'locked'}`} key={badge.id}>
              <div className="badge-icon">{badge.icon}</div>
              <h3>{badge.name}</h3>
              {!badge.earned && <div className="locked-overlay">🔒</div>}
            </div>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h2>Settings</h2>
        <div className="settings-list">
          {settings.map((setting) => (
            <div className="setting-item" key={setting.id}>
              <div className="setting-label">{setting.name}</div>
              <div className="setting-control">
                {setting.type === 'toggle' ? (
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={setting.value as boolean}
                      onChange={() => handleToggleSetting(setting.id)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                ) : setting.type === 'select' && setting.options ? (
                  <select 
                    value={setting.value as string}
                    onChange={(e) => handleChangeSettingValue(setting.id, e.target.value)}
                  >
                    {setting.options.map((option) => (
                      <option value={option} key={option}>{option}</option>
                    ))}
                  </select>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Profile;
