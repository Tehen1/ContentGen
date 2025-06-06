import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Ionicons } from '@expo/vector-icons';

// Constants
const LOCATION_TRACKING = 'location-tracking';
const COLORS = {
  primary: '#5D5CDE',
  neonCyan: '#00ffff',
  neonPink: '#ff00ff',
  neonPurple: '#9d00ff',
  neonGreen: '#00ff9d',
  darkBg: '#181818',
  darkCard: '#232323',
  darkSurface: '#2a2a2a',
  white: '#FFFFFF',
  gray: '#888888'
};

// Define the task for background location tracking
TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
  if (error) {
    console.error("Location tracking task error:", error);
    return;
  }
  if (data) {
    const { locations } = data;
    if (locations && locations.length > 0) {
      // Process the locations data here
      console.log("Received background location:", locations);
    }
  }
});

export default function App() {
  // State variables
  const [locationPermission, setLocationPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [activityType, setActivityType] = useState('Run'); // 'Run' or 'Bike'
  const [currentLocation, setCurrentLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [calories, setCalories] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  
  // References
  const locationSubscription = useRef(null);
  const timerInterval = useRef(null);
  const lastLocation = useRef(null);
  
  // Request location permissions
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permission Denied",
          "Location access is required to track your activities.",
          [{ text: "OK" }]
        );
        setLoading(false);
        return;
      }
      
      setLocationPermission(true);
      setLoading(false);
    })();
    
    return () => {
      stopTracking();
    };
  }, []);
  
  // Timer update function
  useEffect(() => {
    if (isTracking && startTime) {
      timerInterval.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [isTracking, startTime]);
  
  // Calculate distance between two locations
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };
  
  // Format time as MM:SS or HH:MM:SS
  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds) return "00:00";
    
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Start tracking the activity
  const startTracking = async () => {
    if (!locationPermission) {
      Alert.alert("Permission Required", "Location permission is needed to track your activities.");
      return;
    }
    
    try {
      // Configure background location updates
      await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 10000, // Update every 10 seconds
        distanceInterval: 10, // Update every 10 meters
        foregroundService: {
          notificationTitle: "FixieRun is tracking your location",
          notificationBody: "We're recording your activity for the best experience.",
        },
      });
      
      // Start foreground location tracking
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Update every 1 second
          distanceInterval: 5, // Update every 5 meters
        },
        (location) => {
          setCurrentLocation(location.coords);
          
          // Calculate distance if we have previous location
          if (lastLocation.current) {
            const newDistance = calculateDistance(
              lastLocation.current.latitude,
              lastLocation.current.longitude,
              location.coords.latitude,
              location.coords.longitude
            );
            
            // Update total distance (convert to km)
            setDistance(prevDistance => {
              const updatedDistance = prevDistance + newDistance;
              
              // Calculate earned tokens based on distance (0.5 token per km)
              const newTokens = newDistance * 0.5;
              setTokenBalance(prev => prev + newTokens);
              
              // Calculate calories based on activity type
              const caloriesFactor = activityType === 'Run' ? 60 : 30; // Per km
              const newCalories = newDistance * caloriesFactor;
              setCalories(prev => prev + newCalories);
              
              return updatedDistance;
            });
          }
          
          // Update speed (convert from m/s to km/h)
          if (location.coords.speed >= 0) {
            setSpeed(location.coords.speed * 3.6);
          }
          
          // Save current location for next calculation
          lastLocation.current = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp
          };
        }
      );
      
      // Set tracking state
      setIsTracking(true);
      setStartTime(new Date());
      
    } catch (error) {
      console.error("Error starting location tracking:", error);
      Alert.alert("Error", "Failed to start tracking. Please try again.");
    }
  };
  
  // Stop tracking the activity
  const stopTracking = async () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    
    try {
      const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING);
      if (isTracking) {
        await Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
      }
    } catch (error) {
      console.error("Error stopping location tracking:", error);
    }
    
    // Save activity data (in a real app, this would be sent to a server)
    if (distance > 0) {
      // Show activity summary or save to history
      Alert.alert(
        "Activity Complete",
        `Congratulations! You earned ${(distance * 0.5).toFixed(2)} $FIXIE tokens.`,
        [{ text: "OK" }]
      );
    }
    
    // Reset tracking state
    setIsTracking(false);
    setStartTime(null);
    setElapsedTime(0);
    setDistance(0);
    setSpeed(0);
    setCalories(0);
    lastLocation.current = null;
  };
  
  // Toggle activity type
  const toggleActivityType = () => {
    if (!isTracking) {
      setActivityType(activityType === 'Run' ? 'Bike' : 'Run');
    } else {
      Alert.alert("Cannot Change", "You cannot change activity type while tracking.");
    }
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Setting up FixieRun...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
