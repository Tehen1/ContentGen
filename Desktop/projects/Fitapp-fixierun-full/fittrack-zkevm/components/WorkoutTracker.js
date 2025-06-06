import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Typography, Space, Select, Tag, Statistic, Row, Col, Progress, Alert, Modal, Form, Input, Spin, notification, Divider } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ClockCircleOutlined, EnvironmentOutlined, AimOutlined, FireOutlined, SaveOutlined, CloseCircleOutlined, ThunderboltOutlined, TrophyOutlined } from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { useFitTracker } from '../hooks/useFitTracker';
import { 
  WORKOUT_TYPES, 
  CALORIE_RATES, 
  calculateDistance, 
  encodeRoute, 
  isOutdoorWorkout, 
  formatDuration, 
  estimateCalories, 
  calculatePace, 
  calculateSpeed, 
  generateWorkoutSummary 
} from '../lib/fitness-utils';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Using WORKOUT_TYPES imported from fitness-utils.js

// Map workout types to icons and colors
const workoutTypeConfig = {
  [WORKOUT_TYPES.RUNNING]: { icon: <ThunderboltOutlined />, color: '#1890ff' },
  [WORKOUT_TYPES.WALKING]: { icon: <EnvironmentOutlined />, color: '#52c41a' },
  [WORKOUT_TYPES.CYCLING]: { icon: <AimOutlined />, color: '#722ed1' },
  [WORKOUT_TYPES.SWIMMING]: { icon: <ClockCircleOutlined />, color: '#13c2c2' },
  [WORKOUT_TYPES.GYM]: { icon: <FireOutlined />, color: '#fa8c16' },
  [WORKOUT_TYPES.YOGA]: { icon: <ClockCircleOutlined />, color: '#eb2f96' },
  [WORKOUT_TYPES.OTHER]: { icon: <ClockCircleOutlined />, color: '#8c8c8c' },
};

// Using CALORIE_RATES imported from fitness-utils.js

// Animation for active workout
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
  }
`;

// Styled component for pulse animation
const PulseContainer = styled.div`
  animation: ${props => props.active ? `${pulse} 2s infinite` : 'none'};
