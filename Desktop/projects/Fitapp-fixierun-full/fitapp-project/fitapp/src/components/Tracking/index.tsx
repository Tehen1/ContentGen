import { useEffect, useState, useRef } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useWeb3 } from '../../contexts/Web3Context';
import './styles.css';

interface TimerState {
  hours: number;
  minutes: number;
  seconds: number;
}

const Tracking = () => {
  const { 
    isTracking, 
    startTracking, 
    stopTracking, 
    trackingStats, 
    currentLocation 
  } = useSocket();
  const { walletState } = useWeb3();
  const [timerState, setTimerState] = useState<TimerState>({ hours: 0, minutes: 0, seconds: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);

  // Format distance
  const formatDistance = (meters: number): string => {
    return meters < 1000 
      ? `${meters.toFixed(0)} m` 
      : `${(meters / 1000).toFixed(2)} km`;
  };

  // Format time from milliseconds to HH:MM:SS
  const formatTime = (duration: number): string => {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':');
  };

  // Format speed
  const formatSpeed = (speed: number): string => {
    return `${speed.toFixed(1)} km/h`;
  };

  // Update timer every second when tracking
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTracking && trackingStats.startTime) {
      interval = setInterval(() => {
        const duration = Date.now() - trackingStats.startTime!;
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration / (1000 * 60)) % 60);
        const seconds = Math.floor((duration / 1000) % 60);
        
        setTimerState({ hours, minutes, seconds });
      }, 1000);
    } else {
      setTimerState({ hours: 0, minutes: 0, seconds: 0 });
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTracking, trackingStats.startTime]);

  // Initialize map when component mounts
  useEffect(() => {
    const initializeMap = async () => {
      try {
        // This is a placeholder for actual map initialization
        // In a real app, you would use Mapbox GL or Leaflet here
        console.log('Map would be initialized here with Mapbox or Leaflet');
        
        // Simulating map initialization
        setTimeout(() => {
          setIsMapReady(true);
        }, 1000);
        
        // If using Mapbox:
        // mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
        // const map = new mapboxgl.Map({
        //   container: mapContainerRef.current!,
        //   style: 'mapbox://styles/mapbox/streets-v11',
        //   center: [longitude, latitude],
        //   zoom: 15
        // });
        // mapInstanceRef.current = map;
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    if (mapContainerRef.current && !isMapReady) {
      initializeMap();
    }

    return () => {
      // Cleanup map instance if needed
      if (mapInstanceRef.current) {
        // mapInstanceRef.current.remove();
      }
    };
  }, []);

  // Update map when current location changes
  useEffect(() => {
    if (isMapReady && currentLocation && mapInstanceRef.current) {
      // Update map center to current location
      // mapInstanceRef.current.setCenter([currentLocation.lng, currentLocation.lat]);
      
      console.log('Map would be updated with location:', currentLocation);
    }
  }, [currentLocation, isMapReady]);

  // Handle start/stop tracking
  const handleTrackingToggle = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  return (
    <div className="tracking-container">
      <header className="tracking-header">
        <h1>Track Activity</h1>
        <div className="wallet-status">
          {walletState.connected ? (
            <span className="wallet-connected">Wallet Connected</span>
          ) : (
            <button className="connect-wallet-btn">Connect Wallet</button>
          )}
        </div>
      </header>

      <div className="map-container" ref={mapContainerRef}>
        {!isMapReady && <div className="map-loading">Loading map...</div>}
        {/* Map will be rendered here by the mapping library */}
      </div>

      <div className="tracking-stats">
        <div className="stat-item">
          <span className="stat-label">Time</span>
          <span className="stat-value">
            {`${timerState.hours.toString().padStart(2, '0')}:${timerState.minutes.toString().padStart(2, '0')}:${timerState.seconds.toString().padStart(2, '0')}`}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Distance</span>
          <span className="stat-value">{formatDistance(trackingStats.distance)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Speed</span>
          <span className="stat-value">{formatSpeed(trackingStats.averageSpeed)}</span>
        </div>
      </div>

      <div className="tracking-controls">
        <button 
          className={`tracking-button ${isTracking ? 'stop' : 'start'}`}
          onClick={handleTrackingToggle}
        >
          {isTracking ? 'Stop' : 'Start'} Tracking
        </button>
      </div>

      {isTracking && (
        <div className="tracking-rewards">
          <div className="reward-icon">🏅</div>
          <div className="reward-text">
            <p>You're earning FIT tokens!</p>
            <p>Current rate: 5 FIT / km</p>
          </div>
        </div>
      )}

      <section className="achievements-section">
        <h2>Achievements</h2>
        <div className="achievements-grid">
          <div className="achievement-card locked">
            <div className="achievement-icon">🏃‍♂️</div>
            <h3>First 5K</h3>
            <p>Complete your first 5 kilometer run</p>
            <div className="achievement-progress">
              <div className="progress-bar">
                <div className="progress" style={{ width: '60%' }}></div>
              </div>
              <span className="progress-text">3/5 km</span>
            </div>
          </div>
          
          <div className="achievement-card">
            <div className="achievement-icon">🥇</div>
            <h3>Early Bird</h3>
            <p>Complete a workout before 7 AM</p>
            <div className="achievement-status">Completed</div>
          </div>
          
          <div className="achievement-card locked">
            <div className="achievement-icon">🔥</div>
            <h3>Streak Master</h3>
            <p>Complete workouts for 7 days in a row</p>
            <div className="achievement-progress">
              <div className="progress-bar">
                <div className="progress" style={{ width: '40%' }}></div>
              </div>
              <span className="progress-text">3/7 days</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tracking;
