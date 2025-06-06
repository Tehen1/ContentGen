import { Activity } from './types';

// Sample activity data
const sampleActivities: Activity[] = [
  // Your existing sample activities would go here
];

// Store for all activities
let allActivities: Activity[] = [];

// Initialize activities with data
export function initializeActivities(): void {
  // Start with sample activities
  allActivities = [...sampleActivities];

  // Try to get activities from localStorage (for client-side)
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const storedActivities = localStorage.getItem('fitnessActivities');
      if (storedActivities) {
        const parsedActivities = JSON.parse(storedActivities);
        if (Array.isArray(parsedActivities)) {
          allActivities = [...allActivities, ...parsedActivities];
        }
      }
    } catch (error) {
      console.error('Error loading activities from localStorage:', error);
    }
  }

  // Sort activities by date (newest first)
  allActivities.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  console.log(`Initialized ${allActivities.length} activities`);
}

// Get all activities
export function getAllActivities(): Activity[] {
  return [...allActivities];
}

// Get activities by type
export function getActivitiesByType(type: string): Activity[] {
  return allActivities.filter(activity => activity.activity_type === type);
}

// Get recent activities
export function getRecentActivities(limit: number = 5): Activity[] {
  return [...allActivities.slice(0, limit)];
}

// Add a new activity
export function addActivity(activity: Activity): void {
  allActivities.unshift(activity);

  // Update localStorage if available
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('fitnessActivities', JSON.stringify(allActivities));
    } catch (error) {
      console.error('Error saving activities to localStorage:', error);
    }
  }
}

// Calculate total stats
export function calculateTotalStats(): {
  totalDistance: number;
  totalDuration: number;
  totalCalories: number;
  activityCount: number;
} {
  const totalDistance = allActivities.reduce((sum, activity) => sum + (activity.distance_km || 0), 0);
  const totalDuration = allActivities.reduce((sum, activity) => sum + (activity.duration || 0), 0);
  const totalCalories = allActivities.reduce((sum, activity) => sum + (activity.calories || 0), 0);

  return {
    totalDistance,
    totalDuration,
    totalCalories,
    activityCount: allActivities.length
  };
}

// Calculate activity duration in minutes
export function getActivityDuration(activity: Activity): number {
  if (!activity.start_time || !activity.end_time) return 0;
  const start = new Date(activity.start_time).getTime();
  const end = new Date(activity.end_time).getTime();
  return (end - start) / (1000 * 60); // Convert to minutes
}

// Calculate activity speed in km/h
export function getActivitySpeed(activity: Activity): number {
  const durationHours = getActivityDuration(activity) / 60;
  return durationHours > 0 ? (activity.distance_km || 0) / durationHours : 0;
}

// Group activities by day
export function groupActivitiesByDay(activities: Activity[]): Record<string, Activity[]> {
  return activities.reduce((groups, activity) => {
    const date = new Date(activity.start_time).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);
}

// Group activities by month
export function groupActivitiesByMonth(activities: Activity[]): Record<string, Activity[]> {
  return activities.reduce((groups, activity) => {
    const date = new Date(activity.start_time);
    const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);
}

// Get all activities (alias for compatibility)
export const activityData = getAllActivities;
