import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Dashboard from '../../pages/dashboard'; // This is a hypothetical path

// Mock the useWallet hook
jest.mock('../../hooks/useWallet', () => ({
  useWallet: jest.fn()
}));

// Import the mocked hook
import { useWallet } from '../../hooks/useWallet';

// Mock implementation for the dashboard page components
jest.mock('../../components/ProfileCard', () => {
  return function MockProfileCard({ username, stats, onSyncData }) {
    return (
      <div data-testid="profile-card">
        <h2 data-testid="profile-username">{username}</h2>
        {stats && (
          <div data-testid="profile-stats">
            <p>Steps: {stats.steps}</p>
            <p>Calories: {stats.calories}</p>
            <p>Distance: {stats.distance} km</p>
          </div>
        )}
        <button data-testid="sync-button" onClick={onSyncData}>
          Sync Fitness Data
        </button>
      </div>
    );
  };
});

jest.mock('../../components/AchievementsList', () => {
  return function MockAchievementsList({ achievements }) {
    return (
      <div data-testid="achievements-list">
        <h3>Achievements ({achievements.length})</h3>
        <ul>
          {achievements.map((achievement, index) => (
            <li key={index} data-testid={`achievement-${index}`}>
              {achievement.name}
            </li>
          ))}
        </ul>
      </div>
    );
  };
});

jest.mock('../../components/RewardsPanel', () => {
  return function MockRewardsPanel({ tokenBalance, onClaimRewards }) {
    return (
      <div data-testid="rewards-panel">
        <h3>Your Rewards</h3>
        <p data-testid="token-balance">Balance: {tokenBalance} HC</p>
        <button data-testid="claim-rewards-button" onClick={onClaimRewards}>
          Claim Rewards
        </button>
      </div>
    );
  };
});

// Default mock data for tests
const mockUserProfile = {
  displayName: 'FitAppUser',
  stepsCount: 8432,
  caloriesBurned: 420,
  distanceCovered: 6.5,
  exists: true
};

const mockAchievements = [
  { id: 1, name: '10,000 Steps', completed: true, reward: 50 },
  { id: 2, name: '5km Run', completed: true, reward: 30 },
  { id: 3, name: 'Workout Streak: 7 Days', completed: false, reward: 100 }
];