`;

// Confetti animation for workout completion
const confettiAnimation = keyframes`
  0% { transform: translateY(0) rotate(0); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
`;

const CompletionAnimation = styled.div`
  position: relative;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  
  .confetti {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: #f0f;
    opacity: 0.7;
    animation: ${confettiAnimation} 3s ease-in-out forwards;
  }
  
  .trophy {
    font-size: 80px;
    color: gold;
    animation: ${pulse} 1.5s infinite;
  }
`;

// Styled component for the route map
const RouteMapContainer = styled.div`
  height: 200px;
  width: 100%;
  background-color: #f0f2f5;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// Generate confetti pieces randomly
const generateConfetti = () => {
  const confetti = [];
  const colors = ['#1890ff', '#52c41a', '#fa8c16', '#f5222d', '#722ed1', '#eb2f96'];
  
  for (let i = 0; i < 50; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = `${Math.random() * 100}%`;
    const animationDelay = `${Math.random() * 3}s`;
    
    confetti.push(
      <div 
        key={i}
        className="confetti"
        style={{
          left,
          backgroundColor: color,
          animationDelay,
        }}
      />
    );
  }
  
  return confetti;
};

const WorkoutTracker = ({ onWorkoutComplete, contractAddress }) => {
  // Workout state
  const [workoutType, setWorkoutType] = useState(WORKOUT_TYPES.RUNNING);
  const [isTracking, setIsTracking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [route, setRoute] = useState([]);
  const [watchId, setWatchId] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  
  // Form for workout notes
  const [form] = Form.useForm();
  const [notes, setNotes] = useState('');
  
  // References
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const mapRef = useRef(null);
  
  // FitTracker hook
  const { 
    isConnected, 
    userAddress, 
    addWorkout, 
    loading, 
    error 
  } = useFitTracker({
    contractAddress,
    autoConnect: true,
  });

  // Check if geolocation is available
  useEffect(() => {
    if (navigator.geolocation) {
      setLocationEnabled(true);
    } else {
      setLocationEnabled(false);
    }
  }, []);

  // Track duration when active
  useEffect(() => {
    if (isTracking) {
      startTimeRef.current = Date.now() - (duration * 1000);
      timerRef.current = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsedSeconds);
        
        // Update estimated calories using the utility function
        const estimatedCalories = estimateCalories(workoutType, elapsedSeconds);
        setCalories(estimatedCalories);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTracking, workoutType]);

  // Start tracking workout
  const startTracking = () => {
    setIsTracking(true);
    
    // Reset values
    setDuration(0);
    setDistance(0);
    setCalories(0);
    setRoute([]);
    
    // Start GPS tracking for outdoor activities
    if (locationEnabled && isOutdoorWorkout(workoutType)) {
      startGpsTracking();
    }
    
    notification.success({
      message: 'Workout Started',
      description: `Your ${workoutType} workout has begun. Go for it!`,
      placement: 'topRight',
    });
  };

  // Pause/resume tracking
  const toggleTracking = () => {
    setIsTracking(!isTracking);
    
    if (!isTracking) {
      // Resume tracking
      if (locationEnabled && isOutdoorWorkout(workoutType)) {
        startGpsTracking();
      }
    } else {
      // Pause tracking
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
    }
  };

  // Complete workout
  const completeWorkout = () => {
    setIsTracking(false);
    
    // Stop GPS tracking
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    // Show completion animation
    setShowCompletionAnimation(true);
    
    // After animation, show workout summary
    setTimeout(() => {
      setShowCompletionAnimation(false);
      setShowSummary(true);
    }, 3000);
  };

  // Show save modal
  const showSaveModal = () => {
    form.setFieldsValue({ notes: '' });
    setSaveModalVisible(true);
  };

  // Discard current workout
  const discardWorkout = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    setIsTracking(false);
    setDuration(0);
    setDistance(0);
    setCalories(0);
    setRoute([]);
    setShowSummary(false);
    
    notification.info({
      message: 'Workout Discarded',
      description: 'Your workout session has been discarded.',
      placement: 'topRight',
    });
  };

  // Save workout to blockchain
  const saveWorkout = async () => {
    if (!isConnected) {
      notification.error({
        message: 'Wallet Not Connected',
        description: 'Please connect your wallet to save workouts.',
        placement: 'topRight',
      });
      return;
    }
    
    try {
      const formValues = await form.validateFields();
      setNotes(formValues.notes || '');
      
      // Prepare metadata with route information if available
      const metadata = JSON.stringify({
        notes: formValues.notes || '',
        distance: distance.toFixed(2),
        route: route.length > 0 ? encodeRoute(route) : null,
        timestamp: Date.now()
      });
      
      // Add workout to blockchain
      await addWorkout(workoutType, duration, calories, metadata);
      
      notification.success({
        message: 'Workout Saved',
        description: 'Your workout has been saved to the blockchain successfully.',
        placement: 'topRight',
      });
      
      // Pass workout data to parent component with summary data
      if (onWorkoutComplete) {
        const workoutData = {
          workoutType,
          duration,
          distance,
          calories,
          route,
          notes: formValues.notes || ''
        };
        // Generate complete summary with additional stats
        const summary = generateWorkoutSummary(workoutData);
        onWorkoutComplete(summary);
      }
      
      // Reset state
      setShowSummary(false);
      setSaveModalVisible(false);
      setNotes('');
      
    } catch (err) {
      notification.error({
        message: 'Error Saving Workout',
        description: err instanceof Error ? err.message : 'Unknown error occurred.',
        placement: 'topRight',
      });
    }
  };

  // Start GPS tracking
  const startGpsTracking = () => {
    if (!navigator.geolocation) return;
    
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPosition = { lat: latitude, lng: longitude };
        
        setRoute(prevRoute => {
          const newRoute = [...prevRoute, newPosition];
          
          // Calculate distance if we have at least two points
          if (newRoute.length > 1) {
            const lastPoint = prevRoute[prevRoute.length - 1];
            const newDistance = calculateDistance(
              lastPoint.lat, lastPoint.lng,
              latitude, longitude
            );
            setDistance(prevDistance => prevDistance + newDistance);
            
            // Calculate current speed (km/h)
            if (position.coords.speed) {
              // Convert m/s to km/h
              setCurrentSpeed(position.coords.speed * 3.6);
            } else if (prevRoute.length > 1 && duration > 0) {
              // Fallback: estimate speed from distance and time using utility function
              const avgSpeed = calculateSpeed(distance, duration);
              setCurrentSpeed(avgSpeed);
            }
          }
          
          return newRoute;
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        notification.warning({
          message: 'GPS Tracking Issue',
          description: `Location tracking error: ${error.message}`,
          placement: 'topRight',
        });
      },
      { 
        enableHighAccuracy: true, 
        maximumAge: 1000, 
        timeout: 10000 
      }
    );
    
    setWatchId(id);
  };

  // Using calculateDistance imported from fitness-utils.js

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Typography, Space, Select, Tag, Statistic, Row, Col, Progress, Alert, Modal, Form, Input, Spin, notification, Divider } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ClockCircleOutlined, EnvironmentOutlined, AimOutlined, FireOutlined, SaveOutlined, CloseCircleOutlined, ThunderboltOutlined, TrophyOutlined } from '@ant-design/icons';
import { useFitTracker } from '../hooks/useFitTracker';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Styled components for animations
const PulseContainer = styled.div`
  animation: ${props => props.active ? 'pulse 1.2s infinite' : 'none'};
  
  @keyframes pulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.7);
    }
    
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
    }
    
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
    }
  }
`;

