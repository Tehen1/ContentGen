import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Chip,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useWeb3 } from '../../contexts/Web3Context';
import ActivityStats from './src/components/Dashboard/ActivityStats';
import NFTCollections from './src/components/Dashboard/NFTCollections';
import './styles.css';

// Custom styled components using MUI
const DashboardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4],
  },
}));

// Custom hooks for data fetching
const useActivityData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Mock data
      setData({
        totalSteps: 65534,
        totalCalories: 3230,
        totalDistance: 47.2,
        totalActiveMinutes: 493,
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching activity data:', err);
      setError('Failed to load activity data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

const useNFTCollections = (account) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollections = useCallback(async () => {
    if (!account) {
      setCollections([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Mock data
      setCollections([
        { id: 1, name: 'Marathon Runner', image: 'https://via.placeholder.com/150', rarity: 'Rare' },
        { id: 2, name: 'Trail Explorer', image: 'https://via.placeholder.com/150', rarity: 'Common' },
        { id: 3, name: 'Fitness Champion', image: 'https://via.placeholder.com/150', rarity: 'Epic' },
      ]);
      setError(null);
    } catch (err) {
      console.error('Error fetching NFT collections:', err);
      setError('Failed to load NFT collections');
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return { collections, loading, error, refetch: fetchCollections };
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          <Typography variant="h6">Something went wrong</Typography>
          <Typography variant="body2">{this.state.error?.message || 'Unknown error'}</Typography>
          <Button 
            color="inherit" 
            size="small" 
            onClick={() => this.setState({ hasError: false, error: null })}
            sx={{ mt: 1 }}
          >
            Try Again
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { account, isConnected, tokenBalance, connectWallet } = useWeb3();
  
  const { 
    data: activityData, 
    loading: activityLoading, 
    error: activityError
  } = useActivityData();
  
  const { 
    collections: nftCollections, 
    loading: nftLoading, 
    error: nftError
  } = useNFTCollections(account);

  // Calculate NFT stats
  const nftStats = useMemo(() => {
    if (!nftCollections.length) return null;
    
    const totalNFTs = nftCollections.length;
    
    // Calculate rarity distribution
    const rarityCount = nftCollections.reduce((acc, nft) => {
      const rarity = nft.rarity.toLowerCase();
      acc[rarity] = (acc[rarity] || 0) + 1;
      return acc;
    }, {});
    
    const rarityDistribution = Object.entries(rarityCount).map(([rarity, count]) => ({
      rarity,
      count,
      percentage: Math.round((count / totalNFTs) * 100)
    }));
    
    // Mock collection value calculation
    const collectionValue = 1250; // Mock value in FIT tokens
    
    return {
      totalNFTs,
      rarityDistribution,
      collectionValue
    };
  }, [nftCollections]);

  return (
    <Container maxWidth="xl">
      <ErrorBoundary>
        <DashboardHeader>
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
          <Box>
            {isConnected ? (
              <Chip 
                color="success" 
                icon={<span style={{ 
                  display: 'inline-block', 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#10b981', 
                  marginRight: '6px' 
                }}></span>} 
                label="Wallet Connected" 
                variant="outlined" 
              />
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={connectWallet}
                size="small"
              >
                Connect Wallet
              </Button>
            )}
          </Box>
        </DashboardHeader>

        <Grid container spacing={3}>
          {/* Activity Stats Section - 8 columns on desktop */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
              <ActivityStats />
            </Paper>
          </Grid>

          {/* Recent Activity / User Stats - 4 columns on desktop */}
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                NFT Stats
              </Typography>
              {nftLoading ? (
                <CircularProgress />
              ) : nftError ? (
                <Alert severity="error">{nftError}</Alert>
              ) : nftStats ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <StatsCard>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          Total NFTs
                        </Typography>
                        <Typography variant="h4">{nftStats.totalNFTs}</Typography>
                      </CardContent>
                    </StatsCard>
                  </Grid>
                  <Grid item xs={12}>
                    <StatsCard>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          Collection Value
                        </Typography>
                        <Typography variant="h4">{nftStats.collectionValue} FIT</Typography>
                      </CardContent>
                    </StatsCard>
                  </Grid>
                  <Grid item xs={12}>
                    <StatsCard>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          Rarity Distribution
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          {nftStats.rarityDistribution.map((item) => (
                            <Box key={item.rarity} sx={{ mb: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                  {item.rarity}
                                </Typography>
                                <Typography variant="body2">{item.percentage}%</Typography>
                              </Box>
                              <Box
                                sx={{
                                  height: 8,
                                  width: '100%',
                                  bgcolor: 'background.paper',
                                  borderRadius: 1,
                                  overflow: 'hidden',
                                }}
                              >
                                <Box
                                  sx={{
                                    height: '100%',
                                    width: `${item.percentage}%`,
                                    bgcolor: item.rarity === 'common' ? '#9ca3af' :
                                            item.rarity === 'rare' ? '#3b82f6' : '#8b5cf6',
                                  }}
                                />
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </StatsCard>
                  </Grid>
                </Grid>
              ) : (
                <Typography color="text.secondary">No NFT stats available</Typography>
              )}
            </Paper>
