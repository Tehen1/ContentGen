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
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  CardMedia,
  Tooltip,
  Stack,
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add,
  Delete,
  PlayArrow,
  Download,
  Refresh,
  CloudDownload,
  ExpandMore,
  DragIndicator,
  CheckCircle,
  Error,
  Pending,
  Warning,
  Image,
  FileCopy,
} from '@mui/icons-material';
import {
  apiService,
  BatchGenerateRequest,
  BatchGenerateResponse,
  BatchResult,
  ModelsResponse,
  getErrorMessage,
  formatTimestamp,
} from '../services/api';

// Interface pour les modèles disponibles
interface ModelOption {
  key: string;
  name: string;
  description: string;
}

// Interface pour nos items de lot avec informations supplémentaires
interface BatchPromptItem {
  id: string;
  prompt: string;
  result?: BatchResult;
}

const defaultPrompts = [
  "Vélo fixie urbain avec cadre en aluminium, roues deep-dish, photographie professionnelle de rue",
  "Vélo fixie minimaliste blanc avec détails en or, fond épuré, éclairage studio",
  "Vélo fixie vintage avec cadre en acier patiné, selle en cuir, dans un atelier de vélo"
];

const BatchGenerator: React.FC = () => {
  // États pour les prompts
  const [prompts, setPrompts] = useState<BatchPromptItem[]>([]);
  const [newPrompt, setNewPrompt] = useState<string>('');
  
  // États pour les paramètres de génération
  const [selectedModel, setSelectedModel] = useState<string>('flux-schnell');
  const [width, setWidth] = useState<number>(512);
  const [height, setHeight] = useState<number>(512);
  
  // États pour les résultats et le chargement
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationResults, setGenerationResults] = useState<BatchGenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [downloadingAll, setDownloadingAll] = useState<boolean>(false);

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

  // Initialiser avec des prompts par défaut
  useEffect(() => {
    const initialPrompts = defaultPrompts.map((prompt, index) => ({
      id: `prompt-${index}`,
      prompt,
    }));
    setPrompts(initialPrompts);
  }, []);

  // Ajouter un nouveau prompt
  const handleAddPrompt = () => {
    if (!newPrompt.trim()) return;
    
    const newItem: BatchPromptItem = {
      id: `prompt-${Date.now()}`,
      prompt: newPrompt,
    };
    
    setPrompts([...prompts, newItem]);
    setNewPrompt('');
  };

  // Supprimer un prompt
  const handleRemovePrompt = (id: string) => {
    setPrompts(prompts.filter(p => p.id !== id));
  };

  // Modifier un prompt existant
  const handleUpdatePrompt = (id: string, value: string) => {
    setPrompts(prompts.map(p => p.id === id ? { ...p, prompt: value } : p));
  };

  // Génération des images en lot
  const handleGenerateBatch = async () => {
    if (prompts.length === 0) {
      setError('Veuillez ajouter au moins un prompt.');
      return;
    }
    
    if (prompts.length > 10) {
      setError('Maximum 10 prompts par lot pour éviter les limitations d\'API.');
      return;
    }
    
    try {
      setIsGenerating(true);
      setError(null);
      setGenerationResults(null);
      setOverallProgress(0);
      
      const promptTexts = prompts.map(p => p.prompt);
      
      const request: BatchGenerateRequest = {
        prompts: promptTexts,
        model: selectedModel,
        width,
        height,
      };
      
      // Simuler une progression 
      const progressInterval = setInterval(() => {
        setOverallProgress(prev => {
          // Maximum 90% avant la réponse réelle
          return Math.min(prev + 5, 90);
        });
      }, 500);
      
      const response = await apiService.batchGenerate(request);
      
      clearInterval(progressInterval);
      setOverallProgress(100);
      
      // Mettre à jour les prompts avec les résultats
      const updatedPrompts = [...prompts];
      response.results.forEach(result => {
        const index = result.index;
        if (index >= 0 && index < updatedPrompts.length) {
          updatedPrompts[index] = {
            ...updatedPrompts[index],
            result,
          };
        }
      });
      
      setPrompts(updatedPrompts);
      setGenerationResults(response);
    } catch (err) {
      setError('Erreur lors de la génération en lot: ' + getErrorMessage(err));
      setOverallProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  // Télécharger une image générée
  const handleDownloadImage = async (imageUrl: string, promptIndex: number) => {
    if (!imageUrl) return;
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `fixie-batch-${selectedModel}-${promptIndex}-${timestamp}.png`;
      await apiService.downloadImage(imageUrl, filename);
    } catch (err) {
      setError('Erreur lors du téléchargement: ' + getErrorMessage(err));
    }
  };

  // Télécharger toutes les images générées
  const handleDownloadAll = async () => {
    if (!generationResults) return;
    
    try {
      setDownloadingAll(true);
      
      // Télécharger chaque image réussie
      const successfulResults = generationResults.results.filter(r => r.success && r.image_url);
      
      for (let i = 0; i < successfulResults.length; i++) {
        const result = successfulResults[i];
        if (result.image_url) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `fixie-batch-${selectedModel}-${result.index}-${timestamp}.png`;
          await apiService.downloadImage(result.image_url, filename);
          
          // Petite pause entre les téléchargements
          if (i < successfulResults.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      }
    } catch (err) {
      setError('Erreur lors du téléchargement groupé: ' + getErrorMessage(err));
    } finally {
      setDownloadingAll(false);
    }
  };

  // Réinitialiser les prompts
  const handleReset = () => {
    if (isGenerating) return;
    
    setPrompts([]);
    setGenerationResults(null);
    setError(null);
    setOverallProgress(0);
  };

  // Copier les prompts au format texte
  const handleCopyPrompts = () => {
    const promptsText = prompts.map(p => p.prompt).join('\n\n');
    navigator.clipboard.writeText(promptsText);
  };

  // Générer un statut visuel pour chaque résultat
  const getStatusChip = (item: BatchPromptItem) => {
    if (!item.result) {
      return <Chip icon={<Pending />} label="En attente" color="default" size="small" />;
    }
    
    if (isGenerating) {
      return <Chip icon={<Pending />} label="En cours" color="warning" size="small" />;
    }
    
    if (item.result.success) {
      return <Chip icon={<CheckCircle />} label="Réussi" color="success" size="small" />;
    } else {
      return (
        <Tooltip title={item.result.error || "Erreur inconnue"}>
          <Chip icon={<Error />} label="Échec" color="error" size="small" />
        </Tooltip>
      );
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Générateur d'Images en Lot
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Générez plusieurs images simultanément pour maximiser votre productivité.
          Idéal pour créer rapidement des variations ou tester différents concepts.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {generationResults && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Résumé de génération: {generationResults.summary.successful} réussis, {generationResults.summary.failed} échoués sur {generationResults.summary.total} prompts.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Panneau de configuration */}
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Liste des prompts ({prompts.length})
              </Typography>
              <Box>
                <Tooltip title="Copier tous les prompts">
                  <IconButton 
                    size="small" 
                    onClick={handleCopyPrompts}
                    disabled={prompts.length === 0 || isGenerating}
                    sx={{ mr: 1 }}
                  >
                    <FileCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Réinitialiser">
                  <IconButton 
                    size="small" 
                    onClick={handleReset}
                    disabled={prompts.length === 0 || isGenerating}
                    color="error"
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {/* Liste des prompts */}
            <List sx={{ maxHeight: '300px', overflow: 'auto', mb: 3 }}>
              {prompts.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary="Aucun prompt ajouté" 
                    secondary="Utilisez le champ ci-dessous pour ajouter des prompts" 
                    sx={{ color: 'text.secondary', textAlign: 'center' }}
                  />
                </ListItem>
              ) : (
                prompts.map((item, index) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      mb: 1,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <DragIndicator color="disabled" fontSize="small" />
                      <Typography variant="body2" sx={{ width: 25 }}>
                        {index + 1}.
                      </Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <TextField
                        value={item.prompt}
                        onChange={(e) => handleUpdatePrompt(item.id, e.target.value)}
                        fullWidth
                        multiline
                        size="small"
                        maxRows={2}
                        disabled={isGenerating}
                        sx={{ mb: 1 }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getStatusChip(item)}
                        {item.result?.image_url && (
                          <Tooltip title="Télécharger cette image">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleDownloadImage(item.result!.image_url!, item.result!.index)}
                              sx={{ ml: 1 }}
                            >
                              <Download fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemovePrompt(item.id)}
                        disabled={isGenerating}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              )}
            </List>

            {/* Ajout de nouveau prompt */}
            <Box sx={{ display: 'flex', mb: 3, gap: 1 }}>
              <TextField
                label="Nouveau prompt"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                fullWidth
                disabled={isGenerating}
                placeholder="Décrivez l'image à générer..."
              />
              <Button
                variant="outlined"
                onClick={handleAddPrompt}
                disabled={isGenerating || !newPrompt.trim()}
                startIcon={<Add />}
                sx={{ minWidth: '120px' }}
              >
                Ajouter
              </Button>
            </Box>

            {/* Paramètres de génération */}
            <Accordion defaultExpanded sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">Paramètres de génération</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="batch-model-select-label">Modèle IA</InputLabel>
                  <Select
                    labelId="batch-model-select-label"
                    id="batch-model-select"
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

                <Typography variant="subtitle2" gutterBottom>
                  Dimensions de l'image
                </Typography>
                <Grid container spacing={2} sx={{ mb: 1 }}>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="batch-width-label">Largeur</InputLabel>
                      <Select
                        labelId="batch-width-label"
                        value={width}
                        label="Largeur"
                        onChange={(e) => setWidth(Number(e.target.value))}
                        disabled={isGenerating}
                      >
                        <MenuItem value={512}>512px</MenuItem>
                        <MenuItem value={768}>768px</MenuItem>
                        <MenuItem value={1024}>1024px</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="batch-height-label">Hauteur</InputLabel>
                      <Select
                        labelId="batch-height-label"
                        value={height}
                        label="Hauteur"
                        onChange={(e) => setHeight(Number(e.target.value))}
                        disabled={isGenerating}
                      >
                        <MenuItem value={512}>512px</MenuItem>
                        <MenuItem value={768}>768px</MenuItem>
                        <MenuItem value={1024}>1024px</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Alert severity="info" sx={{ mt: 1 }}>
                  Pour les lots, il est recommandé d'utiliser des tailles réduites (512px) et le modèle Flux Schnell pour une génération plus rapide.
                </Alert>
              </AccordionDetails>
            </Accordion>

            {/* Boutons d'action */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleGenerateBatch}
                disabled={isGenerating || prompts.length === 0}
                startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                sx={{ py: 1.5 }}
              >
                {isGenerating ? 'Génération en cours...' : 'Générer le lot'}
              </Button>

              {generationResults && generationResults.summary.successful > 0 && (
                <Button
                  variant="outlined"
                  onClick={handleDownloadAll}
                  disabled={isGenerating || downloadingAll}
                  startIcon={downloadingAll ? <CircularProgress size={20} /> : <CloudDownload />}
                >
                  {downloadingAll ? 'Téléchargement...' : 'Tout télécharger'}
                </Button>
              )}
            </Box>

            {/* Barre de progression */}
            {isGenerating && (
              <Box sx={{ width: '100%', mt: 3 }}>
                <LinearProgress variant="determinate" value={overallProgress} />
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                  {overallProgress}% - Traitement des images...
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Panneau de résultat */}
        <Grid item xs={12} md={7}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Résultats
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
                  Génération des images en cours...
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Traitement des prompts {overallProgress}% terminé
                </Typography>
              </Box>
            ) : generationResults ? (
              <Grid container spacing={2}>
                {generationResults.results.map((result) => (
                  <Grid item xs={12} sm={6} md={6} lg={4} key={result.index}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4
                        }
                      }}
                    >
                      {result.success && result.image_url ? (
                        <CardMedia
                          component="img"
                          image={result.image_url}
                          alt={`Generated image ${result.index + 1}`}
                          sx={{ 
                            height: 200,
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Box 
                          sx={{ 
                            height: 200, 
                            bgcolor: 'background.default',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {result.success === false ? (
                            <Warning sx={{ fontSize: 60, color: 'error.main', opacity: 0.5 }} />
                          ) : (
                            <Image sx={{ fontSize: 60, opacity: 0.2 }} />
                          )}
                        </Box>
                      )}
                      <CardContent sx={{ pb: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Prompt {result.index + 1}
                          </Typography>
                          {result.success ? (
                            <Chip label="Réussi" color="success" size="small" />
                          ) : (
                            <Tooltip title={result.error || "Erreur inconnue"}>
                              <Chip label="Échec" color="error" size="small" />
                            </Tooltip>
                          )}
                        </Box>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            mb: 1
                          }}
                        >
                          {result.prompt}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        {result.success && result.image_url && (
                          <Button 
                            size="small" 
                            startIcon={<Download />}
                            onClick={() => handleDownloadImage(result.image_url!, result.index)}
                            fullWidth
                          >
                            Télécharger
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
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
                  Pas encore d'images générées
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450 }}>
                  Ajoutez des prompts à gauche puis cliquez sur "Générer le lot" 
                  pour créer plusieurs images simultanément
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BatchGenerator;

