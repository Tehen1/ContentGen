import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Container,
  Divider,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Rating,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Info,
  Speed,
  Compare,
  Image,
  Check,
  Close,
  StarRate,
  HighQuality,
  Settings,
  PhotoFilter,
  FormatPaint,
  Refresh,
} from '@mui/icons-material';

import { apiService, ModelsResponse, getErrorMessage } from '../services/api';

// Interface pour les modèles
interface ModelDetails {
  key: string;
  name: string;
  description: string;
  provider: string;
  capabilities: string[];
  strengths: string[];
  limitations: string[];
  typical_use_cases: string[];
  rating: {
    quality: number;
    speed: number;
    versatility: number;
    creativity: number;
  };
  sample_images?: string[];
  specs?: {
    [key: string]: string | number | boolean;
  };
}

// Interface pour les données d'évaluation comparative
interface ComparisonCriteria {
  name: string;
  description: string;
  icon: React.ReactNode;
}

const comparisonCriteria: ComparisonCriteria[] = [
  { 
    name: 'Qualité d\'image', 
    description: 'Qualité visuelle et niveau de détail des images générées', 
    icon: <HighQuality /> 
  },
  { 
    name: 'Vitesse', 
    description: 'Temps de génération d\'une image standard', 
    icon: <Speed /> 
  },
  { 
    name: 'Polyvalence', 
    description: 'Capacité à gérer différents styles et sujets', 
    icon: <FormatPaint /> 
  },
  { 
    name: 'Créativité', 
    description: 'Originalité et unicité des résultats', 
    icon: <PhotoFilter /> 
  },
];

// Données de modèles enrichies (à remplacer par des données réelles de l'API)
const enrichModelData = (models: ModelsResponse): ModelDetails[] => {
  const defaultRating = {
    quality: 4,
    speed: 3,
    versatility: 3.5,
    creativity: 4
  };

  // Enrichir les données de base des modèles avec des informations supplémentaires
  const enrichedModels: ModelDetails[] = [];
  
  if (models.models && models.model_info) {
    Object.entries(models.models).forEach(([key, _]) => {
      const modelInfo = models.model_info?.[key];
      
      if (modelInfo) {
        const modelDetails: ModelDetails = {
          key,
          name: modelInfo.name || key,
          description: modelInfo.description || '',
          provider: getProviderFromKey(key),
          capabilities: getCapabilities(key),
          strengths: getStrengths(key),
          limitations: getLimitations(key),
          typical_use_cases: getUseCases(key),
          rating: getRating(key) || defaultRating,
          sample_images: getSampleImages(key),
          specs: getSpecs(key),
        };
        
        enrichedModels.push(modelDetails);
      }
    });
  }
  
  return enrichedModels;
};

// Fonctions d'aide pour enrichir les données (dans un cas réel, ces données viendraient de l'API)
const getProviderFromKey = (key: string): string => {
  if (key.includes('flux')) return 'Flux AI';
  if (key.includes('sdxl')) return 'Stability AI';
  if (key.includes('dalle')) return 'OpenAI';
  if (key.includes('midjourney')) return 'Midjourney';
  return 'API Replicate';
};

const getCapabilities = (key: string): string[] => {
  const baseCapabilities = ['Génération d\'image', 'Photographie réaliste'];
  
  if (key.includes('flux')) {
    return [...baseCapabilities, 'Rendu haute définition', 'Styles artistiques variés'];
  }
  
  if (key.includes('sdxl')) {
    return [...baseCapabilities, 'Contrôle précis', 'Inpainting', 'Outpainting'];
  }
  
  if (key.includes('dalle')) {
    return [...baseCapabilities, 'Compréhension contextuelle avancée', 'Cohérence logique'];
  }
  
  return baseCapabilities;
};

const getStrengths = (key: string): string[] => {
  if (key.includes('flux')) {
    return ['Qualité d\'image exceptionnelle', 'Détails photoréalistes', 'Rendu des textures'];
  }
  
  if (key.includes('sdxl')) {
    return ['Flexibilité de configuration', 'Versatilité', 'Communauté active'];
  }
  
  if (key.includes('dalle')) {
    return ['Compréhension des prompts', 'Cohérence des scènes', 'Rendu des visages'];
  }
  
  return ['Bon équilibre qualité/vitesse', 'Facilité d\'utilisation'];
};

