import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

// Type definitions
type LocationData = {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number | null;
    speed: number | null;
  };
  timestamp: number;
};

type TrackingResult = {
  distance: number;
  averageSpeed: number;
  duration: number;
  path: LocationData[];
};

// Calculate distance between two coordinates using the Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const useLocationTracking = () => {
  // State for tracking status and metrics
  const [isTracking, setIsTracking] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Refs to store location data and interval IDs
  const locationHistory = useRef<LocationData[]>([]);
  const startTime = useRef<number | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Request location permissions
  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to track your activities. Please enable location services.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      setHasPermission(true);
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };
  
  // Start tracking location
  const startTracking = async (): Promise<boolean> => {
    // Check if we already have permission, if not request it
    if (!hasPermission) {
      const granted = await requestPermissions();
      if (!granted) return false;
    }
    
    try {
      // Configure location tracking
      
      // Clear previous data
      locationHistory.current = [];
      setDistance(0);
      setSpeed(0);
      
      // Start time tracking
      startTime.current = Date.now();
      
      // Start duration timer
      durationInterval.current = setInterval(() => {
        if (startTime.current) {
          const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
          setDuration(elapsed);
        }
      }, 1000);
      
      // Start location tracking
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1, // update every 1 meter
        },
        (location) => {
          const newLocation: LocationData = {
            coords: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              altitude: location.coords.altitude,
              accuracy: location.coords.accuracy,
              speed: location.coords.speed,
            },
            timestamp: location.timestamp
          };
          
          // Update speed from GPS if available
          if (location.coords.speed !== null) {
            // Convert m/s to km/h
            setSpeed(location.coords.speed * 3.6);
          }
          
          // Calculate distance if we have at least two points
          if (locationHistory.current.length > 0) {
            const prevLocation = locationHistory.current[locationHistory.current.length - 1];
            const segmentDistance = calculateDistance(
              prevLocation.coords.latitude,
              prevLocation.coords.longitude,
              location.coords.latitude,
              location.coords.longitude
            );
            
            // Only add distance if we've moved at least 1 meter to avoid GPS jitter
            if (segmentDistance > 0.001) {
              setDistance((prev) => prev + segmentDistance);
            }
          }
          
          // Add to history
          locationHistory.current.push(newLocation);
        }
      );
      
      setIsTracking(true);
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Error', 'Failed to start location tracking');
      return false;
    }
  };
  
  // Stop tracking and return results
  const stopTracking = (): TrackingResult => {
    // Stop location tracking
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    
    // Stop duration timer
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
    
    // Calculate average speed
    const averageSpeed = duration > 0 ? (distance / (duration / 3600)) : 0;
    
    setIsTracking(false);
    
    return {
      distance,
      averageSpeed,
      duration,
      path: [...locationHistory.current]
    };
  };
  
  // Reset tracking data
  const resetTracking = () => {
    locationHistory.current = [];
    startTime.current = null;
    setDistance(0);
    setSpeed(0);
    setDuration(0);
  };
  
  // Check permission on mount
  useEffect(() => {
    requestPermissions();
    
    // Cleanup on unmount
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);
  
  return {
    isTracking,
    hasPermission,
    distance,
    speed,
    duration,
    startTracking,
    stopTracking,
    resetTracking,
  };
};

