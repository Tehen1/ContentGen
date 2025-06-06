import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define types for location data
export interface LocationData {
  userId: string;
  lat: number;
  lng: number;
  timestamp: number;
  speed?: number;
  altitude?: number;
  accuracy?: number;
}

// Define types for location update
export interface LocationUpdate {
  type: 'position';
  userId: string;
  lat: number;
  lng: number;
  timestamp: number;
  speed?: number;
  altitude?: number;
  accuracy?: number;
}

// Define types for the event message from the server
export interface SocketMessage {
  type: string;
  data: any;
}

// Define the shape of our Socket context
interface SocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  userLocations: Map<string, LocationData>;
  currentLocation: LocationData | null;
  sendPosition: (lat: number, lng: number, speed?: number, altitude?: number, accuracy?: number) => void;
  startTracking: () => void;
  stopTracking: () => void;
  isTracking: boolean;
  trackingStats: {
    distance: number;
    duration: number;
    averageSpeed: number;
    startTime: number | null;
  };
  clearStats: () => void;
}

// Create context with default values
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  userLocations: new Map(),
  currentLocation: null,
  sendPosition: () => {},
  startTracking: () => {},
  stopTracking: () => {},
  isTracking: false,
  trackingStats: {
    distance: 0,
    duration: 0,
    averageSpeed: 0,
    startTime: null,
  },
  clearStats: () => {},
});

interface SocketProviderProps {
  children: ReactNode;
  userId?: string;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ 
  children, 
  userId = `user-${Math.floor(Math.random() * 1000000)}` 
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [userLocations, setUserLocations] = useState<Map<string, LocationData>>(new Map());
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [trackingStats, setTrackingStats] = useState({
    distance: 0,
    duration: 0,
    averageSpeed: 0,
    startTime: null as number | null,
    points: [] as LocationData[],
  });

  // Initialize WebSocket connection
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_WS_SERVER || 'ws://localhost:3001';
    const ws = new WebSocket(socketUrl);

    // Set up event handlers
    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleSocketMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(ws);

    // Clean up on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // Handle incoming socket messages
  const handleSocketMessage = (message: SocketMessage) => {
    if (message.type === 'position') {
      const locationData = message.data as LocationData;
      
      // Update user locations map
      setUserLocations((prev) => {
        const newMap = new Map(prev);
        newMap.set(locationData.userId, locationData);
        return newMap;
      });
    }
  };

  // Send position update to WebSocket server
  const sendPosition = (
    lat: number, 
    lng: number, 
    speed?: number, 
    altitude?: number, 
    accuracy?: number
  ) => {
    if (socket && isConnected) {
      const timestamp = Date.now();
      const locationUpdate: LocationUpdate = {
        type: 'position',
        userId,
        lat,
        lng,
        timestamp,
        speed,
        altitude,
        accuracy,
      };

      const locationData: LocationData = {
        userId,
        lat,
        lng,
        timestamp,
        speed,
        altitude,
        accuracy,
      };

      // Update current location
      setCurrentLocation(locationData);

      // If tracking, add to tracking points and update stats
      if (isTracking) {
        setTrackingStats((prev) => {
          const newPoints = [...prev.points, locationData];
          
          // Calculate new stats
          const newStats = calculateTrackingStats(
            newPoints, 
            prev.startTime || timestamp
          );
          
          return {
            ...newStats,
            points: newPoints,
          };
        });
      }

      // Send to server
      socket.send(JSON.stringify(locationUpdate));
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  };

  // Calculate total distance from array of location points
  const calculateTotalDistance = (points: LocationData[]): number => {
    if (points.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      totalDistance += calculateDistance(
        prevPoint.lat, 
        prevPoint.lng, 
        currentPoint.lat, 
        currentPoint.lng
      );
    }

    return totalDistance;
  };

  // Calculate tracking stats based on points and start time
  const calculateTrackingStats = (points: LocationData[], startTime: number) => {
    const distance = calculateTotalDistance(points);
    const duration = Date.now() - startTime;
    const durationInHours = duration / (1000 * 60 * 60);
    const averageSpeed = distance > 0 && durationInHours > 0 
      ? distance / 1000 / durationInHours // Convert to km/h
      : 0;

    return {
      distance,
      duration,
      averageSpeed,
      startTime,
      points,
    };
  };

  // Start location tracking
  const startTracking = () => {
    if (navigator.geolocation && !isTracking) {
      // Reset tracking stats and start recording
      const startTime = Date.now();
      setTrackingStats({
        distance: 0,
        duration: 0,
        averageSpeed: 0,
        startTime,
        points: [],
      });

      // Set tracking flag
      setIsTracking(true);

      // Start watching position
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, altitude, speed, accuracy } = position.coords;
          
          // Send position to WebSocket server
          sendPosition(latitude, longitude, speed || undefined, altitude || undefined, accuracy);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );

      // Save watch ID for later cleanup
      setWatchId(id);
    }
  };

  // Stop location tracking
  const stopTracking = () => {
    // Stop watching position
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    // Update tracking flag
    setIsTracking(false);
  };

  // Clear tracking stats
  const clearStats = () => {
    setTrackingStats({
      distance: 0,
      duration: 0,
      averageSpeed: 0,
      startTime: null,
      points: [],
    });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        userLocations,
        currentLocation,
        sendPosition,
        startTracking,
        stopTracking,
        isTracking,
        trackingStats: {
          distance: trackingStats.distance,
          duration: trackingStats.duration,
          averageSpeed: trackingStats.averageSpeed,
          startTime: trackingStats.startTime,
        },
        clearStats,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the Socket context
export const useSocket = () => useContext(SocketContext);

export default SocketContext;

