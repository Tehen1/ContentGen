import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  CardMedia,
  FormControlLabel,
  Switch,
  Tooltip,
  Stack,
  Container,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Image,
  Send,
  Download,
  Refresh,
  Settings,
  Help,
  ExpandMore,
  ExpandLess,
  Lightbulb,
  ContentCopy,
  AutoAwesome,
  Psychology,
  Model,
} from '@mui/icons-material';
import {
  apiService,
  GenerateImageRequest,
  GenerateImageResponse,
  ModelsResponse,
  GeneratePromptRequest,
  GeneratePromptResponse,
  getErrorMessage,
  formatTimestamp,
} from '../services/api';

// Interface for available models
interface ModelOption {
  key: string;
  name: string;
  description: string;
  provider: string;
  capabilities?: string[];
  recommended?: boolean;
}

// Interface for model providers
interface ModelProvider {
  id: string;
  name: string;
  logo?: string;
  description: string;
}

// Interface for model parameters
interface ModelParameters {
  width: number;
  height: number;
  guidance?: number;
  steps?: number;
  quality?: string;
  style?: string;
  seed?: number | null;
  negativPrompt?: string;
}

const defaultPrompt = "Un vélo fixie futuriste avec cadre en carbone ultraléger, roues aerospoke néon, dans un environnement cyberpunk nocturne, éclairage cinématique";
const promptSuggestions = [
  "Vélo fixie avec cadre en titane, roues deep-dish, dans un studio minimaliste, photographie professionnelle",
  "Vélo fixie vintage avec cadre en acier patiné, selle en cuir, dans un paysage urbain au coucher du soleil",
  "Vélo fixie cyberpunk avec détails néon, roues lumineuses, dans une ville futuriste sous la pluie",
  "Vélo fixie artistique, design abstrait multicolore, fond épuré, style illustration digitale",
];

// Model providers
const providers: ModelProvider[] = [
  {
    id: 'all',
    name: 'Tous les modèles',
    description: 'Tous les modèles disponibles'
  },
  {
    id: 'replicate',
    name: 'Replicate',
    description: 'Services d\'IA générative via Replicate'
  },
  {
    id: 'openai',
    name: 'DALL-E (OpenAI)',
    description: 'Modèles DALL-E 2 et 3 d\'OpenAI'
  },
  {
    id: 'flux',
    name: 'Flux',
    description: 'Modèles Flux optimisés pour rapidité et qualité'
  },
  {
    id: 'google',
    name: 'Google',
    description: 'Modèles d\'IA de Google comme Imagen'
  },
  {
    id: 'bytedance',
    name: 'ByteDance',
    description: 'Modèles d\'IA de ByteDance comme SDXL-Lightning'
  }
];

// Default recommended models from the conversation history
const defaultModels: ModelOption[] = [
  {
    key: 'black-forest-labs/flux-kontext-pro',
    name: 'Flux Kontext Pro',
    description: 'Modèle performant pour images détaillées avec contexte complexe',
    provider: 'flux',
    capabilities: ['context-awareness', 'high-detail'],
    recommended: true
  },
  {
    key: 'flux-1.1-pro',
    name: 'Flux 1.1 Pro',
    description: 'Version améliorée de Flux avec équilibre entre vitesse et qualité',
    provider: 'flux',
    capabilities: ['balanced', 'versatile'],
    recommended: true
  },
  {
    key: 'flux-schnell',
    name: 'Flux Schnell',
    description: 'Version ultra-rapide de Flux pour génération instantanée',
    provider: 'flux',
    capabilities: ['speed', 'fast-iteration'],
    recommended: true
  },
  {
    key: 'minimax/image-01',
    name: 'MiniMax Image-01',
    description: 'Modèle optimisé pour l\'équilibre et la versatilité',
    provider: 'replicate',
    capabilities: ['balanced', 'versatile']
  },
  {
    key: 'bytedance/sdxl-lightning-4step',
    name: 'SDXL Lightning (4 step)',
    description: 'Version ultra-rapide de SDXL par ByteDance',
    provider: 'bytedance',
    capabilities: ['speed', 'rapid-prototyping'],
    recommended: true
  },
  {
    key: 'google/imagen-4',
    name: 'Google Imagen 4',
    description: 'Modèle avancé de Google pour images photoréalistes',
    provider: 'google',
    capabilities: ['photorealism', 'high-quality'],
    recommended: true
  },
  {
    key: 'openai/dalle-3',
    name: 'DALL-E 3',
    description: 'Dernière version du modèle d\'OpenAI pour images créatives',
    provider: 'openai',
    capabilities: ['creative', 'instruction-following'],
    recommended: true
  }
];

