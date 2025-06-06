import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Header from '@/components/ui/Header';
import { Play, Pause, CircleStop as StopCircle, Bike, Sun as Run } from 'lucide-react-native';
import * as Location from 'expo-location';

// Platform-specific map imports
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;

// Only import react-native-maps on native platforms
if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    Polyline = Maps.Polyline;
  } catch (e) {
    console.warn('react-native-maps not available');
  }
}

interface Position {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export default function RecordScreen() {
  const { colors } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [activityType, setActivityType] = useState<'run' | 'bike'>('run');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [calories, setCalories] = useState(0);
  const [routeCoordinates, setRouteCoordinates] = useState<Position[]>([]);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [tokens, setTokens] = useState(0);
  const [nextMilestone, setNextMilestone] = useState(5);
  const [milestoneProgress, setMilestoneProgress] = useState(0);

  const mapRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const locationSubscription = useRef<any>();

  useEffect(() => {
    requestLocationPermission();
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const initialPosition = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: location.timestamp,
    };
    setCurrentPosition(initialPosition);
    setRouteCoordinates([initialPosition]);
  };

  const startRecording = async () => {
    setIsRecording(true);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 10,
      },
      location => {
        const newPosition = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp,
        };

        setCurrentPosition(newPosition);
        setRouteCoordinates(prev => [...prev, newPosition]);
        updateStats(newPosition);
      }
    );
  };

  const pauseRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }
  };

  const stopRecording = () => {
    pauseRecording();
    resetActivity();
  };

  const resetActivity = () => {
    setElapsedTime(0);
    setDistance(0);
    setSpeed(0);
    setCalories(0);
    setRouteCoordinates([]);
    setTokens(0);
    setMilestoneProgress(0);
  };

  const updateStats = (newPosition: Position) => {
    if (routeCoordinates.length > 0) {
      const lastPosition = routeCoordinates[routeCoordinates.length - 1];
      const newDistance = calculateDistance(lastPosition, newPosition);
      const newSpeed = calculateSpeed(newDistance, newPosition.timestamp - lastPosition.timestamp);
      
      setDistance(prev => prev + newDistance);
      setSpeed(newSpeed);
      setCalories(prev => prev + calculateCalories(newDistance, activityType));
      updateTokens(newDistance);
    }
  };

  const calculateDistance = (pos1: Position, pos2: Position): number => {
    const R = 6371e3;
    const φ1 = (pos1.latitude * Math.PI) / 180;
    const φ2 = (pos2.latitude * Math.PI) / 180;
    const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
    const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return (R * c) / 1000;
  };

  const calculateSpeed = (distance: number, time: number): number => {
    return (distance / (time / 3600000));
  };

  const calculateCalories = (distance: number, type: string): number => {
    const MET = type === 'run' ? 8 : 6;
    const weight = 70;
    return MET * weight * (distance / 5);
  };

  const updateTokens = (newDistance: number) => {
    const totalDistance = distance + newDistance;
    if (totalDistance >= nextMilestone) {
      setTokens(prev => prev + 5);
      setNextMilestone(prev => prev + 5);
    }
    setMilestoneProgress((totalDistance % 5) / 5 * 100);
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const MapSection = Platform.select({
    web: () => (
      <View style={[styles.mapContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.mapPlaceholder, { color: colors.text }]}>
          Map view is only available on mobile devices
        </Text>
      </View>
    ),
    default: () => {
      if (!MapView || !currentPosition) return null;
      
      return (
        <View style={[styles.mapContainer, { backgroundColor: colors.card }]}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: currentPosition.latitude,
              longitude: currentPosition.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            {currentPosition && (
              <Marker
                coordinate={{
                  latitude: currentPosition.latitude,
                  longitude: currentPosition.longitude,
                }}
              />
            )}
            {routeCoordinates.length > 1 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor={colors.primary}
                strokeWidth={3}
              />
            )}
          </MapView>
        </View>
      );
    }
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Record Activity" />
      
      <ScrollView style={styles.content}>
        <View style={[styles.modeSelector, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              activityType === 'run' && { backgroundColor: colors.primary }
            ]}
            onPress={() => setActivityType('run')}
          >
            <Run size={24} color={activityType === 'run' ? colors.white : colors.text} />
            <Text style={[
              styles.modeText,
              { color: activityType === 'run' ? colors.white : colors.text }
            ]}>Run</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.modeButton,
              activityType === 'bike' && { backgroundColor: colors.primary }
            ]}
            onPress={() => setActivityType('bike')}
          >
            <Bike size={24} color={activityType === 'bike' ? colors.white : colors.text} />
            <Text style={[
              styles.modeText,
              { color: activityType === 'bike' ? colors.white : colors.text }
            ]}>Bike</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.timerCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.timer, { color: colors.text }]}>
            {formatTime(elapsedTime)}
          </Text>
          <Text style={[styles.timerLabel, { color: colors.secondaryText }]}>
            Duration
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {distance.toFixed(2)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
              Distance (km)
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {speed.toFixed(1)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
              Speed (km/h)
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {calories.toFixed(0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
              Calories
            </Text>
          </View>
        </View>

        <View style={[styles.tokenCard, { backgroundColor: colors.card }]}>
          <View style={styles.tokenHeader}>
            <Text style={[styles.tokenTitle, { color: colors.text }]}>
              $FIXIE Tokens
            </Text>
            <Text style={[styles.tokenValue, { color: colors.primary }]}>
              {tokens}
            </Text>
          </View>
          
          <View style={styles.milestoneContainer}>
            <Text style={[styles.milestoneText, { color: colors.secondaryText }]}>
              Next reward at {nextMilestone}km
            </Text>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${milestoneProgress}%`
                  }
                ]}
              />
            </View>
          </View>
        </View>

        {Platform.OS !== 'web' && <MapSection />}
      </ScrollView>

      <View style={[styles.controls, { backgroundColor: colors.card }]}>
        {!isRecording ? (
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.primary }]}
            onPress={startRecording}
          >
            <Play size={24} color={colors.white} />
            <Text style={[styles.buttonText, { color: colors.white }]}>
              Start {activityType === 'run' ? 'Run' : 'Ride'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControls}>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.error }]}
              onPress={stopRecording}
            >
              <StopCircle size={24} color={colors.white} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.primary }]}
              onPress={pauseRecording}
            >
              <Pause size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  modeSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  modeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  timerCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  timer: {
    fontFamily: 'Inter-Bold',
    fontSize: 48,
  },
  timerLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  tokenCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tokenTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  tokenValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  milestoneContainer: {
    gap: 8,
  },
  milestoneText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  controls: {
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  controlButton: {
    padding: 16,
    borderRadius: 12,
  },
});