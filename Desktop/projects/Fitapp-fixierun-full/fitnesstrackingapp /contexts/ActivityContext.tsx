import React, { createContext, useState, useEffect } from 'react';

interface Activity {
  id: string;
  type: string;
  distance: number;
  duration: string;
  date: Date;
  calories: number;
}

interface ActivityContextType {
  recentActivities: Activity[];
  allActivities: Activity[];
  loading: boolean;
  error: string | null;
}

export const ActivityContext = createContext<ActivityContextType>({
  recentActivities: [],
  allActivities: [],
  loading: false,
  error: null,
});

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const activities: Activity[] = [
          {
            id: '1',
            type: 'Running',
            distance: 5.2,
            duration: '28:45',
            date: new Date(2023, 4, 15),
            calories: 430,
          },
          {
            id: '2',
            type: 'Cycling',
            distance: 15.8,
            duration: '45:12',
            date: new Date(2023, 4, 14),
            calories: 520,
          },
          {
            id: '3',
            type: 'Walking',
            distance: 3.5,
            duration: '42:10',
            date: new Date(2023, 4, 14),
            calories: 210,
          },
          {
            id: '4',
            type: 'Running',
            distance: 8.1,
            duration: '48:30',
            date: new Date(2023, 4, 12),
            calories: 680,
          },
          {
            id: '5',
            type: 'Cycling',
            distance: 22.4,
            duration: '1:10:45',
            date: new Date(2023, 4, 11),
            calories: 740,
          },
          {
            id: '6',
            type: 'Walking',
            distance: 4.2,
            duration: '50:15',
            date: new Date(2023, 4, 10),
            calories: 250,
          },
        ];
        
        setRecentActivities(activities.slice(0, 3));
        setAllActivities(activities);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError('Failed to load activities. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, []);
  
  return (
    <ActivityContext.Provider 
      value={{ 
        recentActivities, 
        allActivities,
        loading, 
        error 
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};