const ImageGeneration: React.FC = () => {
  // States for generation parameters
  const [prompt, setPrompt] = useState<string>('');
  const [optimizedPrompt, setOptimizedPrompt] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('flux-1.1-pro');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [parameters, setParameters] = useState<ModelParameters>({
    width: 1024,
    height: 1024,
    guidance: 7.5,
    steps: 28,
    quality: 'standard',
    style: 'photo',
    seed: null,
    negativPrompt: ''
  });
  const [numOutputs, setNumOutputs] = useState<number>(1);
  const [useOptimizedPrompt, setUseOptimizedPrompt] = useState<boolean>(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  // States for results and loading
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<GenerateImageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<ModelOption[]>(defaultModels);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState<boolean>(false);

  // Load available models on startup
  useEffect(() => {
    async function loadModels() {
      try {
        const response = await apiService.getModels();
        
        // Transform model data into options for the selector
        const modelOptions: ModelOption[] = [];
        
        if (response.models) {
          Object.entries(response.models).forEach(([key, model]) => {
            const provider = determineProvider(key);
            modelOptions.push({
              key,
              name: response.model_info?.[key]?.name || key,
              description: response.model_info?.[key]?.description || '',
              provider,
              capabilities: response.model_info?.[key]?.capabilities || [],
              recommended: defaultModels.some(m => m.key === key && m.recommended)
            });
          });
        }
        
        // If we got models from the API, use them; otherwise fall back to defaults
        if (modelOptions.length > 0) {
          setModels(modelOptions);
        }
      } catch (err) {
        console.error('Error loading models:', err);
        setError('Erreur lors du chargement des modèles: ' + getErrorMessage(err));
        // Fall back to default models in case of error
      }
    }
    
    loadModels();
  }, []);

  // Determine provider based on model key
  const determineProvider = (key: string): string => {
    if (key.includes('flux')) return 'flux';
    if (key.includes('openai') || key.includes('dalle')) return 'openai';
    if (key.includes('google')) return 'google';
    if (key.includes('bytedance')) return 'bytedance';
    if (key.includes('black-forest-labs')) return 'flux';
    return 'replicate'; // Default provider
  };

  // Filter models based on selected provider
  const filteredModels = selectedProvider === 'all' 
    ? models 
    : models.filter(model => model.provider === selectedProvider);

  // Handle parameter change
  const handleParameterChange = (param: keyof ModelParameters, value: any) => {
    setParameters(prev => ({
      ...prev,
      [param]: value
    }));
  };

  // Generate image
  const handleGenerateImage = async () => {
    if (!prompt && !optimizedPrompt) {
      setError('Veuillez entrer un prompt ou optimiser votre description');
      return;
    }
    
    try {
      setIsGenerating(true);
      setError(null);
      setGeneratedImage(null);
      
      const finalPrompt = useOptimizedPrompt && optimizedPrompt ? optimizedPrompt : prompt;
      
      const request: GenerateImageRequest = {
        prompt: finalPrompt,
        model: selectedModel,
        width: parameters.width,
        height: parameters.height,
        num_outputs: numOutputs,
        seed: parameters.seed || undefined,
      };
      
      // Add advanced parameters based on model type
      if (selectedModel.includes('flux') || selectedModel.includes('sdxl')) {
        request.guidance = parameters.guidance;
        request.steps = parameters.steps;
      }

      // Add quality parameter for DALL-E models
      if (selectedModel.includes('dalle') || selectedModel.includes('openai')) {
        request.quality = parameters.quality;
      }

      // Add style parameter for certain models
      if (selectedModel.includes('imagen') || selectedModel.includes('openai')) {
        request.style = parameters.style;
      }

      // Add negative prompt if provided
      if (parameters.negativPrompt) {
        request.negative_prompt = parameters.negativPrompt;
      }
      
      const response = await apiService.generateImage(request);
      setGeneratedImage(response);
    } catch (err) {
      setError('Erreur lors de la génération de l\'image: ' + getErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };

  // Optimize prompt
  const handleOptimizePrompt = async () => {
    if (!prompt) {
      setError('Veuillez entrer une description pour l\'optimisation');
      return;
    }
    
    try {
      setIsOptimizing(true);
      setError(null);
      
      const request: GeneratePromptRequest = {
        description: prompt,
        style: parameters.style || "realistic",
        complexity: "medium",
      };
      
      const response = await apiService.generatePrompt(request);
      setOptimizedPrompt(response.prompt);
      setUseOptimizedPrompt(true);
    } catch (err) {
      setError('Erreur lors de l\'optimisation du prompt: ' + getErrorMessage(err));
    } finally {
      setIsOptimizing(false);
    }
  };

  // Download generated image
  const handleDownloadImage = async (imageUrl: string) => {
    if (!imageUrl) return;
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `fixie-${selectedModel.split('/').pop()}-${timestamp}.png`;
      await apiService.downloadImage(imageUrl, filename);
    } catch (err) {
      setError('Erreur lors du téléchargement: ' + getErrorMessage(err));
    }
  };

  // Copy prompt to clipboard
  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  // Select a prompt suggestion
  const handleSelectSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
    setShowSuggestions(false);
  };

  // Use a random seed
  const handleRandomSeed = () => {
    handleParameterChange('seed', Math.floor(Math.random() * 1000000));
  };

  // Reset the form
  const handleReset = () => {
    setPrompt('');
    setOptimizedPrompt('');
    setUseOptimizedPrompt(false);
    setGeneratedImage(null);
    setError(null);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Générateur d'Images IA
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Créez des images de vélos fixie à partir de descriptions textuelles en utilisant les modèles IA les plus avancés.
          Optimisez vos prompts pour obtenir des résultats exceptionnels.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Configuration panel */}
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Configuration
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {/* Model provider tabs */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Fournisseur de modèle
              </Typography>
              <Tabs
                value={selectedProvider}
                onChange={(_, value) => setSelectedProvider(value)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 2 }}
              >
                {providers.map(provider => (
                  <Tab 
                    key={provider.id} 
                    value={provider.id} 
                    label={provider.name}
                    disabled={isGenerating}
                  />
                ))}
              </Tabs>
              
              <Typography variant="caption" color="text.secondary">
                {providers.find(p => p.id === selectedProvider)?.description}
              </Typography>
            </Box>

            {/* Model selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="model-select-label">Modèle IA</InputLabel>
              <Select
                labelId="model-select-label"
                id="model-select"
                value={selectedModel}
                label="Modèle IA"
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isGenerating}
              >
                {filteredModels.length > 0 ? (
                  filteredModels.map((model) => (
                    <MenuItem 
                      key={model.key} 
                      value={model.key}
                      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Typography variant="body1">{model.name}</Typography>
                        {model.recommended && (
                          <Chip 
                            label="Recommandé" 
                            size="small" 
                            color="success" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {model.description}
                      </Typography>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    Aucun modèle disponible pour ce fournisseur
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            {/* Prompt input */}
            <TextField
              label="Description"
              multiline
              rows={4}
              fullWidth
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={defaultPrompt}
              disabled={isGenerating}
              sx={{ mb: 1 }}
              InputProps={{
                endAdornment: (
                  <Tooltip title="Suggestions de prompts">
                    <IconButton 
                      size="small" 
                      onClick={() => setShowSuggestions(!showSuggestions)}
                      sx={{ mr: 1 }}
                    >
                      <Lightbulb />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />

            {/* Prompt suggestions */}
            {showSuggestions && (
              <Box sx={{ mb: 3, mt: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Suggestions de prompts:
                </Typography>
                <Stack spacing={1}>
                  {promptSuggestions.map((suggestion, index) => (
                    <Chip
                      key={index}
                      label={suggestion.length > 50 ? suggestion.substring(0, 47) + '...' : suggestion}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      clickable
                      variant="outlined"
                      color="primary"
                      sx={{ maxWidth: '100%', height: 'auto', py: 0.5 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Prompt optimization */}
            <Box sx={{ display: 'flex', mb: 3, gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleOptimizePrompt}
                disabled={isOptimizing || isGenerating || !prompt}
                startIcon={isOptimizing ? <CircularProgress size={16} /> : <AutoAwesome />}
                sx={{ flexGrow: 1 }}
              >
                {isOptimizing ? 'Optimisation...' : 'Optimiser le prompt'}
              </Button>
              
              <Tooltip title="L'optimisation du prompt améliore la qualité des résultats en ajoutant des détails techniques et stylistiques">
                <IconButton>
                  <Help fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Optimized prompt */}
            {optimizedPrompt && (
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'rgba(106, 27, 154, 0.08)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="primary" fontWeight="bold">
                    Prompt optimisé
                  </Typography>
                  <Tooltip title={copiedToClipboard ? "Copié!" : "Copier le prompt"}>
                    <IconButton size="small" onClick={() => handleCopyPrompt(optimizedPrompt)}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="body2">
                  {optimizedPrompt}
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useOptimizedPrompt}
                      onChange={(e) => setUseOptimizedPrompt(e.target.checked)}
                      disabled={isGenerating}
                    />
                  }
                  label="Utiliser le prompt optimisé"
                  sx={{ mt: 1 }}
                />
              </Paper>
            )}

            {/* Image dimensions */}
            <Typography variant="subtitle2" gutterBottom>
              Dimensions de l'image
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="width-label">Largeur</InputLabel>
                  <Select
                    labelId="width-label"
                    value={parameters.width}
                    label="Largeur"
                    onChange={(e) => handleParameterChange('width', Number(e.target.value))}
                    disabled={isGenerating}
                  >
                    <MenuItem value={512}>512px</MenuItem>
                    <MenuItem value={768}>768px</MenuItem>
                    <MenuItem value={1024}>1024px</MenuItem>
                    <MenuItem value={1280}>1280px</MenuItem>
                    <MenuItem value={1536}>1536px</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="height-label">Hauteur</InputLabel>
                  <Select
                    labelId="height-label"
                    value={parameters.height}
                    label="Hauteur"
                    onChange={(e) => handleParameterChange('height', Number(e.target.value))}
                    disabled={isGenerating}
                  >
                    <MenuItem value={512}>512px</MenuItem>
                    <MenuItem value={768}>768px</MenuItem>
                    <MenuItem value={1024}>1024px</MenuItem>
                    <MenuItem value={1280}>1280px</MenuItem>
                    <MenuItem value={1536}>1536px</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Model-specific settings */}
            {selectedModel && (
              <Accordion 
                expanded={showAdvancedSettings}
                onChange={() => setShowAdvancedSettings(!showAdvancedSettings)}
                sx={{ mb: 3, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Settings fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">
                      Paramètres avancés
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {/* Style selection for DALL-E and Imagen */}
                  {(selectedModel.includes('dalle') || selectedModel.includes('openai') || selectedModel.includes('imagen')) && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Style visuel
                      </Typography>
                      <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                        <Select
                          value={parameters.style}
                          onChange={(e) => handleParameterChange('style', e.target.value)}
                          disabled={isGenerating}
                        >
                          <MenuItem value="photo">Photographique</MenuItem>
                          <MenuItem value="digital-art">Art numérique</MenuItem>
                          <MenuItem value="illustration">Illustration</MenuItem>
                          <MenuItem value="3d-render">Rendu 3D</MenuItem>
                          <MenuItem value="pixel-art">Pixel Art</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}

                  {/* Quality selection for DALL-E */}
                  {(selectedModel.includes('dalle') || selectedModel.includes('openai')) && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Qualité
                      </Typography>
                      <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                        <Select
                          value={parameters.quality}
                          onChange={(e) => handleParameterChange('quality', e.target.value)}
                          disabled={isGenerating}
                        >
                          <MenuItem value="standard">Standard</MenuItem>
                          <MenuItem value="hd">HD</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}

                  {/* Guidance scale for Flux and SDXL models */}
                  {(selectedModel.includes('flux') || selectedModel.includes('sdxl')) && (
                    <Box sx={{ mb: 3 }}>
                      <Typography gutterBottom>
                        Guidance Scale: {parameters.guidance}
                      </Typography>
                      <Slider
                        value={parameters.guidance}
                        onChange={(_, value) => handleParameterChange('guidance', value as number)}
                        min={1}
                        max={20}
                        step={0.5}
                        valueLabelDisplay="auto"
                        disabled={isGenerating}
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Détermine à quel point l'IA suit strictement votre prompt. Une valeur plus élevée = plus fidèle au prompt.
                      </Typography>
                    </Box>
                  )}

                  {/* Inference steps for Flux and SDXL models */}
                  {(selectedModel.includes('flux') || selectedModel.includes('sdxl')) && (
                    <Box sx={{ mb: 3 }}>
                      <Typography gutterBottom>
                        Étapes d'inférence: {parameters.steps}
                      </Typography>
                      <Slider
                        value={parameters.steps}
                        onChange={(_, value) => handleParameterChange('steps', value as number)}
                        min={10}
                        max={50}
                        step={1}
                        valueLabelDisplay="auto"
                        disabled={isGenerating}
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Nombre d'étapes de génération. Plus de pas = plus de détails mais temps de génération plus long.
                      </Typography>
                    </Box>
                  )}

                  {/* Negative prompt for supported models */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Prompt négatif
                    </Typography>
                    <TextField
                      multiline
                      rows={2}
                      fullWidth
                      value={parameters.negativPrompt}
                      onChange={(e) => handleParameterChange('negativPrompt', e.target.value)}
                      placeholder="Éléments à éviter dans l'image (optionnel)"
                      disabled={isGenerating}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Décrivez ce que vous ne voulez PAS voir dans l'image (ex: "flou, déformé, texte")
                    </Typography>
                  </Box>

                  {/* Seed control */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                      label="Seed"
                      type="number"
                      value={parameters.seed === null ? '' : parameters.seed}
                      onChange={(e) => handleParameterChange('seed', e.target.value === '' ? null : Number(e.target.value))}
                      size="small"
                      disabled={isGenerating}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flexGrow: 1 }}
                    />
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={handleRandomSeed}
                      disabled={isGenerating}
                      startIcon={<Refresh />}
                    >
                      Aléatoire
                    </Button>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Le seed permet de reproduire exactement la même image avec les mêmes paramètres.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleGenerateImage}
                disabled={isGenerating || (!prompt && !optimizedPrompt)}
                startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <Send />}
                sx={{ py: 1.5 }}
              >
                {isGenerating ? 'Génération en cours...' : 'Générer l\'image'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={isGenerating}
                startIcon={<Refresh />}
              >
                Réinitialiser
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Result panel */}
        <Grid item xs={12} md={7}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Résultat
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {isGenerating ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: 400,
                gap: 3
              }}>
                <CircularProgress size={60} />
                <Typography variant="body1" color="text.secondary">
                  Génération de l'image en cours...
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Cela peut prendre jusqu'à {selectedModel.includes('lightning') || selectedModel.includes('schnell') ? '10' : '30'} secondes selon le modèle et la taille
                </Typography>
              </Box>
            ) : generatedImage ? (
              <Box>
                {/* Generated image */}
                {generatedImage.images && generatedImage.images.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Card>
                      <CardMedia
                        component="img"
                        image={generatedImage.images[0]}
                        alt="Image générée"
                        sx={{ 
                          maxHeight: 600,
                          objectFit: 'contain',
                          backgroundColor: '#0a0a0a',
                        }}
                      />
                      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Chip 
                            label={models.find(m => m.key === generatedImage.model_used)?.name || generatedImage.model_used} 
                            color="primary" 
                            size="small"
                            variant="outlined"
                            icon={<Model fontSize="small" />}
                          />
                          <Chip 
                            label={`${parameters.width}x${parameters.height}`} 
                            size="small"
                            variant="outlined"
                          />
                          {parameters.style && (
                            <Chip 
                              label={parameters.style} 
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        <Button
                          variant="contained"
                          startIcon={<Download />}
                          onClick={() => handleDownloadImage(generatedImage.images[0])}
                        >
                          Télécharger
                        </Button>
                      </CardActions>
                    </Card>
                  </Box>
                )}

                {/* Metadata */}
                <Typography variant="subtitle2" gutterBottom>
                  Informations
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="primary">
                          Prompt utilisé
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {generatedImage.prompt}
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="primary">
                              Modèle
                            </Typography>
                            <Typography variant="body2">
                              {models.find(m => m.key === generatedImage.model_used)?.name || generatedImage.model_used}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="primary">
                              Généré le
                            </Typography>
                            <Typography variant="body2">
                              {formatTimestamp(generatedImage.timestamp)}
                            </Typography>
                          </Grid>
                          {generatedImage.parameters && (
                            <>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="primary">
                                  Dimensions
                                </Typography>
                                <Typography variant="body2">
                                  {generatedImage.parameters.width}x{generatedImage.parameters.height}
                                </Typography>
                              </Grid>
                              {generatedImage.parameters.seed && (
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" color="primary">
                                    Seed
                                  </Typography>
                                  <Typography variant="body2">
                                    {generatedImage.parameters.seed}
                                  </Typography>
                                </Grid>
                              )}
                              {generatedImage.parameters.guidance && (
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" color="primary">
                                    Guidance
                                  </Typography>
                                  <Typography variant="body2">
                                    {generatedImage.parameters.guidance}
                                  </Typography>
                                </Grid>
                              )}
                              {generatedImage.parameters.steps && (
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" color="primary">
                                    Étapes
                                  </Typography>
                                  <Typography variant="body2">
                                    {generatedImage.parameters.steps}
                                  </Typography>
                                </Grid>
                              )}
                            </>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: 400,
                textAlign: 'center',
                color: 'text.secondary',
                gap: 2
              }}>
                <Image sx={{ fontSize: 80, opacity: 0.2 }} />
                <Typography variant="h6" color="text.secondary">
                  Pas encore d'image générée
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450 }}>
                  Entrez un prompt décrivant l'image de vélo fixie que vous souhaitez créer, 
                  sélectionnez un modèle et cliquez sur "Générer l'image"
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ImageGeneration;

