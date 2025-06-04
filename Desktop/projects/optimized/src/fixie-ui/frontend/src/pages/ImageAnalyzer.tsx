import React, { useState, useCallback, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  CardMedia,
  Tooltip,
  Container,
  List,
  ListItem,
  ListItemText,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  AnalyticsOutlined,
  CheckCircle,
  Error,
  ExpandMore,
  Edit,
  Save,
  ColorLens,
  Search,
  PhotoSizeSelectActual,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import {
  apiService,
  AnalyzeImageRequest,
  AnalyzeImageResponse,
  UploadResponse,
  getErrorMessage,
  validateImageFile,
  formatFileSize,
} from '../services/api';

const ImageAnalyzer: React.FC = () => {
  const theme = useTheme();
  
  // États pour l'image
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null);
  
  // États pour l'analyse
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeImageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // États pour l'édition
  const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
  const [editedDescription, setEditedDescription] = useState<string>('');
  const [isSavingDescription, setIsSavingDescription] = useState<boolean>(false);
  
  // Configuration de react-dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Valider le fichier
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      
      // Réinitialiser les états
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadResponse(null);
      setAnalysisResult(null);
      setError(null);
      setIsEditingDescription(false);
      setEditedDescription('');
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp']
    },
    maxFiles: 1,
    disabled: isAnalyzing
  });
  
  // Nettoyer les URLs d'aperçu lors du démontage du composant
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);
  
  // Upload de l'image sélectionnée
  const handleUploadImage = async () => {
    if (!selectedFile) {
      setError('Veuillez d\'abord sélectionner une image.');
      return;
    }
    
    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Uploader l'image
      const response = await apiService.uploadFile(selectedFile);
      setUploadResponse(response);
      
      // Continuer automatiquement avec l'analyse
      await handleAnalyzeImage(response.url);
    } catch (err) {
      setError('Erreur lors de l\'upload: ' + getErrorMessage(err));
      setIsAnalyzing(false);
    }
  };
  
  // Analyser l'image uploadée
  const handleAnalyzeImage = async (imageUrl: string) => {
    if (!imageUrl) {
      setError('URL d\'image manquante pour l\'analyse.');
      setIsAnalyzing(false);
      return;
    }
    
    try {
      setIsAnalyzing(true);
      setError(null);
      
      const request: AnalyzeImageRequest = {
        image_url: imageUrl
      };
      
      const response = await apiService.analyzeImage(request);
      setAnalysisResult(response);
      
      // Préparer la description pour l'édition
      if (response.analysis && response.analysis.description) {
        setEditedDescription(response.analysis.description);
      }
    } catch (err) {
      setError('Erreur lors de l\'analyse: ' + getErrorMessage(err));
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Supprimer l'image sélectionnée
  const handleRemoveImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadResponse(null);
    setAnalysisResult(null);
    setError(null);
    setIsEditingDescription(false);
    setEditedDescription('');
  };
  
  // Mettre à jour la description
  const handleSaveDescription = async () => {
    if (!uploadResponse || !editedDescription.trim()) {
      return;
    }
    
    try {
      setIsSavingDescription(true);
      setError(null);
      
      // Cette fonctionnalité simule une mise à jour des métadonnées
      // Dans une implémentation réelle, il faudrait appeler l'API pour mettre à jour
      // la description dans les métadonnées de l'image
      
      // Simulons un délai pour l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour le résultat d'analyse local
      if (analysisResult && analysisResult.analysis) {
        setAnalysisResult({
          ...analysisResult,
          analysis: {
            ...analysisResult.analysis,
            description: editedDescription
          }
        });
      }
      
      setIsEditingDescription(false);
    } catch (err) {
      setError('Erreur lors de la mise à jour: ' + getErrorMessage(err));
    } finally {
      setIsSavingDescription(false);
    }
  };
  
  // Générer des puces de couleur à partir des codes hex
  const renderColorChips = (colors: string[]) => {
    return colors.map((color, index) => (
      <Tooltip key={index} title={color}>
        <Chip
          icon={<ColorLens style={{ color }} />}
          label={color}
          sx={{
            m: 0.5,
            '& .MuiChip-icon': {
              color: color
            }
          }}
        />
      </Tooltip>
    ));
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analyseur d'Images
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Téléchargez une image pour l'analyser et générer automatiquement une description détaillée.
          Utile pour créer des métadonnées de qualité pour vos NFT ou préparer des prompts.
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Panneau d'upload et de prévisualisation */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Image à analyser
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {/* Zone de drop */}
            <Box 
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 3,
                mb: 3,
                textAlign: 'center',
                backgroundColor: isDragActive ? 'rgba(106, 27, 154, 0.04)' : 'transparent',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: previewUrl ? 'none' : 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 200,
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2, opacity: 0.7 }} />
              {isDragActive ? (
                <Typography variant="body1">Déposez l'image ici...</Typography>
              ) : (
                <Box>
                  <Typography variant="body1" gutterBottom>
                    Glissez-déposez une image ici, ou cliquez pour sélectionner
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Formats acceptés: PNG, JPG, JPEG, GIF, WebP, BMP (max. 16MB)
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Prévisualisation de l'image */}
            {previewUrl && (
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    mb: 2,
                  }}
                >
                  <CardMedia
                    component="img"
                    image={previewUrl}
                    alt="Image preview"
                    sx={{
                      maxHeight: 400,
                      objectFit: 'contain',
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      borderRadius: '50%',
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={handleRemoveImage}
                      sx={{ color: 'white' }}
                      disabled={isAnalyzing}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
                
                {/* Détails du fichier */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent sx={{ py: 1 }}>
                    <Typography variant="subtitle2">
                      Informations sur le fichier
                    </Typography>
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Nom:
                        </Typography>
                        <Typography variant="body2" noWrap>
                          {selectedFile?.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Taille:
                        </Typography>
                        <Typography variant="body2">
                          {selectedFile && formatFileSize(selectedFile.size)}
                        </Typography>
                      </Grid>
                      {uploadResponse && (
                        <Grid item xs={12}>
                          <Chip 
                            icon={<CheckCircle />} 
                            label="Fichier téléchargé" 
                            color="success" 
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
                
                {/* Bouton d'analyse */}
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : <AnalyticsOutlined />}
                  onClick={handleUploadImage}
                  disabled={isAnalyzing || !selectedFile || !!analysisResult}
                  sx={{ py: 1.5 }}
                >
                  {isAnalyzing ? 'Analyse en cours...' : uploadResponse ? 'Analyser l\'image' : 'Télécharger et analyser'}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Panneau des résultats d'analyse */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Résultats d'analyse
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {isAnalyzing ? (
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
                  Analyse de l'image en cours...
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Nous identifions les éléments, les couleurs et générons une description
                </Typography>
              </Box>
            ) : analysisResult ? (
              <Box>
                {/* Description */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Description générée
                    </Typography>
                    <Tooltip title={isEditingDescription ? "Enregistrer les modifications" : "Modifier la description"}>
                      <IconButton 
                        size="small" 
                        color={isEditingDescription ? "primary" : "default"}
                        onClick={() => isEditingDescription ? handleSaveDescription() : setIsEditingDescription(true)}
                        disabled={isSavingDescription}
                      >
                        {isEditingDescription ? <Save /> : <Edit />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  {isEditingDescription ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      variant="outlined"
                      placeholder="Entrez une description détaillée de l'image..."
                      disabled={isSavingDescription}
                    />
                  ) : (
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}
                    >
                      <Typography variant="body1">
                        {analysisResult.analysis.description}
                      </Typography>
                    </Paper>
                  )}
                </Box>
                
                {/* Accordéon pour les résultats détaillés */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1">Éléments détectés</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                      {analysisResult.analysis.objects_detected.map((object, index) => (
                        <Chip 
                          key={index}
                          icon={<Search />}
                          label={object}
                          variant="outlined"
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1">Palette de couleurs</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                      {renderColorChips(analysisResult.analysis.colors_dominant)}
                    </Box>
                  </AccordionDetails>
                </Accordion>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1">Informations techniques</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Style détecté:
                        </Typography>
                        <Typography variant="body1">
                          {analysisResult.analysis.style_detected}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Score de qualité:
                        </Typography>
                        <Chip 
                          label={`${(analysisResult.analysis.quality_score * 100).toFixed(0)}%`}
                          color={
                            analysisResult.analysis.quality_score > 0.8 ? "success" :
                            analysisResult.analysis.quality_score > 0.5 ? "primary" : 
                            "warning"
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Dimensions:
                        </Typography>
                        <Chip 
                          icon={<PhotoSizeSelectActual />}
                          label={`${analysisResult.analysis.dimensions.width} × ${analysisResult.analysis.dimensions.height}`}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1">Suggestions d'amélioration</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {analysisResult.analysis.suggestions.map((suggestion, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={suggestion} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
                
                {/* Actions sur le résultat */}
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      navigator.clipboard.writeText(analysisResult.analysis.description);
                    }}
                  >
                    Copier la description
                  </Button>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      const metadataJson = JSON.stringify(analysisResult.analysis, null, 2);
                      const blob = new Blob([metadataJson], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `metadata_${Date.now()}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Télécharger métadonnées
                  </Button>
                </Box>
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
                <AnalyticsOutlined sx={{ fontSize: 80, opacity: 0.2 }} />
                <Typography variant="h6" color="text.secondary">
                  Pas encore d'analyse
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450 }}>
                  Téléchargez une image à gauche puis cliquez sur "Analyser l'image" 
                  pour générer une description et des métadonnées
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ImageAnalyzer;

