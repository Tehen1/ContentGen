import axios from 'axios';
import { getAuthToken } from '../utils/auth';

// Define types
export interface Activity {
  id: string;
  userId: string;
  type: 'running' | 'cycling' | 'walking' | 'swimming' | 'hiking' | 'other';
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  distance: number; // in meters
  calories: number;
  avgPace: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  elevationGain?: number;
  routeData?: GeoJSON.LineString;
  notes?: string;
  weather?: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityStats {
  totalActivities: number;
  totalDistance: number;
  totalDuration: number;
  totalCalories: number;
  activitiesByType: Record<string, number>;
  weeklyProgress: {
    labels: string[];
    distances: number[];
    durations: number[];
  };
}

export interface ActivityFilters {
  type?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  minDistance?: number;
  maxDistance?: number;
  sortBy?: 'date' | 'distance' | 'duration' | 'calories';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const activityService = {
  // Get all activities with optional filters
  getActivities: async (filters: ActivityFilters = {}): Promise<{ activities: Activity[], total: number }> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');

    const queryParams = new URLSearchParams();
    
    if (filters.type && filters.type.length > 0) {
      filters.type.forEach(type => queryParams.append('type', type));
    }
    
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom.toISOString());
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo.toISOString());
    if (filters.minDistance) queryParams.append('minDistance', filters.minDistance.toString());
    if (filters.maxDistance) queryParams.append('maxDistance', filters.maxDistance.toString());
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.page) queryParams.append('page', filters.page.toString());

    const response = await axios.get(`${API_URL}/activities?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  },

  // Get a single activity by ID
  getActivity: async (id: string): Promise<Activity> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');

    const response = await axios.get(`${API_URL}/activities/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  },

  // Create a new activity
  createActivity: async (activityData: Omit<Activity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Activity> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');

    const response = await axios.post(`${API_URL}/activities`, activityData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  },

  // Update an existing activity
  updateActivity: async (id: string, activityData: Partial<Activity>): Promise<Activity> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');

    const response = await axios.put(`${API_URL}/activities/${id}`, activityData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  },

  // Delete an activity
  deleteActivity: async (id: string): Promise<void> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');

    await axios.delete(`${API_URL}/activities/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Get activity statistics
  getActivityStats: async (dateFrom?: Date, dateTo?: Date): Promise<ActivityStats> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');

    const queryParams = new URLSearchParams();
    if (dateFrom) queryParams.append('dateFrom', dateFrom.toISOString());
    if (dateTo) queryParams.append('dateTo', dateTo.toISOString());

    const response = await axios.get(`${API_URL}/activities/stats?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  },

  // Export activities data (CSV, GPX, etc.)
  exportActivities: async (format: 'csv' | 'gpx' | 'json', filters: ActivityFilters = {}): Promise<Blob> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');

    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    
    if (filters.type && filters.type.length > 0) {
      filters.type.forEach(type => queryParams.append('type', type));
    }
    
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom.toISOString());
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo.toISOString());

    const response = await axios.get(`${API_URL}/activities/export?${queryParams.toString()}`, {
      headers: { 
        Authorization: `Bearer ${token}` 
      },
      responseType: 'blob'
    });
    
    return response.data;
  }
};

export default activityService;