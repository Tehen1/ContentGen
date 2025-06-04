import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import {
  AutoFixHigh,
  Image,
  Speed,
  Psychology,
  Analytics,
  Memory,
  ArrowForward,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiService, HealthResponse, ModelsResponse, getErrorMessage } from '../services/api';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [models, setModels] = useState<ModelsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [healthData, modelsData] = await Promise.all([
          apiService.checkHealth(),
          apiService.getModels(),
        ]);
        setHealth(healthData);
        setModels(modelsData);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: <AutoFixHigh sx={{ fontSize: 40 }} />,
      title: 'Génération IA Avancée',
      description: 'Créez des images époustouflantes avec les modèles les plus performants du marché',
      action: () => navigate('/generate'),
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Traitement en Lot',
      description: 'Générez plusieurs images simultanément pour maximiser votre productivité',
      action: () => navigate('/batch'),
    },
    {
      icon: <Analytics sx={{ fontSize: 40 }} />,
      title: 'Analyse Intelligente',
      description: 'Analysez vos images pour comprendre leur composition et obtenir des suggestions',
      action: () => navigate('/analyze'),
    },
    {
      icon: <Psychology sx={{ fontSize: 40 }} />,
      title: 'Optimisation de Prompts',
      description: 'Transformez vos idées en prompts optimisés pour de meilleurs résultats',
      action: () => navigate('/generate'),
    },
  ];

  const modelHighlights = [
    {
      name: 'FLUX Kontext Pro',
      description: 'Édition avancée et cohérence des personnages',
      bestFor: 'Assets de jeu',
      color: 'primary',
    },
    {
      name: 'FLUX 1.1 Pro',
      description: 'Haute qualité et adhésion parfaite aux prompts',
      bestFor: 'Illustrations',
      color: 'secondary',
    },
    {
      name: 'FLUX Schnell',
      description: 'Génération ultra-rapide et économique',
      bestFor: 'Prototypage',
      color: 'success',
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
          flexDirection="column"
          gap={2}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Chargement des informations...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #6a1b9a 30%, #00e5ff 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 2,
          }}
        >
          Fixie UI
        </Typography>
        
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
          Interface web moderne pour la génération d'images par IA. 
          Créez, analysez et optimisez vos créations visuelles avec les technologies les plus avancées.
        </Typography>

        {error && (
          <Alert severity="warning" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Connexion au backend limitée: {error}
          </Alert>
        )}

        {health && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
            <Chip
              icon={<CheckCircle />}
              label={`API Active v${health.version}`}
              color="success"
              variant="outlined"
            />
            <Chip
              icon={<Memory />}
              label={`${health.models_available} Modèles Disponibles`}
              color="primary"
              variant="outlined"
            />
          </Box>
        )}

        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForward />}
          onClick={() => navigate('/generate')}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            background: 'linear-gradient(45deg, #6a1b9a 30%, #9c4dcc 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #38006b 30%, #6a1b9a 90%)',
            },
          }}
        >
          Commencer à Créer
        </Button>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 6 }}>
        <Typography variant="h3" component="h2" sx={{ textAlign: 'center', mb: 6 }}>
          Fonctionnalités Principales
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 4,
                  },
                }}
                onClick={feature.action}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ color: 'primary.main', mt: 0.5 }}>
                      {feature.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {feature.description}
                      </Typography>
                    </Box>
                    <ArrowForward sx={{ color: 'text.secondary', mt: 1 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Models Section */}
      <Box sx={{ py: 6 }}>
        <Typography variant="h3" component="h2" sx={{ textAlign: 'center', mb: 6 }}>
          Modèles IA Disponibles
        </Typography>
        
        <Grid container spacing={3}>
          {modelHighlights.map((model, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h4" sx={{ fontWeight: 600 }}>
                      {model.name}
                    </Typography>
                    <Chip
                      label={model.bestFor}
                      color={model.color as any}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {model.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/models')}
            endIcon={<ArrowForward />}
          >
            Voir Tous les Modèles
          </Button>
        </Box>
      </Box>

      {/* Stats Section */}
      {models && (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="h4" component="h2" sx={{ mb: 4 }}>
            Puissance et Performance
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="h2" color="primary.main" sx={{ fontWeight: 700 }}>
                  {models.count}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Modèles IA
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="h2" color="secondary.main" sx={{ fontWeight: 700 }}>
                  ∞
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Créativité Illimitée
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="h2" color="success.main" sx={{ fontWeight: 700 }}>
                  24/7
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Disponibilité
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default HomePage;