const RouteMapContainer = styled.div`
  height: 200px;
  background-color: #f0f2f5;
  border-radius: 4px;
  margin: 16px 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CompletionAnimation = styled.div`
  position: relative;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  
  .confetti {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: #f0f;
    border-radius: 50%;
    animation: confetti-fall 5s ease-out forwards;
  }
  
  .trophy {
    animation: trophy-appear 1s ease-out forwards;
    transform: scale(0);
    font-size: 72px;
    color: gold;
  }
  
  @keyframes confetti-fall {
    0% {
      transform: translateY(-100px) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(200px) rotate(720deg);
      opacity: 0;
    }
  }
  
  @keyframes trophy-appear {
    0% {
      transform: scale(0) rotate(-10deg);
    }
    60% {
      transform: scale(1.2) rotate(5deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }
`;

// Using WORKOUT_TYPES imported from fitness-utils.js

// Map workout types to icons and colors
const workoutTypeConfig = {
  [WORKOUT_TYPES.RUNNING]: { icon: <ThunderboltOutlined />, color: '#1890ff' },
  [WORKOUT_TYPES.WALKING]: { icon: <EnvironmentOutlined />, color: '#52c41a' },
  [WORKOUT_TYPES.CYCLING]: { icon: <AimOutlined />, color: '#722ed1' },
  [WORKOUT_TYPES.SWIMMING]: { icon: <ClockCircleOutlined />, color: '#13c2c2' },
  [WORKOUT_TYPES.GYM]: { icon: <FireOutlined />, color: '#fa8c16' },
  [WORKOUT_TYPES.YOGA]: { icon: <ClockCircleOutlined />, color: '#eb2f96' },
  [WORKOUT_TYPES.OTHER]: { icon: <ClockCircleOutlined />, color: '#8c8c8c' },
};

// Using CALORIE_RATES imported from fitness-utils.js

const WorkoutTracker = ({ onWorkoutComplete, contractAddress }) => {
  // Workout state
  const [workoutType, setWorkoutType] = useState(WORKOUT_TYPES.RUNNING);
  const [isTracking, setIsTracking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [route, setRoute] = useState([]);
  const [watchId, setWatchId] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [form] = Form.useForm();
  
  // References for timers
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const mapRef = useRef(null);
  
  // FitTracker hook for blockchain integration
  const { 
    isConnected, 
    userAddress, 
    addWorkout, 
    loading, 
    error 
  } = useFitTracker({
    contractAddress,
    autoConnect: true,
  });

  // Check if geolocation is available
  useEffect(() => {
    if (navigator.geolocation) {
      setLocationEnabled(true);
      
      // Request permission for location
      navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
        if (permissionStatus.state === 'granted') {
          setLocationEnabled(true);
        } else {
          setLocationEnabled(false);
        }
        
        permissionStatus.onchange = () => {
          setLocationEnabled(permissionStatus.state === 'granted');
        };
      });
    } else {
      setLocationEnabled(false);
    }
  }, []);

  // Track duration when active
  useEffect(() => {
    if (isTracking) {
      startTimeRef.current = Date.now() - (duration * 1000);
      timerRef.current = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsedSeconds);
        
        // Update estimated calories
        // Update estimated calories using the utility function
        const estimatedCalories = estimateCalories(workoutType, elapsedSeconds);
        setCalories(estimatedCalories);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTracking, workoutType]);

  // Initialize map when element is rendered and route changes
  useEffect(() => {
    if (mapRef.current && route.length > 0 && window.google && window.google.maps) {
      renderRouteOnMap();
    }
  }, [route]);

  // Render route on map
  const renderRouteOnMap = () => {
    if (!window.google || !window.google.maps) return;
    
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 15,
      center: route[route.length - 1],
      mapTypeId: 'terrain'
    });
    
    const path = new window.google.maps.Polyline({
      path: route,
      geodesic: true,
      strokeColor: workoutTypeConfig[workoutType].color,
      strokeOpacity: 1.0,
      strokeWeight: 4
    });
    
    path.setMap(map);
    
    // Add marker for current position
    if (route.length > 0) {
      new window.google.maps.Marker({
        position: route[route.length - 1],
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: workoutTypeConfig[workoutType].color,
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: 'white'
        }
      });
    }
  };

  // Generate confetti elements for completion animation
  const generateConfetti = () => {
    const colors = ['#1890ff', '#52c41a', '#fa8c16', '#f5222d', '#722ed1'];
    return Array.from({ length: 50 }).map((_, i) => {
      const left = `${Math.random() * 100}%`;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const delay = `${Math.random() * 2}s`;
      const duration = `${3 + Math.random() * 2}s`;
      
      return (
        <div 
          key={i}
          className="confetti" 
          style={{ 
            left, 
            backgroundColor: color, 
            animationDelay: delay,
            animationDuration: duration
          }} 
        />
      );
    });
  };

  // Start tracking workout
  const startTracking = () => {
    setIsTracking(true);
    
    // Reset values
    setDuration(0);
    setDistance(0);
    setCalories(0);
    setRoute([]);
    
    // Start GPS tracking for outdoor activities
    if (locationEnabled && isOutdoorWorkout(workoutType)) {
      startGpsTracking();
    }
    
    notification.success({
      message: 'Workout Started',
      description: `Your ${workoutType} workout has begun. Go for it!`,
      placement: 'topRight',
      icon: <PlayCircleOutlined style={{ color: workoutTypeConfig[workoutType].color }} />
    });
  };

  // Pause/resume tracking
  const toggleTracking = () => {
    setIsTracking(!isTracking);
    
    if (!isTracking) {
      // Resume tracking
      if (locationEnabled && isOutdoorWorkout(workoutType)) {
        startGpsTracking();
      }
      
      notification.info({
        message: 'Workout Resumed',
        description: 'Your workout tracking has been resumed.',
        placement: 'topRight',
      });
    } else {
      // Pause tracking
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      
      notification.info({
        message: 'Workout Paused',
        description: 'Your workout tracking has been paused.',
        placement: 'topRight',
      });
    }
  };

  // Complete workout
  const completeWorkout = () => {
    setIsTracking(false);
    
    // Stop GPS tracking
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    // Show animation
    setShowCompletionAnimation(true);
    
    // After animation, show summary
    setTimeout(() => {
      setShowCompletionAnimation(false);
      setShowSummary(true);
    }, 3000);
  };

  // Discard current workout
  const discardWorkout = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    setIsTracking(false);
    setDuration(0);
    setDistance(0);
    setCalories(0);
    setRoute([]);
    setShowSummary(false);
    
    notification.info({
      message: 'Workout Discarded',
      description: 'Your workout session has been discarded.',
      placement: 'topRight',
      icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
    });
  };

  // Show save modal
  const showSaveModal = () => {
    setSaveModalVisible(true);
    form.setFieldsValue({ notes: '' });
  };

  // Save workout to blockchain
  const saveWorkout = async () => {
    form.validateFields().then(async (values) => {
      if (!isConnected) {
        notification.error({
          message: 'Wallet Not Connected',
          description: 'Please connect your wallet to save workouts.',
          placement: 'topRight',
        });
        return;
      }
      
      try {
        // Prepare metadata with route information if available
        const metadata = JSON.stringify({
          notes: values.notes,
          distance: distance.toFixed(2),
          route: route.length > 0 ? encodeRoute(route) : null,
          timestamp: Date.now()
        });
        
        // Add workout to blockchain
        await addWorkout(workoutType, duration, calories, metadata);
        
        notification.success({
          message: 'Workout Saved',
          description: 'Your workout has been saved to the blockchain successfully.',
          placement: 'topRight',
          icon: <SaveOutlined style={{ color: '#52c41a' }} />
        });
        
        // Pass workout data to parent component with summary data
        if (onWorkoutComplete) {
          const workoutData = {
            workoutType,
            duration,
            distance,
            calories,
            route,
            notes: values.notes || ''
          };
          // Generate complete summary with additional stats
          const summary = generateWorkoutSummary(workoutData);
          onWorkoutComplete(summary);
        }
        
        // Reset state
        setShowSummary(false);
        setSaveModalVisible(false);
        setNotes('');
        
      } catch (err) {
        notification.error({
          message: 'Error Saving Workout',
          description: err instanceof Error ? err.message : 'Unknown error occurred.',
          placement: 'topRight',
        });
      }
    });
  };

  // Start GPS tracking
  const startGpsTracking = () => {

