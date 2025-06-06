import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Import the component to test (this is hypothetical)
// import ProfileCard from '@/components/ProfileCard';

// Create a mock component for testing purposes since we don't have the actual component
const ProfileCard = ({ 
  username, 
  stats, 
  walletConnected = false, 
  achievements = [], 
  onConnectWallet = () => {},
  onViewAchievements = () => {} 
}) => {
  return (
    <div data-testid="profile-card" className="profile-card">
      <h2 data-testid="username">{username}</h2>
      
      {stats && (
        <div data-testid="stats">
          <p>Steps: {stats.steps}</p>
          <p>Calories: {stats.calories}</p>
          <p>Distance: {stats.distance} km</p>
        </div>
      )}
      
      {!walletConnected ? (
        <button 
          data-testid="connect-wallet-button"
          onClick={onConnectWallet}
        >
          Connect Wallet
        </button>
      ) : (
        <div data-testid="wallet-connected">Wallet Connected</div>
      )}
      
      {achievements.length > 0 && (
        <>
          <h3>Achievements ({achievements.length})</h3>
          <ul data-testid="achievements-list">
            {achievements.map((achievement, index) => (
              <li key={index}>{achievement.name}</li>
            ))}
          </ul>
          <button 
            data-testid="view-achievements-button"
            onClick={onViewAchievements}
          >
            View All
          </button>
        </>
      )}
    </div>
  );
};

describe('ProfileCard Component', () => {
  const mockStats = {
    steps: 8432,
    calories: 420,
    distance: 6.5
  };
  
  const mockAchievements = [
    { id: 1, name: '10,000 Steps' },
    { id: 2, name: '5km Run' }
  ];

  // Test basic rendering
  test('renders the profile card with username', () => {
    render(<ProfileCard username="FitAppUser" stats={mockStats} />);
    
    expect(screen.getByTestId('profile-card')).toBeInTheDocument();
    expect(screen.getByTestId('username')).toHaveTextContent('FitAppUser');
  });

  // Test rendering with different props
  test('displays user stats correctly', () => {
    render(<ProfileCard username="FitAppUser" stats={mockStats} />);
    
    const statsElement = screen.getByTestId('stats');
    expect(statsElement).toBeInTheDocument();
    expect(statsElement).toHaveTextContent('Steps: 8432');
    expect(statsElement).toHaveTextContent('Calories: 420');
    expect(statsElement).toHaveTextContent('Distance: 6.5 km');
  });

  // Test conditional rendering based on props
  test('shows connect wallet button when wallet is not connected', () => {
    render(<ProfileCard username="FitAppUser" stats={mockStats} walletConnected={false} />);
    
    expect(screen.getByTestId('connect-wallet-button')).toBeInTheDocument();
    expect(screen.queryByTestId('wallet-connected')).not.toBeInTheDocument();
  });

  test('shows wallet connected status when wallet is connected', () => {
    render(<ProfileCard username="FitAppUser" stats={mockStats} walletConnected={true} />);
    
    expect(screen.queryByTestId('connect-wallet-button')).not.toBeInTheDocument();
    expect(screen.getByTestId('wallet-connected')).toBeInTheDocument();
  });

  // Test achievements display
  test('displays achievements when they exist', () => {
    render(
      <ProfileCard 
        username="FitAppUser" 
        stats={mockStats} 
        walletConnected={true} 
        achievements={mockAchievements}
      />
    );
    
    expect(screen.getByTestId('achievements-list')).toBeInTheDocument();
    expect(screen.getByTestId('view-achievements-button')).toBeInTheDocument();
    expect(screen.getByText('10,000 Steps')).toBeInTheDocument();
    expect(screen.getByText('5km Run')).toBeInTheDocument();
  });

  test('does not display achievements section when no achievements', () => {
    render(
      <ProfileCard 
        username="FitAppUser" 
        stats={mockStats} 
        walletConnected={true} 
        achievements={[]}
      />
    );
    
    expect(screen.queryByTestId('achievements-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('view-achievements-button')).not.toBeInTheDocument();
  });

  // Test user interactions
  test('calls onConnectWallet when connect wallet button is clicked', async () => {
    const mockOnConnectWallet = jest.fn();
    
    render(
      <ProfileCard 
        username="FitAppUser" 
        stats={mockStats} 
        onConnectWallet={mockOnConnectWallet} 
      />
    );
    
    const connectButton = screen.getByTestId('connect-wallet-button');
    fireEvent.click(connectButton);
    
    expect(mockOnConnectWallet).toHaveBeenCalledTimes(1);
  });

  test('calls onViewAchievements when view achievements button is clicked', async () => {
    const mockOnViewAchievements = jest.fn();
    
    render(
      <ProfileCard 
        username="FitAppUser" 
        stats={mockStats} 
        walletConnected={true}
        achievements={mockAchievements}
        onViewAchievements={mockOnViewAchievements}
      />
    );
    
    const viewButton = screen.getByTestId('view-achievements-button');
    fireEvent.click(viewButton);
    
    expect(mockOnViewAchievements).toHaveBeenCalledTimes(1);
  });

  // Testing user events with async/await
  test('user can interact with the connect wallet button', async () => {
    const user = userEvent.setup();
    const mockOnConnectWallet = jest.fn();
    
    render(
      <ProfileCard 
        username="FitAppUser" 
        stats={mockStats} 
        onConnectWallet={mockOnConnectWallet} 
      />
    );
    
    const connectButton = screen.getByTestId('connect-wallet-button');
    await user.click(connectButton);
    
    await waitFor(() => {
      expect(mockOnConnectWallet).toHaveBeenCalledTimes(1);
    });
  });
});