const getLimitations = (key: string): string[] => {
  if (key.includes('flux')) {
    return ['Temps de génération plus long', 'Ressources GPU importantes'];
  }
  
  if (key.includes('sdxl')) {
    return ['Complexité de paramétrage', 'Inconsistance avec certains prompts'];
  }
  
  if (key.includes('dalle')) {
    return ['Coût plus élevé', 'Moins de flexibilité technique'];
  }
  
  return ['Limitations génériques du modèle'];
};

const getUseCases = (key: string): string[] => {
  if (key.includes('flux')) {
    return ['Publicité haut de gamme', 'Portfolio de design', 'Projets artistiques'];
  }
  
  if (key.includes('sdxl')) {
    return ['Projets créatifs', 'Illustrations stylisées', 'Personnalisation avancée'];
  }
  
  if (key.includes('dalle')) {
    return ['Communication visuelle', 'Visualisation de concepts', 'Storyboarding'];
  }
  
  return ['Prototypage rapide', 'Usage général'];
};

const getRating = (key: string): any => {
  if (key.includes('flux-1.1-pro')) {
    return { quality: 5, speed: 2.5, versatility: 4, creativity: 4.5 };
  }
  
  if (key.includes('flux-1.1')) {
    return { quality: 4.5, speed: 3, versatility: 4, creativity: 4 };
  }
  
  if (key.includes('sdxl')) {
    return { quality: 4, speed: 3.5, versatility: 4.5, creativity: 4 };
  }
  
  if (key.includes('dalle')) {
    return { quality: 4.5, speed: 4, versatility: 4, creativity: 4.5 };
  }
  
  return { quality: 3.5, speed: 3.5, versatility: 3.5, creativity: 3.5 };
};

const getSampleImages = (key: string): string[] => {
  // Dans une implémentation réelle, ces URLs seraient des images réelles générées par chaque modèle
  return [
    `https://picsum.photos/seed/${key}-1/800/600`,
    `https://picsum.photos/seed/${key}-2/800/600`,
    `https://picsum.photos/seed/${key}-3/800/600`,
  ];
};

const getSpecs = (key: string): any => {
  const baseSpecs = {
    "Version": key.split('-').pop() || "1.0",
    "Résolution max": "1024x1024",
    "Format de sortie": "PNG",
    "API": "Replicate",
  };
  
  if (key.includes('flux-1.1-pro')) {
    return {
      ...baseSpecs,
      "Résolution max": "2048x2048",
      "Support d'inpainting": true,
      "Support de contrôle": true,
      "Optimisé pour": "Photographie haute qualité",
    };
  }
  
  if (key.includes('sdxl')) {
    return {
      ...baseSpecs,
      "Résolution max": "1280x1280",
      "Support d'inpainting": true,
      "Support de contrôle": true,
      "Optimisé pour": "Créativité et flexibilité",
    };
  }
  
  return baseSpecs;
};

