// lib/api.tsx
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Update with actual API URL
});

// Function to fetch activity metrics
export const fetchActivityMetrics = async () => {
  try {
    const response = await api.get('/activities/metrics');
    return response.data;
  } catch (error) {
    console.error('Error fetching activity metrics:', error);
    return { 
      distance: 0, 
      duration: 0, 
      calories: 0, 
      activities: [] 
    };
  }
};
