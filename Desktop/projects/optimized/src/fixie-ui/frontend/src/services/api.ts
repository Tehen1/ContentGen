import axios, { AxiosResponse } from 'axios';

// Configuration de base pour axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 secondes pour les générations d'images
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erreur API:', error);
    return Promise.reject(error);
  }
);

// Types d'interface
export interface ImageModel {
  name: string;
  description: string;
  features: string[];
  cost: string;
  recommended_for: string[];
  warning?: string;
}

export interface GeneratePromptRequest {
  description: string;
  style?: string;
  complexity?: string;
}

export interface GeneratePromptResponse {
  prompt: string;
  style: string;
  complexity: string;
  estimated_tokens: number;
}

export interface GenerateImageRequest {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  num_outputs?: number;
  seed?: number;
}

export interface GenerateImageResponse {
  success: boolean;
  images: string[];
  model_used: string;
  prompt: string;
  parameters: any;
  timestamp: string;
  error?: string;
}

export interface BatchGenerateRequest {
  prompts: string[];
  model?: string;
  width?: number;
  height?: number;
}

export interface BatchResult {
  index: number;
  prompt: string;
  success: boolean;
  image_url?: string;
  error?: string;
  timestamp: string;
}

export interface BatchGenerateResponse {
  success: boolean;
  results: BatchResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  model_used: string;
}

export interface UploadResponse {
  success: boolean;
  filename: string;
  filepath: string;
  url: string;
}

export interface AnalyzeImageRequest {
  image_url: string;
}

export interface ImageAnalysis {
  description: string;
  objects_detected: string[];
  colors_dominant: string[];
  style_detected: string;
  quality_score: number;
  dimensions: {
    width: number;
    height: number;
  };
  suggestions: string[];
}

export interface AnalyzeImageResponse {
  success: boolean;
  analysis: ImageAnalysis;
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  models_available: number;
}

export interface ModelsResponse {
  models: Record<string, ImageModel>;
  count: number;
}

// Services API
export const apiService = {
  // Vérification de l'état de l'API
  async checkHealth(): Promise<HealthResponse> {
    const response: AxiosResponse<HealthResponse> = await api.get('/api/health');
    return response.data;
  },

  // Récupération des modèles disponibles
  async getModels(): Promise<ModelsResponse> {
    const response: AxiosResponse<ModelsResponse> = await api.get('/api/models');
    return response.data;
  },

  // Génération de prompt optimisé
  async generatePrompt(data: GeneratePromptRequest): Promise<GeneratePromptResponse> {
    const response: AxiosResponse<GeneratePromptResponse> = await api.post(
      '/api/generate/prompt',
      data
    );
    return response.data;
  },

  // Génération d'image
  async generateImage(data: GenerateImageRequest): Promise<GenerateImageResponse> {
    const response: AxiosResponse<GenerateImageResponse> = await api.post(
      '/api/generate/image',
      data
    );
    return response.data;
  },

  // Génération en lot
  async batchGenerate(data: BatchGenerateRequest): Promise<BatchGenerateResponse> {
    const response: AxiosResponse<BatchGenerateResponse> = await api.post(
      '/api/batch/generate',
      data
    );
    return response.data;
  },

  // Upload de fichier
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse<UploadResponse> = await api.post(
      '/api/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Analyse d'image
  async analyzeImage(data: AnalyzeImageRequest): Promise<AnalyzeImageResponse> {
    const response: AxiosResponse<AnalyzeImageResponse> = await api.post(
      '/api/analyze/image',
      data
    );
    return response.data;
  },

  // Construction d'URL pour les fichiers
  getFileUrl(filename: string, type: 'upload' | 'output' = 'upload'): string {
    return `${API_BASE_URL}/api/${type}s/${filename}`;
  },

  // Téléchargement d'image depuis une URL
  async downloadImage(url: string, filename: string): Promise<void> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      throw error;
    }
  },
};

export default apiService;

// Utilitaires pour les erreurs
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'Une erreur inattendue s\'est produite';
};

// Utilitaires pour la validation
export const validateImageFile = (file: File): string | null => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/bmp'];
  const maxSize = 16 * 1024 * 1024; // 16MB
  
  if (!allowedTypes.includes(file.type)) {
    return 'Type de fichier non supporté. Utilisez PNG, JPEG, GIF, WebP ou BMP.';
  }
  
  if (file.size > maxSize) {
    return 'Fichier trop volumineux. Taille maximale: 16MB.';
  }
  
  return null;
};

// Utilitaires pour le formatage
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

