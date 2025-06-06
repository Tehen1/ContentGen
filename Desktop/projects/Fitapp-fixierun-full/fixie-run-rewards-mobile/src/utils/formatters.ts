/**
 * Format a distance value with 2 decimal places
 * 
 * @param distance Distance in kilometers
 * @returns Formatted distance string with 2 decimal places
 */
export const formatDistance = (distance: number): string => {
  return distance.toFixed(2);
};

/**
 * Format a speed value with 1 decimal place
 * 
 * @param speed Speed in km/h
 * @returns Formatted speed string with 1 decimal place
 */
export const formatSpeed = (speed: number): string => {
  return speed.toFixed(1);
};

/**
 * Format a duration value as HH:MM:SS
 * 
 * @param seconds Duration in seconds
 * @returns Formatted duration string in HH:MM:SS format
 */
export const formatDuration = (seconds: number): string => {
  // Handle negative or invalid values
  const totalSeconds = Math.max(0, Math.floor(seconds));
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  // Zero-pad each component to ensure consistent format
  const hoursStr = hours.toString().padStart(2, '0');
  const minutesStr = minutes.toString().padStart(2, '0');
  const secsStr = secs.toString().padStart(2, '0');
  
  return `${hoursStr}:${minutesStr}:${secsStr}`;
};

/**
 * Format a pace value (minutes per kilometer)
 * 
 * @param pace Pace in minutes per kilometer
 * @returns Formatted pace string as MM:SS /km
 */
export const formatPace = (pace: number): string => {
  if (!isFinite(pace) || pace <= 0) {
    return '--:-- /km';
  }
  
  const minutes = Math.floor(pace);
  const seconds = Math.floor((pace - minutes) * 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
};

/**
 * Calculate and format pace from distance and duration
 * 
 * @param distance Distance in kilometers
 * @param durationInSeconds Duration in seconds
 * @returns Formatted pace string
 */
export const calculatePace = (distance: number, durationInSeconds: number): string => {
  if (distance <= 0 || durationInSeconds <= 0) {
    return '--:-- /km';
  }
  
  // Pace = minutes per kilometer
  const paceInMinutes = (durationInSeconds / 60) / distance;
  return formatPace(paceInMinutes);
};
