import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Grid, 
  CircularProgress, 
  Skeleton, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Chip, 
  Tabs, 
  Tab,
  IconButton,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Web3Context } from '../../contexts/Web3Context';
import LazyLoad from 'react-lazyload'; // Note: You may need to install this package with: npm install react-lazyload @types/react-lazyload

// Define interfaces for NFT data
interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
}

interface NFT {
  id: string;
  uri: string;
  metadata?: NFTMetadata;
  standard: 'ERC721' | 'ERC1155';
  balance?: number; // Only relevant for ERC-1155
}

// Custom styled components
const NFTCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[8],
  },
}));

const NFTMedia = styled(CardMedia)(({ theme }) => ({
  paddingTop: '100%', // 1:1 Aspect ratio
  backgroundSize: 'contain',
  backgroundPosition: 'center',
}));

// Tab interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`nft-tabpanel-${index}`}
      aria-labelledby={`nft-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const NFTCollections: React.FC = () => {
  const { account, nftContract, connected, connecting } = useContext(Web3Context);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState<number>(0);

  // Fetch NFTs when account changes
  useEffect(() => {
    const fetchNFTs = async () => {
      if (!account || !nftContract) return;

      setLoading(true);
      setError(null);
      
      try {
        // Fetch ERC-721 NFTs
        const fetchedNFTs = await nftContract.fetchNFTs(account);
        
        // Map NFTs to our internal format
        const nftPromises = fetchedNFTs.map(async (nft) => {
          try {
            // Fetch metadata from URI
            const metadataResponse = await fetch(nft.uri);
            const metadata = await metadataResponse.json();
            
            return {
              id: nft.id,
              uri: nft.uri,
              metadata,
              standard: 'ERC721' as const
            };
          } catch (err) {
            console.error(`Failed to fetch metadata for NFT ${nft.id}:`, err);
            
            // Return NFT with placeholder metadata
            return {
              id: nft.id,
              uri: nft.uri,
              metadata: {
                name: `NFT #${nft.id}`,
                description: 'Metadata unavailable',
                image: 'https://via.placeholder.com/400?text=Metadata+Unavailable',
                attributes: []
              },
              standard: 'ERC721' as const
            };
          }
        });
        
        const loadedNFTs = await Promise.all(nftPromises);
        
        // If no NFTs found, provide some mock data for demonstration
        if (loadedNFTs.length === 0) {
          setNfts(getMockNFTs());
        } else {
          setNfts(loadedNFTs);
        }
      } catch (err) {
        console.error('Error fetching NFTs:', err);
        setError('Failed to load NFTs. Please try again later.');
        
        // Set mock NFTs for demonstration
        setNfts(getMockNFTs());
      } finally {
        setLoading(false);
      }
    };

    if (connected && !connecting) {
      fetchNFTs();
    }
  }, [account, nftContract, connected, connecting]);

  // Mock NFT data for demonstration
  const getMockNFTs = (): NFT[] => {
    return [
      {
        id: '1',
        uri: 'https://example.com/nft/1',
        metadata: {
          name: 'Marathon Finisher',
          description: 'Awarded for completing your first marathon',
          image: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=400',
          attributes: [
            { trait_type: 'Distance', value: '42.2 km' },
            { trait_type: 'Time', value: '4h 32m' },
            { trait_type: 'Date Earned', value: '2025-03-15' },
            { trait_type: 'Rarity', value: 'Rare' }
          ]
        },
        standard: 'ERC721'
      },
      {
        id: '2',
        uri: 'https://example.com/nft/2',
        metadata: {
          name: '100K Steps Badge',
          description: 'Awarded for reaching 100,000 steps in a week',
          image: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=400',
          attributes: [
            { trait_type: 'Steps', value: '100,000+' },
            { trait_type: 'Week', value: 'Week 12, 2025' },
            { trait_type: 'Date Earned', value: '2025-03-22' },
            { trait_type: 'Rarity', value: 'Uncommon' }
          ]
        },
        standard: 'ERC721'
      },
      {
        id: '3',
        uri: 'https://example.com/nft/3',
        metadata: {
          name: 'Cycling Champion',
          description: 'Awarded for cycling over 500km in a month',
          image: 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?q=80&w=400',
          attributes: [
            { trait_type: 'Distance', value: '523 km' },
            { trait_type: 'Month', value: 'February 2025' },
            { trait_type: 'Date Earned', value: '2025-02-28' },
            { trait_type: 'Rarity', value: 'Epic' }
          ]
        },
        standard: 'ERC721'
      },
      {
        id: '4',
        uri: 'https://example.com/nft/4',
        metadata: {
          name: 'Fitness Streak',
          description: 'Awarded for maintaining a 30-day fitness streak',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400',
          attributes: [
            { trait_type: 'Streak', value: '30 days' },
            { trait_type: 'Date Earned', value: '2025-04-10' },
            { trait_type: 'Rarity', value: 'Common' }
          ]
        },
        standard: 'ERC1155',
        balance: 3
      }
    ];
  };

  // Handle NFT card click
  const handleNftClick = (nft: NFT) => {
    setSelectedNft(nft);
    setOpenDialog(true);
  };

  // Close NFT details dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter NFTs by standard based on active tab
  const getFilteredNFTs = () => {
    if (tabValue === 0) return nfts; // All NFTs
    if (tabValue === 1) return nfts.filter(nft => nft.standard === 'ERC721');
    return nfts.filter(nft => nft.standard === 'ERC1155');
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          NFT Collections
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          NFT Collections
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  // Render when not connected to wallet
  if (!connected) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          NFT Collections
        </Typography>
        <Alert severity="info">
          Please connect your wallet to view your NFT collections.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        NFT Collections
      </Typography>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab label={`All (${nfts.length})`} />
        <Tab label={`ERC-721 (${nfts.filter(nft => nft.standard === 'ERC721').length})`} />
        <Tab label={`ERC-1155 (${nfts.filter(nft => nft.standard === 'ERC1155').length})`} />
      </Tabs>
      
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {getFilteredNFTs().map((nft) => (
            <Grid item xs={12} sm={6} md={3} key={nft.id}>
              <LazyLoad 
                height={300} 
                offset={100} 
                placeholder={
                  <Card>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" height={30} />
                      <Skeleton variant="text" height={20} />
                    </CardContent>
                  </Card>
                }
              >
                <NFTCard onClick={() => handleNftClick(nft)}>
                  <NFTMedia
                    image={nft.metadata?.image || 'https://via.placeholder.com/400'}
                    title={nft.metadata?.name || `NFT #${nft.id}`}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div" noWrap>
                      {nft.metadata?.name || `NFT #${nft.id}`}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip 
                        label={nft.standard} 
                        size="small" 
                        color={nft.standard === 'ERC721' ? 'primary' : 'secondary'} 
                      />
                      {nft.standard === 'ERC1155' && nft.balance && (
                        <Typography variant="body2" color="text.secondary">
                          x{nft.balance}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </NFTCard>
              </LazyLoad>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {getFilteredNFTs().map((nft) => (
            <Grid item xs={12} sm={6} md={3} key={nft.id}>
              <LazyLoad 
                height={300} 
                offset={100} 
                placeholder={
                  <Card>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" height={30} />
                      <Skeleton variant="text" height={20} />
                    </CardContent>
                  </Card>
                }
              >
                <NFTCard onClick={() => handleNftClick(nft)}>
                  <NFTMedia
                    image={nft.metadata?.image || 'https://via.placeholder.com/400'}
                    title={nft.metadata?.name || `NFT #${nft.id}`}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div" noWrap>
                      {nft.metadata?.name || `NFT

