"use client"

import { useState } from "react"
import { Settings, Save, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"

interface ConfigSettings {
  imageProcessing: {
    autoRemoveBackground: boolean
    applyCyberpunkFilter: boolean
    optimizeSize: boolean
    maxWidth: number
    quality: number
    addGlow: boolean
    glowColor: string
    glowIntensity: number
  }
  errorHandling: {
    autoFixBlobUrls: boolean
    createFallbackImages: boolean
    logErrors: boolean
    notifyOnErrors: boolean
  }
  performance: {
    enableLazyLoading: boolean
    enableImageCaching: boolean
    compressionLevel: number
    preloadCriticalImages: boolean
  }
  security: {
    validateImagePaths: boolean
    sanitizeUrls: boolean
    enableCORS: boolean
    maxFileSize: number
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ConfigSettings>({
    imageProcessing: {
      autoRemoveBackground: true,
      applyCyberpunkFilter: true,
      optimizeSize: true,
      maxWidth: 800,
      quality: 0.9,
      addGlow: true,
      glowColor: "#00ffff",
      glowIntensity: 0.5,
    },
    errorHandling: {
      autoFixBlobUrls: true,
      createFallbackImages: true,
      logErrors: true,
      notifyOnErrors: false,
    },
    performance: {
      enableLazyLoading: true,
      enableImageCaching: true,
      compressionLevel: 80,
      preloadCriticalImages: true,
    },
    security: {
      validateImagePaths: true,
      sanitizeUrls: true,
      enableCORS: true,
      maxFileSize: 5, // MB
    },
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simuler la sauvegarde
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSaveStatus("success")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (error) {
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const resetToDefaults = () => {
    setSettings({
      imageProcessing: {
        autoRemoveBackground: true,
        applyCyberpunkFilter: true,
        optimizeSize: true,
        maxWidth: 800,
        quality: 0.9,
        addGlow: true,
        glowColor: "#00ffff",
        glowIntensity: 0.5,
      },
      errorHandling: {
        autoFixBlobUrls: true,
        createFallbackImages: true,
        logErrors: true,
        notifyOnErrors: false,
      },
      performance: {
        enableLazyLoading: true,
        enableImageCaching: true,
        compressionLevel: 80,
        preloadCriticalImages: true,
      },
      security: {
        validateImagePaths: true,
        sanitizeUrls: true,
        enableCORS: true,
        maxFileSize: 5,
      },
    })
  }

  return (
    <div className="min-h-screen bg-cyberpunk-darker py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-cyber font-bold text-white mb-2 flex items-center">
                <Settings className="w-8 h-8 mr-3 text-accent" />
                Configuration Système
              </h1>
              <p className="text-gray-300 text-lg">Paramètres globaux de traitement d'images et sécurité</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={resetToDefaults}
                className="flex items-center space-x-2 bg-gray-500/20 text-gray-400 px-4 py-2 rounded-sm hover:bg-gray-500/30 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Réinitialiser</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 bg-accent/20 text-accent px-4 py-2 rounded-sm hover:bg-accent/30 transition-colors disabled:opacity-50"
              >
                <Save className={`w-4 h-4 ${isSaving ? "animate-pulse" : ""}`} />
                <span>{isSaving ? "Sauvegarde..." : "Sauvegarder"}</span>
              </button>
            </div>
          </div>

          {/* Status de sauvegarde */}
          {saveStatus !== "idle" && (
            <div className="mt-4">
              {saveStatus === "success" && (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Configuration sauvegardée avec succès</span>
                </div>
              )}
              {saveStatus === "error" && (
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Erreur lors de la sauvegarde</span>
                </div>
              )}
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Traitement d'Images */}
          <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 cyber-border">
            <h2 className="text-xl font-bold text-white mb-4">Traitement d'Images</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-white">Suppression automatique d'arrière-plan</span>
                <input
                  type="checkbox"
                  checked={settings.imageProcessing.autoRemoveBackground}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      imageProcessing: { ...settings.imageProcessing, autoRemoveBackground: e.target.checked },
                    })
                  }
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-white">Filtre cyberpunk</span>
                <input
                  type="checkbox"
                  checked={settings.imageProcessing.applyCyberpunkFilter}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      imageProcessing: { ...settings.imageProcessing, applyCyberpunkFilter: e.target.checked },
                    })
                  }
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-white">Optimisation de taille</span>
                <input
                  type="checkbox"
                  checked={settings.imageProcessing.optimizeSize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      imageProcessing: { ...settings.imageProcessing, optimizeSize: e.target.checked },
                    })
                  }
                  className="rounded"
                />
              </label>

              <div>
                <label className="block text-white text-sm mb-1">Largeur maximale (px)</label>
                <input
                  type="number"
                  value={settings.imageProcessing.maxWidth}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      imageProcessing: { ...settings.imageProcessing, maxWidth: Number.parseInt(e.target.value) },
                    })
                  }
                  className="w-full bg-black/50 text-white rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-1">Qualité (0-1)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="1"
                  value={settings.imageProcessing.quality}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      imageProcessing: { ...settings.imageProcessing, quality: Number.parseFloat(e.target.value) },
                    })
                  }
                  className="w-full bg-black/50 text-white rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-1">Couleur de lueur</label>
                <input
                  type="color"
                  value={settings.imageProcessing.glowColor}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      imageProcessing: { ...settings.imageProcessing, glowColor: e.target.value },
                    })
                  }
                  className="w-full bg-black/50 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Gestion d'Erreurs */}
          <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 cyber-border">
            <h2 className="text-xl font-bold text-white mb-4">Gestion d'Erreurs</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-white">Correction automatique des URLs Blob</span>
                <input
                  type="checkbox"
                  checked={settings.errorHandling.autoFixBlobUrls}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      errorHandling: { ...settings.errorHandling, autoFixBlobUrls: e.target.checked },
                    })
                  }
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-white">Créer des images de fallback</span>
                <input
                  type="checkbox"
                  checked={settings.errorHandling.createFallbackImages}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      errorHandling: { ...settings.errorHandling, createFallbackImages: e.target.checked },
                    })
                  }
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-white">Journalisation des erreurs</span>
                <input
                  type="checkbox"
                  checked={settings.errorHandling.logErrors}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      errorHandling: { ...settings.errorHandling, logErrors: e.target.checked },
                    })
                  }
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-white">Notifications d'erreurs</span>
                <input
                  type="checkbox"
                  checked={settings.errorHandling.notifyOnErrors}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      errorHandling: { ...settings.errorHandling, notifyOnErrors: e.target.checked },
                    })
                  }
                  className="rounded"
                />
              </label>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 cyber-border">
            <h2 className="text-xl font-bold text-white mb-4">Performance</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-white">Lazy loading</span>
                <input
                  type="checkbox"
                  checked={settings.performance.enableLazyLoading}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      performance: { ...settings.performance, enableLazyLoading: e.target.checked },
                    })
                  }
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-white">Cache d'images</span>
                <input
                  type="checkbox"
                  checked={settings.performance.enableImageCaching}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      performance: { ...settings.performance, enableImageCaching: e.target.checked },
                    })
                  }
                  className="rounded"
                />
              </label>

              <div>
                <label className="block text-white text-sm mb-1">Niveau de compression (%)</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={settings.performance.compressionLevel}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      performance: { ...settings.performance, compressionLevel: Number.parseInt(e.target.value) },
                    })
                  }
                  className="w-full bg-black/50 text-white rounded px-3 py-2"
                />
              </div>

              <label className="flex items-center justify-between">
                <span className="text-white">Préchargement des images critiques</span>
                <input
                  type="checkbox"
                  checked={settings.performance.preloadCriticalImages}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      performance: { ...settings.performance, preloadCriticalImages: e.target.checked },
                    })
                  }
                  className="rounded"
                />
              </label>
            </div>
          </div>

          {/* Sécurité */}
          <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 cyber-border">
            <h2 className="text-xl font-bold text-white mb-4">Sécurité</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-white">Validation des chemins d'images</span>
                <input
                  type="checkbox"
                  checked={settings.security.validateImagePaths}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, validateImagePaths: e.target.checked },
                    })
                  }
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-white">Sanitisation des URLs</span>
                <input
                  type="checkbox"
                  checked={settings.security.sanitizeUrls}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, sanitizeUrls: e.target.checked },
                    })
                  }
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-white">CORS activé</span>
                <input
                  type="checkbox"
                  checked={settings.security.enableCORS}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, enableCORS: e.target.checked },
                    })
                  }
                  className="rounded"
                />
              </label>

              <div>
                <label className="block text-white text-sm mb-1">Taille max de fichier (MB)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.security.maxFileSize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, maxFileSize: Number.parseInt(e.target.value) },
                    })
                  }
                  className="w-full bg-black/50 text-white rounded px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
