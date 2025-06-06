import { readFileSync } from 'fs';
import path from 'path';
import { Activity } from './types';

/**
 * Import history data from JSON file
 * @param filePath Path to the history JSON file
 * @returns Processed activity data
 */
export function importHistoryData(filePath: string): Activity[] {
  try {
    // Read the JSON file
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    
    // Transform data to match the application's Activity type
    // This transformation will depend on the structure of your history.json
    return processHistoryData(data);
  } catch (error) {
    console.error('Error importing history data:', error);
    return [];
  }
}

/**
 * Process raw history data into application Activity format
 * This function should be adapted based on your history.json structure
 */
function processHistoryData(rawData: any): Activity[] {
  // Check if we're dealing with location history or activity data
  if (rawData.locations) {
    // Location history format
    return processLocationHistory(rawData);
  } else if (Array.isArray(rawData)) {
    // Assume array of activities
    return rawData.map(item => transformActivityItem(item));
  }
  
  return [];
}

/**
 * Process location history format into activities
 */
function processLocationHistory(data: any): Activity[] {
  const activities: Activity[] = [];
  
  // Group location points into activities based on time gaps
  // This is a simplified example - you'd need to customize this
  // based on your actual data structure
  let currentActivity: any = null;
  const ACTIVITY_GAP_THRESHOLD = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  if (data.locations && Array.isArray(data.locations)) {
    data.locations.forEach((location: any) => {
      const timestamp = parseInt(location.timestampMs);
      
      if (!currentActivity || 
          timestamp - currentActivity.endTime > ACTIVITY_GAP_THRESHOLD) {
        // Start a new activity
        if (currentActivity) {
          activities.push(transformActivityItem(currentActivity));
        }
        
        currentActivity = {
          startTime: timestamp,
          endTime: timestamp,
          points: [location],
          type: detectActivityType(location)
        };
      } else {
        // Add to current activity
        currentActivity.endTime = timestamp;
        currentActivity.points.push(location);
      }
    });
    
    // Add the last activity if it exists
    if (currentActivity) {
      activities.push(transformActivityItem(currentActivity));
    }
  }
  
  return activities;
}

/**
 * Detect activity type based on location data
 */
function detectActivityType(location: any): string {
  // This is a simplified example
  // You would need more sophisticated logic based on your data
  if (location.velocity > 5) {
    return 'running';
  } else if (location.velocity > 1) {
    return 'walking';
  }
  return 'stationary';
}

/**
 * Transform a raw activity item into the application's Activity format
 */
function transformActivityItem(item: any): Activity {
  // Customize this based on your Activity type and source data format
  return {
    type: item.type || 'unknown',
    date: new Date(item.startTime || Date.now()).toISOString(),
    duration: item.endTime && item.startTime ? 
      Math.floor((item.endTime - item.startTime) / 1000) : 0,
    distance: calculateDistance(item.points || []),
    calories: estimateCalories(item.type, item.duration),
    // Add any other fields required by your Activity type
  };
}

/**
 * Calculate distance from location points
 */
function calculateDistance(points: any[]): number {
  // Implement distance calculation logic
  // This is a simplified version
  let distance = 0;
  for (let i = 1; i < points.length; i++) {
    distance += calculateHaversineDistance(
      points[i-1].latitudeE7 / 10000000, 
      points[i-1].longitudeE7 / 10000000,
      points[i].latitudeE7 / 10000000, 
      points[i].longitudeE7 / 10000000
    );
  }
  return distance;
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Estimate calories burned based on activity type and duration
 */
function estimateCalories(type: string, durationSeconds: number): number {
  // Simple estimation based on activity type and duration
  // Replace with more accurate calculations based on your needs
  const MET = {
    running: 8.5,
    walking: 3.5,
    cycling: 7.0,
    swimming: 6.0,
    stationary: 1.5,
    unknown: 3.0
  };
  
  const activityMET = MET[type as keyof typeof MET] || MET.unknown;
  const durationHours = durationSeconds / 3600;
  const avgWeight = 70; // kg, placeholder
  
  return Math.round(activityMET * avgWeight * durationHours);
}

/**
 * Import and integrate the existing location_history_enriched.json
 */
export function importEnrichedLocationHistory(): Activity[] {
  try {
    // Import the existing enriched location history
    const filePath = path.join(process.cwd(), 'lib', 'location-history_enriched.json');
    return importHistoryData(filePath);
  } catch (error) {
    console.error('Error importing enriched location history:', error);
    return [];
  }
}

/**
 * Import and process history from a custom file path
 */
export function importCustomHistory(customFilePath: string): Activity[] {
  try {
    return importHistoryData(customFilePath);
  } catch (error) {
    console.error(`Error importing history from ${customFilePath}:`, error);
    return [];
  }
}