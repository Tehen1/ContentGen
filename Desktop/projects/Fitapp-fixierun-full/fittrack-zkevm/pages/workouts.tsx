import React, { useEffect, useState } from 'react';
import { useFitTracker } from '../hooks/useFitTracker';
import { WorkoutType } from '../types';
import { ethers } from 'ethers';

// Contract address should be stored in an environment variable in production
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_FIT_TRACKER_CONTRACT || '0x123456789abcdef123456789abcdef123456789';

const WorkoutsPage: React.FC = () => {
  // State for workouts list
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [totalWorkouts, setTotalWorkouts] = useState<number>(0);
  
  // State for form inputs
  const [workoutType, setWorkoutType] = useState<string>(WorkoutType.Running);
  const [duration, setDuration] = useState<number>(30);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(0);
  const [metadata, setMetadata] = useState<string>('');
  
  // Use the FitTracker hook
  const {
    isConnected,
    connect,
    userAddress,
    addWorkout,
    getTotalWorkouts,
    getWorkout,
    loading,
    error
  } = useFitTracker({
    contractAddress: CONTRACT_ADDRESS,
    autoConnect: true,
  });

  // Load user's workouts when connected
  useEffect(() => {
    const loadWorkouts = async () => {
      if (isConnected && userAddress) {
        try {
          // Get the total number of workouts
          const total = await getTotalWorkouts();
          setTotalWorkouts(total);
          
          // Fetch all workouts
          const workoutsData = [];
          for (let i = 0; i < total; i++) {
            const workout = await getWorkout(i);
            workoutsData.push(workout);
          }
          setWorkouts(workoutsData);
        } catch (err) {
          console.error('Error loading workouts:', err);
        }
      }
    };
    
    loadWorkouts();
  }, [isConnected, userAddress, getTotalWorkouts, getWorkout]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      // Convert duration to seconds if entered in minutes
      const durationInSeconds = duration * 60;
      
      // Add workout to blockchain
      await addWorkout(workoutType, durationInSeconds, caloriesBurned, metadata);
      
      // Reset form
      setWorkoutType(WorkoutType.Running);
      setDuration(30);
      setCaloriesBurned(0);
      setMetadata('');
      
      // Reload workouts to show the new one
      const total = await getTotalWorkouts();
      setTotalWorkouts(total);
      const newWorkout = await getWorkout(total - 1);
      setWorkouts([...workouts, newWorkout]);
      
      alert('Workout added successfully!');
    } catch (err) {
      console.error('Error adding workout:', err);
      alert(`Failed to add workout: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">FitTrack Workouts</h1>
      
      {!isConnected ? (
        <div className="mb-8 p-4 bg-yellow-100 rounded-lg">
          <p className="mb-4">Connect your wallet to view and track your workouts</p>
          <button 
            onClick={connect}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      ) : (
        <>
          <div className="mb-8 p-4 bg-green-100 rounded-lg">
            <p><strong>Connected Address:</strong> {userAddress}</p>
            <p><strong>Total Workouts:</strong> {totalWorkouts}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Workout form */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Add New Workout</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block mb-2">Workout Type</label>
                  <select 
                    value={workoutType} 
                    onChange={(e) => setWorkoutType(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {Object.values(WorkoutType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2">Duration (minutes)</label>
                  <input 
                    type="number" 
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border rounded"
                    min="1"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2">Calories Burned</label>
                  <input 
                    type="number" 
                    value={caloriesBurned}
                    onChange={(e) => setCaloriesBurned(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border rounded"
                    min="0"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2">Notes/Metadata (JSON)</label>
                  <textarea 
                    value={metadata}
                    onChange={(e) => setMetadata(e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={3}
                    placeholder='{"notes": "Great workout!", "location": "Gym"}'
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Add Workout'}
                </button>
              </form>
            </div>
            
            {/* Workouts list */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Your Workouts</h2>
              
              {loading ? (
                <p>Loading workouts...</p>
              ) : workouts.length === 0 ? (
                <p>No workouts found. Add your first workout!</p>
              ) : (
                <div className="space-y-4">
                  {workouts.map((workout, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{workout.workoutType}</h3>
                        <span className="text-sm text-gray-500">ID: {workout.id}</span>
                      </div>
                      <p><strong>Date:</strong> {formatDate(workout.timestamp)}</p>
                      <p><strong>Duration:</strong> {workout.duration / 60} minutes</p>
                      <p><strong>Calories:</strong> {workout.caloriesBurned}</p>
                      {workout.metadata && (
                        <div className="mt-2">
                          <p><strong>Notes:</strong></p>
                          <div className="bg-gray-100 p-2 rounded">
                            <pre className="text-xs whitespace-pre-wrap">
                              {typeof workout.metadata === 'string' 
                                ? workout.metadata 
                                : JSON.stringify(workout.metadata, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      {error && (
        <div className="mt-8 p-4 bg-red-100 text-red-700 rounded-lg">
          <p><strong>Error:</strong> {error.message}</p>
        </div>
      )}
    </div>
  );
};

export default WorkoutsPage;

