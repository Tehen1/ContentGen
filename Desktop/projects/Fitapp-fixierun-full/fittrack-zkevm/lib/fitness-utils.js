/**
 * Utility functions for fitness tracking features
 */

// Workout types constants (should match the ones used in components)
export const WORKOUT_TYPES = {
  RUNNING: 'Running',
  WALKING: 'Walking',
  CYCLING: 'Cycling',
  SWIMMING: 'Swimming',
  GYM: 'Gym Workout',
  YOGA: 'Yoga',
  OTHER: 'Other'
};

// Estimated calorie burn rates per minute by workout type (rough estimates)
export const CALORIE_RATES = {
  [WORKOUT_TYPES.RUNNING]: 10, // ~600 calories per hour
  [WORKOUT_TYPES.WALKING]: 4,  // ~240 calories per hour
  [WORKOUT_TYPES.CYCLING]: 8,  // ~480 calories per hour
  [WORKOUT_TYPES.SWIMMING]: 11, // ~660 calories per hour
  [WORKOUT_TYPES.GYM]: 7,      // ~420 calories per hour
  [WORKOUT_TYPES.YOGA]: 3,     // ~180 calories per hour
  [WORKOUT_TYPES.OTHER]: 5,    // ~300 calories per hour
};

/**
 * Calculate distance between two points using Haversine formula
 * 
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

/**
 * Encode/simplify route data for storage efficiency
 * 
 * @param {Array} routeData - Array of lat/lng coordinates
 * @returns {Array} Simplified route data
 */
export const encodeRoute = (routeData) => {
  // For privacy and storage efficiency, sample the route
  // Take points at regular intervals if route is very long
  if (routeData.length > 100) {
    const sampledRoute = [];
    const interval = Math.ceil(routeData.length / 100);
    
    for (let i = 0; i < routeData.length; i += interval) {
      sampledRoute.push(routeData[i]);
    }
    
    return sampledRoute;
  }
  
  return routeData;
};

/**
 * Check if workout type is outdoor (needs GPS)
 * 
 * @param {string} workoutType - Type of workout
 * @returns {boolean} True if workout is outdoor
 */
export const isOutdoorWorkout = (workoutType) => {
  return [
    WORKOUT_TYPES.RUNNING,
    WORKOUT_TYPES.WALKING,
    WORKOUT_TYPES.CYCLING
  ].includes(workoutType);
};

/**
 * Format duration in seconds to human-readable format
 * 
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (HH:MM:SS or MM:SS)
 */
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Estimate calories burned based on workout type and duration
 * 
 * @param {string} workoutType - Type of workout
 * @param {number} durationInSeconds - Duration in seconds
 * @param {number} [userWeight=70] - User weight in kg
 * @returns {number} Estimated calories burned
 */
export const estimateCalories = (workoutType, durationInSeconds, userWeight = 70) => {
  const minutesElapsed = durationInSeconds / 60;
  const baseCalories = minutesElapsed * (CALORIE_RATES[workoutType] || CALORIE_RATES[WORKOUT_TYPES.OTHER]);
  
  // Adjust for weight (assuming the base rates are for a 70kg person)
  const weightFactor = userWeight / 70;
  return Math.round(baseCalories * weightFactor);
};

/**
 * Calculate average pace (minutes per km)
 * 
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} durationSeconds - Duration in seconds
 * @returns {string} Pace in min:sec per km
 */
export const calculatePace = (distanceKm, durationSeconds) => {
  if (!distanceKm || distanceKm === 0) return '-';
  
  const paceSeconds = durationSeconds / distanceKm;
  const paceMinutes = Math.floor(paceSeconds / 60);
  const paceRemainingSeconds = Math.floor(paceSeconds % 60);
  
  return `${paceMinutes}:${paceRemainingSeconds.toString().padStart(2, '0')}/km`;
};

/**
 * Calculate average speed in km/h
 * 
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} durationSeconds - Duration in seconds
 * @returns {number} Speed in km/h
 */
export const calculateSpeed = (distanceKm, durationSeconds) => {
  if (!distanceKm || durationSeconds === 0) return 0;
  
  const durationHours = durationSeconds / 3600;
  return (distanceKm / durationHours);
};

/**
 * Generate workout summary with all stats
 * 
 * @param {object} workout - Workout data object
 * @returns {object} Complete workout summary
 */
export const generateWorkoutSummary = (workout) => {
  const { workoutType, duration, distance } = workout;
  
  return {
    ...workout,
    formattedDuration: formatDuration(duration),
    calories: workout.calories || estimateCalories(workoutType, duration),
    pace: distance ? calculatePace(distance, duration) : null,
    speed: distance ? calculateSpeed(distance, duration).toFixed(1) : null,
  };
};

