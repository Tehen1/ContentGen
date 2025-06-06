import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  CircularProgress,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'; // Note: Recharts needs to be installed with: npm install recharts

// Type definitions for fitness activity data
interface FitnessMetric {
  date: string;
  steps: number;
  caloriesBurned: number;
  distance: number; // in kilometers
  activeMinutes: number;
  heartRate?: number; // optional heart rate data
}

interface ActivitySummary {
  totalSteps: number;
  totalCalories: number;
  totalDistance: number;
  totalActiveMinutes: number;
  dailyAverage: {
    steps: number;
    calories: number;
    distance: number;
    activeMinutes: number;
  };
}

type Period = 'day' | 'week' | 'month';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ActivityStats: React.FC = () => {
  const [metrics, setMetrics] = useState<FitnessMetric[]>([]);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('week');

  // Fetch fitness metrics from the API
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/fitness/metrics?period=${period}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch fitness data: ${response.statusText}`);
        }
        
        const data = await response.json();
        setMetrics(data.metrics);
        setSummary(data.summary);
        setError(null);
      } catch (err) {
        console.error('Error fetching fitness metrics:', err);
        setError('Failed to load fitness data. Please try again later.');
        
        // For demo purposes, set mock data if fetch fails
        setMockData();
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [period]);

  // Set mock data for demo purposes - remove in production
  const setMockData = () => {
    const mockMetrics: FitnessMetric[] = [
      { date: '2025-04-19', steps: 8743, caloriesBurned: 420, distance: 6.2, activeMinutes: 65, heartRate: 72 },
      { date: '2025-04-20', steps: 10256, caloriesBurned: 510, distance: 7.5, activeMinutes: 78, heartRate: 75 },
      { date: '2025-04-21', steps: 7651, caloriesBurned: 380, distance: 5.4, activeMinutes: 58, heartRate: 68 },
      { date: '2025-04-22', steps: 9125, caloriesBurned: 450, distance: 6.8, activeMinutes: 70, heartRate: 71 },
      { date: '2025-04-23', steps: 11352, caloriesBurned: 570, distance: 8.2, activeMinutes: 85, heartRate: 76 },
      { date: '2025-04-24', steps: 8532, caloriesBurned: 410, distance: 6.0, activeMinutes: 63, heartRate: 70 },
      { date: '2025-04-25', steps: 9875, caloriesBurned: 490, distance: 7.1, activeMinutes: 74, heartRate: 73 },
    ];

    const mockSummary: ActivitySummary = {
      totalSteps: 65534,
      totalCalories: 3230,
      totalDistance: 47.2,
      totalActiveMinutes: 493,
      dailyAverage: {
        steps: 9362,
        calories: 461,
        distance: 6.7,
        activeMinutes: 70,
      }
    };

    setMetrics(mockMetrics);
    setSummary(mockSummary);
  };

  // Handle period change
  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
  };

  // Calculate activity distribution data for pie chart
  const getActivityDistribution = () => {
    if (!metrics.length) return [];
    
    // Sum up activity minutes across days
    const totalActive = metrics.reduce((sum, day) => sum + day.activeMinutes, 0);
    
    // For this example, we'll just make up distribution categories
    // In a real app, you would categorize based on actual data
    return [
      { name: 'Walking', value: Math.round(totalActive * 0.4) },
      { name: 'Running', value: Math.round(totalActive * 0.25) },
      { name: 'Cycling', value: Math.round(totalActive * 0.2) },
      { name: 'Other', value: Math.round(totalActive * 0.15) },
    ];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Activity Statistics
      </Typography>
      
      {/* Period selection chips */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
        <Chip 
          label="Daily" 
          color={period === 'day' ? 'primary' : 'default'} 
          onClick={() => handlePeriodChange('day')}
        />
        <Chip 
          label="Weekly" 
          color={period === 'week' ? 'primary' : 'default'} 
          onClick={() => handlePeriodChange('week')}
        />
        <Chip 
          label="Monthly" 
          color={period === 'month' ? 'primary' : 'default'} 
          onClick={() => handlePeriodChange('month')}
        />
      </Box>

      {/* Summary cards */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Steps
                </Typography>
                <Typography variant="h4">{summary.totalSteps.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Daily avg: {summary.dailyAverage.steps.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Calories Burned
                </Typography>
                <Typography variant="h4">{summary.totalCalories.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Daily avg: {summary.dailyAverage.calories.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Distance (km)
                </Typography>
                <Typography variant="h4">{summary.totalDistance.toFixed(1)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Daily avg: {summary.dailyAverage.distance.toFixed(1)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Active Minutes
                </Typography>
                <Typography variant="h4">{summary.totalActiveMinutes.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Daily avg: {summary.dailyAverage.activeMinutes.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Steps over time chart */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Steps Over Time
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metrics}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="steps" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  name="Steps"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Calories & Distance chart */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Calories & Distance
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="caloriesBurned" name="Calories" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="distance" name="Distance (km)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Activity Distribution */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Activity Distribution
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getActivityDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getActivityDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" paragraph>
                Your activity breakdown shows how you've been spending your active minutes during this period. 
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mt: 2 }}>
                {getActivityDistribution().map((activity, index) => (
                  <Box key={activity.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box 
                      sx={{ 
                        width: 16, 
                        height: 16, 
                        backgroundColor: COLORS[index % COLORS.length],
                        mr: 1,
                        borderRadius: '2px'
                      }} 
                    />
                    <Typography variant="body2">
                      {activity.name}: {activity.value} minutes
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ActivityStats;

