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

// Interface pour les modèles disponibles
interface ModelOption {
  key: string;
  name: string;
  description: string;
}

const defaultPrompt = "Un vélo fixie futuriste avec cadre en carbone ultraléger, roues aerospoke néon, dans un environnement cyberpunk nocturne, éclairage cinématique";
const promptSuggestions = [
  "Vélo fixie avec cadre en titane, roues deep-dish, dans un studio minimaliste, photographie professionnelle",
  "Vélo fixie vintage avec cadre en acier patiné, selle en cuir, dans un paysage urbain au coucher du soleil",
  "Vélo fixie cyberpunk avec détails néon, roues lumineuses, dans une ville futuriste sous la pluie",
  "Vélo fixie artistique, design abstrait multicolore, fond épuré, style illustration digitale",
];

const ImageGenerator: React.FC = () => {
  // États pour les paramètres de génération
  const [prompt, setPrompt] = useState<string>('');
  const [optimizedPrompt, setOptimizedPrompt] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('flux-1.1-pro');
  const [width, setWidth] = useState<number>(1024);
  const [height, setHeight] = useState<number>(1024);
  const [numOutputs, setNumOutputs] = useState<number>(1);
  const [guidance, setGuidance] = useState<number>(7.5);
  const [steps, setSteps] = useState<number>(28);
  const [useOptimizedPrompt, setUseOptimizedPrompt] = useState<boolean>(false);
  const [seed, setSeed] = useState<number | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  // États pour les résultats et le chargement
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<GenerateImageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState<boolean>(false);

  // Charger les modèles disponibles au démarrage
  useEffect(() => {
    async function loadModels() {
      try {
        const response = await apiService.getModels();
        
        // Transformer les données des modèles en options pour le sélecteur
        const modelOptions: ModelOption[] = [];
        
        if (response.models) {
          Object.entries(response.models).forEach(([key, model]) => {
            modelOptions.push({
              key,
              name: response.model_info?.[key]?.name || key,
              description: response.model_info?.[key]?.description || '',
            });
          });
        }
        
        setModels(modelOptions);
      } catch (err) {
        setError('Erreur lors du chargement des modèles: ' + getErrorMessage(err));
      }
    }
    
    loadModels();
  }, []);

  // Génération de l'image
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
        width,
        height,
        num_outputs: numOutputs,
        seed: seed || undefined,
      };
      
      // Ajouter les paramètres avancés pour certains modèles
      if (selectedModel.includes('flux') || selectedModel === 'sdxl') {
        request.guidance = guidance;
        request.steps = steps;
      }
      
      const response = await apiService.generateImage(request);
      setGeneratedImage(response);
    } catch (err) {
      setError('Erreur lors de la génération de l\'image: ' + getErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };

  // Optimisation du prompt
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
        style: "realistic",
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

  // Téléchargement de l'image générée
  const handleDownloadImage = async (imageUrl: string) => {
    if (!imageUrl) return;
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `fixie-${selectedModel}-${timestamp}.png`;
      await apiService.downloadImage(imageUrl, filename);
    } catch (err) {
      setError('Erreur lors du téléchargement: ' + getErrorMessage(err));
    }
  };

  // Copier le prompt dans le presse-papier
  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  // Sélectionner une suggestion de prompt
  const handleSelectSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
    setShowSuggestions(false);
  };

  // Utilisation d'un seed aléatoire
  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  // Réinitialiser le formulaire
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
          Créez des images à partir de descriptions textuelles en utilisant les modèles IA les plus avancés.
          Optimisez vos prompts pour obtenir des résultats exceptionnels.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Panneau de configuration */}
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Configuration
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {/* Sélection du modèle */}
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
                {models.map((model) => (
                  <MenuItem 
                    key={model.key} 
                    value={model.key}
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <Typography variant="body1">{model.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {model.description}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Entrée de prompt */}
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

            {/* Suggestions de prompts */}
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

            {/* Optimisation de prompt */}
            <Box sx={{ display: 'flex', mb: 3, gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleOptimizePrompt}
                disabled={isOptimizing || isGenerating || !prompt}
                startIcon={isOptimizing ? <CircularProgress size={16} /> : <Lightbulb />}
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

            {/* Prompt optimisé */}
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

            {/* Taille de l'image */}
            <Typography variant="subtitle2" gutterBottom>
              Dimensions de l'image
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="width-label">Largeur</InputLabel>
                  <Select
                    labelId="width-label"
                    value={width}
                    label="Largeur"
                    onChange={(e) => setWidth(Number(e.target.value))}
                    disabled={isGenerating}
                  >
                    <MenuItem value={512}>512px</MenuItem>
                    <MenuItem value={768}>768px</MenuItem>
                    <MenuItem value={1024}>1024px</MenuItem>
                    <MenuItem value={1280}>1280px</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="height-label">Hauteur</InputLabel>
                  <Select
                    labelId="height-label"
                    value={height}
                    label="Hauteur"
                    onChange={(e) => setHeight(Number(e.target.value))}
                    disabled={isGenerating}
                  >
                    <MenuItem value={512}>512px</MenuItem>
                    <MenuItem value={768}>768px</MenuItem>
                    <MenuItem value={1024}>1024px</MenuItem>
                    <MenuItem value={1280}>1280px</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Paramètres avancés (toggle) */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                mb: 2
              }}
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            >
              <Settings fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="subtitle2">
                Paramètres avancés
              </Typography>
              {showAdvancedSettings ? <ExpandLess /> : <ExpandMore />}
            </Box>

            {/* Paramètres avancés (contenu) */}
            {showAdvancedSettings && (
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>
                  Guidance Scale: {guidance}
                </Typography>
                <Slider
                  value={guidance}
                  onChange={(_, value) => setGuidance(value as number)}
                  min={1}
                  max={20}
                  step={0.5}
                  valueLabelDisplay="auto"
                  disabled={isGenerating}
                  sx={{ mb: 2 }}
                />

                <Typography gutterBottom>
                  Étapes d'inférence: {steps}
                </Typography>
                <Slider
                  value={steps}
                  onChange={(_, value) => setSteps(value as number)}
                  min={10}
                  max={50}
                  step={1}
                  valueLabelDisplay="auto"
                  disabled={isGenerating}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TextField
                    label="Seed"
                    type="number"
                    value={seed === null ? '' : seed}
                    onChange={(e) => setSeed(e.target.value === '' ? null : Number(e.target.value))}
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
              </Box>
            )}

            {/* Boutons d'action */}
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

        {/* Panneau de résultat */}
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
                  Cela peut prendre jusqu'à 30 secondes selon le modèle et la taille
                </Typography>
              </Box>
            ) : generatedImage ? (
              <Box>
                {/* Image générée */}
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
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            label={models.find(m => m.key === generatedImage.model_used)?.name || generatedImage.model_used} 
                            color="primary" 
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                          <Chip 
                            label={`${width}x${height}`} 
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
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

                {/* Métadonnées */}
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
                  Entrez un prompt décrivant l'image que vous souhaitez créer, 
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

export default ImageGenerator;