const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<ModelDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  const [compareModels, setCompareModels] = useState<string[]>([]);
  
  useEffect(() => {
    async function loadModels() {
      try {
        setLoading(true);
        const response = await apiService.getModels();
        const enrichedModels = enrichModelData(response);
        setModels(enrichedModels);
        
        // Par défaut, sélectionner les deux premiers modèles pour la comparaison
        if (enrichedModels.length >= 2) {
          setCompareModels([enrichedModels[0].key, enrichedModels[1].key]);
        }
      } catch (err) {
        setError('Erreur lors du chargement des modèles: ' + getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    
    loadModels();
  }, []);
  
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleCompareToggle = (modelKey: string) => {
    if (compareModels.includes(modelKey)) {
      // Retirer le modèle de la comparaison
      setCompareModels(compareModels.filter(key => key !== modelKey));
    } else {
      // Limiter à 3 modèles maximum pour la comparaison
      if (compareModels.length < 3) {
        setCompareModels([...compareModels, modelKey]);
      }
    }
  };
  
  const handleRefreshModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getModels();
      const enrichedModels = enrichModelData(response);
      setModels(enrichedModels);
    } catch (err) {
      setError('Erreur lors de l\'actualisation des modèles: ' + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  
  // Trouver les modèles recommandés par cas d'utilisation
  const getRecommendedModels = (useCase: string): ModelDetails[] => {
    return models.filter(model => 
      model.typical_use_cases.some(uc => 
        uc.toLowerCase().includes(useCase.toLowerCase())
      )
    );
  };
  
  // Contenu des onglets
  const renderModelsList = () => (
    <Grid container spacing={3}>
      {models.map((model) => (
        <Grid item xs={12} md={6} lg={4} key={model.key}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {model.sample_images && model.sample_images.length > 0 && (
              <CardMedia
                component="img"
                height="200"
                image={model.sample_images[0]}
                alt={`Image exemple de ${model.name}`}
                sx={{ objectFit: 'cover' }}
              />
            )}
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  {model.name}
                </Typography>
                <Chip 
                  label={model.provider} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {model.description}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Points forts
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {model.strengths.slice(0, 3).map((strength, idx) => (
                    <Chip 
                      key={idx} 
                      label={strength} 
                      size="small" 
                      variant="outlined"
                      icon={<Check fontSize="small" />}
                      sx={{ bgcolor: 'rgba(46, 125, 50, 0.1)' }}
                    />
                  ))}
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" display="block">
                  Qualité
                </Typography>
                <Rating value={model.rating.quality} precision={0.5} size="small" readOnly />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" display="block">
                  Vitesse
                </Typography>
                <Rating value={model.rating.speed} precision={0.5} size="small" readOnly />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="caption" display="block">
                  Polyvalence
                </Typography>
                <Rating value={model.rating.versatility} precision={0.5} size="small" readOnly />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="contained" 
                  size="small" 
                  fullWidth
                  href={`/generator?model=${model.key}`}
                >
                  Utiliser ce modèle
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleCompareToggle(model.key)}
                  color={compareModels.includes(model.key) ? "primary" : "inherit"}
                >
                  <Compare fontSize="small" />
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
  
  const renderComparisonTab = () => (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Modèles sélectionnés pour la comparaison
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {models.map((model) => (
            <Chip
              key={model.key}
              label={model.name}
              clickable
              color={compareModels.includes(model.key) ? "primary" : "default"}
              onClick={() => handleCompareToggle(model.key)}
              variant={compareModels.includes(model.key) ? "filled" : "outlined"}
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary">
          Sélectionnez jusqu'à 3 modèles pour les comparer
        </Typography>
      </Box>
      
      {compareModels.length > 0 ? (
        <>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Caractéristiques</TableCell>
                  {compareModels.map(modelKey => {
                    const model = models.find(m => m.key === modelKey);
                    return (
                      <TableCell key={modelKey} align="center">
                        <Typography variant="subtitle2">{model?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {model?.provider}
                        </Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {comparisonCriteria.map((criteria) => (
                  <TableRow key={criteria.name}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {criteria.icon}
                        <Tooltip title={criteria.description}>
                          <Box>
                            <Typography variant="body2">{criteria.name}</Typography>
                          </Box>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    {compareModels.map(modelKey => {
                      const model = models.find(m => m.key === modelKey);
                      const ratingKey = criteria.name === 'Qualité d\'image' 
                        ? 'quality' 
                        : criteria.name === 'Vitesse' 
                          ? 'speed' 
                          : criteria.name === 'Polyvalence'
                            ? 'versatility'
                            : 'creativity';
                      
                      return (
                        <TableCell key={`${modelKey}-${criteria.name}`} align="center">
                          <Rating 
                            value={model?.rating[ratingKey as keyof typeof model.rating] || 0} 
                            precision={0.5} 
                            readOnly 
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <Typography variant="body2">Points forts</Typography>
                  </TableCell>
                  {compareModels.map(modelKey => {
                    const model = models.find(m => m.key === modelKey);
                    return (
                      <TableCell key={`${modelKey}-strengths`}>
                        <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                          {model?.strengths.map((strength, idx) => (
                            <li key={idx}>
                              <Typography variant="body2">{strength}</Typography>
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2">Limitations</Typography>
                  </TableCell>
                  {compareModels.map(modelKey => {
                    const model = models.find(m => m.key === modelKey);
                    return (
                      <TableCell key={`${modelKey}-limitations`}>
                        <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                          {model?.limitations.map((limitation, idx) => (
                            <li key={idx}>
                              <Typography variant="body2">{limitation}</Typography>
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2">Cas d'utilisation</Typography>
                  </TableCell>
                  {compareModels.map(modelKey => {
                    const model = models.find(m => m.key === modelKey);
                    return (
                      <TableCell key={`${modelKey}-usecases`}>
                        <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                          {model?.typical_use_cases.map((useCase, idx) => (
                            <li key={idx}>
                              <Typography variant="body2">{useCase}</Typography>
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2">Spécifications</Typography>
                  </TableCell>
                  {compareModels.map(modelKey => {
                    const model = models.find(m => m.key === modelKey);
                    return (
                      <TableCell key={`${modelKey}-specs`}>
                        {model?.specs && Object.entries(model.specs).map(([key, value]) => (
                          <Box key={key} sx={{ mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {key}:
                            </Typography>
                            <Typography variant="body2">
                              {typeof value === 'boolean' 
                                ? value ? <Check fontSize="small" color="success" /> : <Close fontSize="small" color="error" />
                                : value
                              }
                            </Typography>
                          </Box>
                        ))}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          
          <Typography variant="h6" gutterBottom>
            Exemples de résultats
          </Typography>
          <Grid container spacing={2}>
            {compareModels.map(modelKey => {
              const model = models.find(m => m.key === modelKey);
              return (
                <Grid item xs={12} md={4} key={`${modelKey}-samples`}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {model?.name}
                      </Typography>
                    </CardContent>
                    {model?.sample_images && model.sample_images.map((img, idx) => (
                      <CardMedia
                        key={idx}
                        component="img"
                        height="200"
                        image={img}
                        alt={`Exemple ${idx+1} de ${model.name}`}
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      ) : (
        <Alert severity="info">
          Veuillez sélectionner au moins un modèle pour la comparaison.
        </Alert>
      )}
    </Box>
  );
  
  const renderRecommendationsTab = () => {
    const useCases = [
      { name: "Photographie professionnelle", keyword: "photo" },
      { name: "Illustrations artistiques", keyword: "artistique" },
      { name: "Projets commerciaux", keyword: "publicité" },
      { name: "Prototypage rapide", keyword: "prototype" },
    ];
    
    return (
      <Box>
        {useCases.map(useCase => {
          const recommendedModels = getRecommendedModels(useCase.keyword);
          return (
            <Box key={useCase.name} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {useCase.name}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {recommendedModels.length > 0 ? (
                  recommendedModels.map(model => (
                    <Grid item xs={12} md={6} key={`${useCase.name}-${model.key}`}>
                      <Card sx={{ display: 'flex' }}>
                        {model.sample_images && model.sample_images.length > 0 && (
                          <CardMedia
                            component="img"
                            sx={{ width: 140 }}
                            image={model.sample_images[0]}
                            alt={model.name}
                          />
                        )}
                        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                          <CardContent sx={{ flex: '1 0 auto' }}>
                            <Typography variant="subtitle1">
                              {model.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                              <StarRate fontSize="small" color="primary" />
                              <Typography variant="body2" color="text.secondary">
                                Recommandé pour cet usage
                              </Typography>
                            </Box>
                            <Typography variant="body2" noWrap>
                              {model.strengths[0]}
                            </Typography>
                          </CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                            <Button 
                              size="small" 
                              variant="contained"
                              href={`/generator?model=${model.key}`}
                            >
                              Utiliser
                            </Button>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      Aucun modèle spécifiquement recommandé pour cet usage.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          );
        })}
      </Box>
    );
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Modèles IA pour la génération d'images
          </Typography>
          <Tooltip title="Actualiser les modèles">
            <IconButton onClick={handleRefreshModels} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          Explorez et comparez les différents modèles d'IA disponibles pour la génération d'images
          de vélos fixie. Chaque modèle a ses forces et spécificités pour différents types de projets.
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="model tabs"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab icon={<Info />} label="Modèles disponibles" id="tab-0" />
              <Tab icon={<Compare />} label="Comparaison" id="tab-1" />
              <Tab icon={<StarRate />} label="Recommandations" id="tab-2" />
            </Tabs>
          </Box>
          
          <Box role="tabpanel" hidden={tabValue !== 0}>
            {tabValue === 0 && renderModelsList()}
          </Box>
          
          <Box role="tabpanel" hidden={tabValue !== 1}>
            {tabValue === 1 && renderComparisonTab()}
          </Box>
          
          <Box role="tabpanel" hidden={tabValue !== 2}>
            {tabValue === 2 && renderRecommendationsTab()}
          </Box>
        </>
      )}
    </Container>
  );
};

export default ModelsPage;