// Configure the mock hook implementation
const mockWalletHook = () => {
  // Default implementation
  const mockWallet = {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    isConnected: true,
    isConnecting: false,
    error: null,
    connect: jest.fn(() => Promise.resolve(true)),
    disconnect: jest.fn(),
    getUserProfile: jest.fn(() => Promise.resolve(mockUserProfile)),
    syncFitnessData: jest.fn(() => Promise.resolve({ 
      hash: '0xabcdef123456',
      wait: jest.fn(() => Promise.resolve(true)) 
    })),
    getTokenBalance: jest.fn(() => Promise.resolve(750n)),
    claimRewards: jest.fn(() => Promise.resolve({ 
      hash: '0xfedcba654321',
      wait: jest.fn(() => Promise.resolve(true))
    })),
    getAchievements: jest.fn(() => Promise.resolve(mockAchievements))
  };
  
  return mockWallet;
};

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock implementation
    (useWallet as jest.Mock).mockImplementation(mockWalletHook);
  });

  // Test loading state
  test('renders loading state while fetching data', async () => {
    // Override the mock to delay the response
    (useWallet as jest.Mock).mockImplementation(() => ({
      ...mockWalletHook(),
      getUserProfile: jest.fn(() => new Promise(resolve => setTimeout(() => resolve(mockUserProfile), 100))),
      getTokenBalance: jest.fn(() => new Promise(resolve => setTimeout(() => resolve(750n), 100))),
      getAchievements: jest.fn(() => new Promise(resolve => setTimeout(() => resolve(mockAchievements), 100)))
    }));

    render(<Dashboard />);
    
    // Loading state should be visible
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    
    // Content should be visible after loading
    expect(screen.getByTestId('profile-card')).toBeInTheDocument();
  });

  // Test rendering of user profile data
  test('renders user profile data correctly', async () => {
    render(<Dashboard />);
    
    // Wait for the profile data to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('profile-username')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('profile-username')).toHaveTextContent('FitAppUser');
    expect(screen.getByTestId('profile-stats')).toHaveTextContent('Steps: 8432');
    expect(screen.getByTestId('profile-stats')).toHaveTextContent('Calories: 420');
    expect(screen.getByTestId('profile-stats')).toHaveTextContent('Distance: 6.5 km');
  });

  // Test rendering of achievements
  test('renders achievements correctly', async () => {
    render(<Dashboard />);
    
    // Wait for achievements to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('achievements-list')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('achievements-list')).toHaveTextContent('Achievements (3)');
    expect(screen.getByTestId('achievement-0')).toHaveTextContent('10,000 Steps');
    expect(screen.getByTestId('achievement-1')).toHaveTextContent('5km Run');
    expect(screen.getByTestId('achievement-2')).toHaveTextContent('Workout Streak: 7 Days');
  });

  // Test token balance display
  test('renders token balance correctly', async () => {
    render(<Dashboard />);
    
    // Wait for rewards panel to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('rewards-panel')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('token-balance')).toHaveTextContent('Balance: 750 HC');
  });

  // Test syncFitnessData interaction
  test('calls syncFitnessData when sync button is clicked', async () => {
    const mockSyncFitnessData = jest.fn(() => Promise.resolve({ 
      hash: '0xabcdef123456',
      wait: jest.fn(() => Promise.resolve(true)) 
    }));
    
    (useWallet as jest.Mock).mockImplementation(() => ({
      ...mockWalletHook(),
      syncFitnessData: mockSyncFitnessData
    }));

    render(<Dashboard />);
    
    // Wait for the sync button to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('sync-button')).toBeInTheDocument();
    });
    
    // Click the sync button
    fireEvent.click(screen.getByTestId('sync-button'));
    
    // Check if the syncFitnessData function was called
    await waitFor(() => {
      expect(mockSyncFitnessData).toHaveBeenCalled();
    });
    
    // The success message should be displayed
    expect(screen.getByTestId('success-message')).toHaveTextContent('Fitness data synced successfully!');
  });

  // Test claimRewards interaction
  test('calls claimRewards when claim rewards button is clicked', async () => {
    const mockClaimRewards = jest.fn(() => Promise.resolve({ 
      hash: '0xfedcba654321',
      wait: jest.fn(() => Promise.resolve(true))
    }));
    
    (useWallet as jest.Mock).mockImplementation(() => ({
      ...mockWalletHook(),
      claimRewards: mockClaimRewards
    }));

    render(<Dashboard />);
    
    // Wait for the claim rewards button to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('claim-rewards-button')).toBeInTheDocument();
    });
    
    // Click the claim rewards button
    fireEvent.click(screen.getByTestId('claim-rewards-button'));
    
    // Check if the claimRewards function was called
    await waitFor(() => {
      expect(mockClaimRewards).toHaveBeenCalled();
    });
    
    // The success message should be displayed
    expect(screen.getByTestId('success-message')).toHaveTextContent('Rewards claimed successfully!');
  });

  // Test error handling for blockchain operations
  test('handles errors when syncing fitness data fails', async () => {
    const errorMessage = 'Failed to sync fitness data: network error';
    const mockSyncFitnessData = jest.fn(() => Promise.reject(new Error(errorMessage)));
    
    (useWallet as jest.Mock).mockImplementation(() => ({
      ...mockWalletHook(),
      syncFitnessData: mockSyncFitnessData
    }));

    render(<Dashboard />);
    
    // Wait for the sync button to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('sync-button')).toBeInTheDocument();
    });
    
    // Click the sync button
    fireEvent.click(screen.getByTestId('sync-button'));
    
    // Check if the error message is displayed
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage);
    });
  });

  // Test wallet connection required
  test('shows connect wallet prompt when not connected', async () => {
    // Override the mock to simulate not connected state
    (useWallet as jest.Mock).mockImplementation(() => ({
      ...mockWalletHook(),
      isConnected: false,
      address: null
    }));

    render(<Dashboard />);
    
    // Should show connect wallet prompt
    expect(screen.getByTestId('connect-wallet-prompt')).toBeInTheDocument();
    
    // Should not show dashboard content
    expect(screen.queryByTestId('profile-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('achievements-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('rewards-panel')).not.toBeInTheDocument();
  });

  // Test new user experience
  test('shows profile creation form for new users', async () => {
    // Override the mock to simulate new user (profile doesn't exist)
    (useWallet as jest.Mock).mockImplementation(() => ({
      ...mockWalletHook(),
      getUserProfile: jest.fn(() => Promise.resolve({ 
        displayName: '', 
        exists: false 
      }))
    }));

    render(<Dashboard />);
    
    // Wait for the profile creation form to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('profile-creation-form')).toBeInTheDocument();
    });
    
    // Profile card should not be visible for new users
    expect(screen.queryByTestId('profile-card')).not.toBeInTheDocument();
  });
});

