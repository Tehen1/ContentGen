import React, { useState, useEffect } from 'react';
import { ActivityIntegration } from '../../../utils/blockchain/activityIntegration';
import { logInfo, logWarn, logError } from '../../../utils/logging';

// --- Helper function for simulating async operations ---
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Types ---
// Based on the type defined in activityIntegration.ts (or create a simplified version)
interface ProcessedActivity {
  timestamp: number;
  distance: number;
  duration: number;
  calories: number;
  activityType: string;
  valid: boolean;
  validationMessage?: string;
}

// Simulated raw activity data structure (matching GoogleHealthActivity structure in ActivityIntegration)
interface SimulatedGoogleHealthActivity {
  startTime: string;
  endTime: string;
  activityType: string;
  metrics: {
    distance?: number;
    duration?: number;
    calories?: number;
  };
  source: string;
  dataSourceId: string;
}

/**
 * Example component demonstrating integration with Google Health API and FixieRun smart contract.
 */
const ActivityIntegrationDemo: React.FC = () => {
  // State variables
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activities, setActivities] = useState<ProcessedActivity[]>([]); // Use defined type
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [pendingRewards, setPendingRewards] = useState<string>('0');
  const [activityIntegration, setActivityIntegration] = useState<ActivityIntegration | null>(null);

  // Initialize ActivityIntegration instance on mount
  useEffect(() => {
    logInfo('Initializing ActivityIntegration utility...');
    const integrationInstance = new ActivityIntegration();
    setActivityIntegration(integrationInstance);
    logInfo('ActivityIntegration utility initialized.');
  }, []);

  // --- Authentication Simulation ---
  const handleGoogleAuth = async () => {
    setIsLoadingAuth(true);
    setError(null);
    logInfo('Simulating Google authentication...');

    try {
      // Simulate API call delay
      await sleep(1500);

      // Simulate successful authentication
      // In a real app, this would involve OAuth flow and getting an access token
      setIsAuthenticated(true);
      logInfo('Google authentication successful (simulated).');

      // TODO: In a real scenario, you might want to connect the wallet here as well
      // if (!activityIntegration?.account) {
      //   await activityIntegration?.connectWallet();
      // }

    } catch (err: any) {
      logError('Google authentication failed (simulated):', err);
      setError(`Authentication failed: ${err.message || 'Unknown error'}`);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // --- Activity Fetching & Processing ---
  const handleFetchActivities = async () => {
    if (!isAuthenticated || !activityIntegration) {
      setError('Please authenticate with Google and connect wallet first.');
      return;
    }
    setIsLoadingActivities(true);
    setError(null);
    setActivities([]); // Clear previous activities
    logInfo('Fetching and processing activities...');

    try {
      // Simulate fetching data from Google Health API
      // In a real app, this would call activityIntegration.fetchActivitiesFromGoogleHealth
      await sleep(2000);
      const simulatedRawActivities: SimulatedGoogleHealthActivity[] = [
        { startTime: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), endTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), activityType: 'cycling', metrics: { distance: 15000, duration: 3600, calories: 500 }, source: 'com.example.app', dataSourceId: 'activity1' },
        { startTime: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), endTime: new Date(Date.now() - 25 * 3600 * 1000).toISOString(), activityType: 'cycling', metrics: { distance: 50, duration: 300, calories: 10 }, source: 'com.example.app', dataSourceId: 'activity2' }, // Invalid: too short distance
        { startTime: new Date(Date.now() - 50 * 3600 * 1000).toISOString(), endTime: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), activityType: 'cycling', metrics: { distance: 25000, duration: 7200, calories: 100 }, source: 'com.example.app', dataSourceId: 'activity3' }, // Invalid: calorie mismatch
        { startTime: new Date(Date.now() - 75 * 3600 * 1000).toISOString(), endTime: new Date(Date.now() - 73 * 3600 * 1000).toISOString(), activityType: 'cycling', metrics: { distance: 30000, duration: 5400, calories: 900 }, source: 'com.example.app', dataSourceId: 'activity4' },
      ];
      logInfo('Simulated raw activities fetched:', simulatedRawActivities.length);

      // Process activities using the utility
      // Cast the simulated data type if it doesn't exactly match GoogleHealthActivity expected by processActivities
      const processed = activityIntegration.processActivities(simulatedRawActivities as any);
      setActivities(processed);
      logInfo('Activities processed:', processed);

    } catch (err: any) {
      logError('Failed to fetch or process activities:', err);
      setError(`Failed to get activities: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoadingActivities(false);
    }
  };


  // --- Component Return ---
  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6 bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">FixieRun Integration Demo</h1>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded mb-4 relative">
          <strong>Error:</strong> {error}
          <button onClick={() => setError(null)} className="absolute top-1 right-2 font-bold text-red-500 hover:text-red-700 text-xl">&times;</button>
        </div>
      )}

      {/* Authentication Section */}
      <section className="p-4 border rounded shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">1. Authentication & Wallet</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleGoogleAuth}
            disabled={isLoadingAuth || isAuthenticated}
            className={`px-4 py-2 rounded text-white transition-colors duration-200 ${
              isLoadingAuth ? 'bg-gray-400 cursor-not-allowed' :
              isAuthenticated ? 'bg-green-500 cursor-default' :
              'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoadingAuth ? 'Connecting...' : isAuthenticated ? 'Google Connected' : 'Connect Google Account'}
          </button>
          {/* Display Wallet Connection Status */}
          {activityIntegration?.account ? (
             <p className="text-sm text-green-600">Wallet Connected: {activityIntegration.account.address.substring(0, 6)}...{activityIntegration.account.address.substring(activityIntegration.account.address.length - 4)}</p>
          ) : isAuthenticated ? (
             // Suggest connecting wallet if authenticated but no wallet found
             <button
               onClick={() => activityIntegration?.connectWallet()}
               className="px-3 py-1 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded"
              >
               Connect Wallet
             </button>
          ) : (
             <p className="text-sm text-red-600">Wallet not connected.</p>
          )}
        </div>
        {isLoadingAuth && <p className="text-sm text-gray-500 mt-2">Simulating Google authentication...</p>}
      </section>

      {/* Activity Fetching Section */}
      <section className="p-4 border rounded shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">2. Fetch & Validate Activities</h2>
        <button
          onClick={handleFetchActivities}
          disabled={!isAuthenticated || isLoadingActivities || !activityIntegration?.account}
          className={`px-4 py-2 rounded text-white transition-colors duration-200 ${
            !isAuthenticated || !activityIntegration?.account ? 'bg-gray-400 cursor-not-allowed' :
            isLoadingActivities ? 'bg-yellow-500 cursor-not-allowed' :
            'bg-purple-500 hover:bg-purple-600'
          }`}
        >
          {isLoadingActivities ? 'Fetching...' : 'Fetch Recent Activities'}
        </button>
        {(!isAuthenticated || !activityIntegration?.account) && <p className="text-xs text-red-500 mt-1">Connect Google & Wallet first.</p>}

        {isLoadingActivities && <p className="text-sm text-gray-500 mt-2">Fetching and validating activities...</p>}

        {activities.length > 0 && (
          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2">
            <h3 className="text-lg font-medium text-gray-600">Fetched Activities:</h3>
            {activities.map((act, index) => (
              <div key={index} className={`p-2 border rounded text-sm ${act.valid ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                <p>
                  <strong>Date:</strong> {new Date(act.timestamp * 1000).toLocaleDateString()} |
                  <strong> Dist:</strong> {(act.distance / 1000).toFixed(2)} km |
                  <strong> Dur:</strong> {(act.duration / 60).toFixed(1)} min |
                  <strong> Cal:</strong> {act.calories}
                </p>
                {!act.valid && <p className="text-xs text-red-600 mt-1"><strong>Invalid:</strong> {act.validationMessage}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Placeholder for next steps */}
        <h2 className="text-xl font-semibold mb-2 text-gray-400">3. Submit Activities (Next)</h2>
         {/* Activity submission UI will go here */}
      </section>
      <section className="p-4 border rounded shadow-sm bg-gray-100">
        <h2 className="text-xl font-semibold mb-2 text-gray-400">4. Claim Rewards (Next)</h2>
         {/* Reward claiming UI will go here */}
      </section>

    </div>
  );
};

export default ActivityIntegrationDemo;

