"use client"

import { useState, useCallback } from "react"
import {
  Play,
  Pause,
  Download,
  Settings,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  HardDrive,
  ImageIcon,
  Sparkles,
} from "lucide-react"
import { FIXIE_RUN_IMAGES, BIKE_IMAGES } from "@/utils/image-paths"
import { AdvancedImageProcessor, type ProcessingOptions, type ProcessingResult } from "@/utils/advanced-image-processor"

interface BatchProcessingStatus {
  filename: string
  status: "pending" | "processing" | "completed" | "error" | "skipped"
  result?: ProcessingResult
}

export default function AdvancedImageProcessorAdmin() {
  const [processingStatuses, setProcessingStatuses] = useState<BatchProcessingStatus[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const [options, setOptions] = useState<ProcessingOptions>({
    removeBackground: true,
    applyCyberpunkFilter: true,
    optimizeSize: true,
    maxWidth: 800,
    quality: 0.9,
    addGlow: true,
    glowColor: "#00ffff",
    glowIntensity: 0.5,
  })

  const processor = new AdvancedImageProcessor()

  const allImages = [
    ...FIXIE_RUN_IMAGES.map((img) => ({ filename: img, path: `/bikes/${img}`, type: "fixie-run" })),
    ...Object.entries(BIKE_IMAGES).map(([key, path]) => ({
      filename: key,
      path,
      type: "standard",
    })),
  ]

  const startBatchProcessing = useCallback(async () => {
    setIsProcessing(true)
    setIsPaused(false)
    setCurrentIndex(0)

    const statuses: BatchProcessingStatus[] = allImages.map((img) => ({
      filename: img.filename,
      status: "pending",
    }))
    setProcessingStatuses([...statuses])

    for (let i = 0; i < statuses.length; i++) {
      if (isPaused) {
        statuses[i].status = "skipped"
        continue
      }

      setCurrentIndex(i)
      const status = statuses[i]
      const image = allImages[i]

      status.status = "processing"
      setProcessingStatuses([...statuses])

      try {
        const result = await processor.processImage(image.path, options)
        status.result = result
        status.status = result.success ? "completed" : "error"
      } catch (error) {
        status.status = "error"
        status.result = {
          success: false,
          originalUrl: image.path,
          error: error instanceof Error ? error.message : "Erreur inconnue",
          processingTime: 0,
          originalSize: 0,
          processedSize: 0,
          operations: [],
        }
      }

      setProcessingStatuses([...statuses])

      // Petite pause pour éviter de surcharger le navigateur
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    setIsProcessing(false)
    setCurrentIndex(0)
  }, [options, isPaused])

  const pauseProcessing = () => {
    setIsPaused(true)
  }

  const resumeProcessing = () => {
    setIsPaused(false)
  }

  const downloadProcessedImage = (status: BatchProcessingStatus) => {
    if (status.result?.processedUrl) {
      const link = document.createElement("a")
      link.href = status.result.processedUrl
      link.download = `processed-${status.filename}.png`
      link.click()
    }
  }

  const downloadAllProcessed = () => {
    processingStatuses
      .filter((s) => s.status === "completed" && s.result?.processedUrl)
      .forEach((status) => downloadProcessedImage(status))
  }

  const resetProcessing = () => {
    setProcessingStatuses([])
    setCurrentIndex(0)
    setIsProcessing(false)
    setIsPaused(false)
  }

  const completedCount = processingStatuses.filter((s) => s.status === "completed").length
  const errorCount = processingStatuses.filter((s) => s.status === "error").length
  const processingCount = processingStatuses.filter((s) => s.status === "processing").length
  const totalProcessingTime = processingStatuses
    .filter((s) => s.result)
    .reduce((sum, s) => sum + (s.result?.processingTime || 0), 0)
  const totalSizeSaved = processingStatuses
    .filter((s) => s.result?.success)
    .reduce((sum, s) => sum + ((s.result?.originalSize || 0) - (s.result?.processedSize || 0)), 0)

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 cyber-border">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-cyber font-bold text-white mb-2">Processeur d'Images Avancé</h3>
          <p className="text-gray-300 text-sm">
            Traitement automatique de {allImages.length} images avec options personnalisables
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2 bg-purple-500/20 text-purple-400 px-4 py-2 rounded-sm hover:bg-purple-500/30 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Options</span>
          </button>
          {!isProcessing ? (
            <button
              onClick={startBatchProcessing}
              className="flex items-center space-x-2 bg-accent/20 text-accent px-4 py-2 rounded-sm hover:bg-accent/30 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Démarrer</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              {!isPaused ? (
                <button
                  onClick={pauseProcessing}
                  className="flex items-center space-x-2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-sm hover:bg-yellow-500/30 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={resumeProcessing}
                  className="flex items-center space-x-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-sm hover:bg-green-500/30 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Reprendre</span>
                </button>
              )}
            </div>
          )}
          {completedCount > 0 && (
            <button
              onClick={downloadAllProcessed}
              className="flex items-center space-x-2 bg-neon-green/20 text-neon-green px-4 py-2 rounded-sm hover:bg-neon-green/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger Tout</span>
            </button>
          )}
          {processingStatuses.length > 0 && (
            <button
              onClick={resetProcessing}
              className="flex items-center space-x-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-sm hover:bg-red-500/30 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Options de traitement */}
      {showSettings && (
        <div className="bg-black/30 rounded-sm p-4 mb-6 border border-purple-500/30">
          <h4 className="text-lg font-bold text-white mb-4">Options de Traitement</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.removeBackground}
                  onChange={(e) => setOptions({ ...options, removeBackground: e.target.checked })}
                  className="rounded"
                />
                <span className="text-white">Supprimer l'arrière-plan</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.applyCyberpunkFilter}
                  onChange={(e) => setOptions({ ...options, applyCyberpunkFilter: e.target.checked })}
                  className="rounded"
                />
                <span className="text-white">Filtre cyberpunk</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.addGlow}
                  onChange={(e) => setOptions({ ...options, addGlow: e.target.checked })}
                  className="rounded"
                />
                <span className="text-white">Effet de lueur</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.optimizeSize}
                  onChange={(e) => setOptions({ ...options, optimizeSize: e.target.checked })}
                  className="rounded"
                />
                <span className="text-white">Optimiser la taille</span>
              </label>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-white text-sm mb-1">Largeur max (px)</label>
                <input
                  type="number"
                  value={options.maxWidth}
                  onChange={(e) => setOptions({ ...options, maxWidth: Number.parseInt(e.target.value) })}
                  className="w-full bg-black/50 text-white rounded px-3 py-1"
                />
              </div>
              <div>
                <label className="block text-white text-sm mb-1">Qualité (0-1)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="1"
                  value={options.quality}
                  onChange={(e) => setOptions({ ...options, quality: Number.parseFloat(e.target.value) })}
                  className="w-full bg-black/50 text-white rounded px-3 py-1"
                />
              </div>
              <div>
                <label className="block text-white text-sm mb-1">Couleur de lueur</label>
                <input
                  type="color"
                  value={options.glowColor}
                  onChange={(e) => setOptions({ ...options, glowColor: e.target.value })}
                  className="w-full bg-black/50 rounded px-3 py-1"
                />
              </div>
              <div>
                <label className="block text-white text-sm mb-1">Intensité lueur (0-1)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={options.glowIntensity}
                  onChange={(e) => setOptions({ ...options, glowIntensity: Number.parseFloat(e.target.value) })}
                  className="w-full bg-black/50 text-white rounded px-3 py-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      {processingStatuses.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-green-500/20 border border-green-500/30 rounded-sm p-3 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-1 text-green-400" />
            <div className="text-xl font-bold text-green-400">{completedCount}</div>
            <div className="text-xs text-green-300">Complétées</div>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-sm p-3 text-center">
            <Zap className="w-6 h-6 mx-auto mb-1 text-yellow-400" />
            <div className="text-xl font-bold text-yellow-400">{processingCount}</div>
            <div className="text-xs text-yellow-300">En cours</div>
          </div>
          <div className="bg-red-500/20 border border-red-500/30 rounded-sm p-3 text-center">
            <XCircle className="w-6 h-6 mx-auto mb-1 text-red-400" />
            <div className="text-xl font-bold text-red-400">{errorCount}</div>
            <div className="text-xs text-red-300">Erreurs</div>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-sm p-3 text-center">
            <Clock className="w-6 h-6 mx-auto mb-1 text-blue-400" />
            <div className="text-xl font-bold text-blue-400">{formatTime(totalProcessingTime)}</div>
            <div className="text-xs text-blue-300">Temps total</div>
          </div>
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-sm p-3 text-center">
            <HardDrive className="w-6 h-6 mx-auto mb-1 text-purple-400" />
            <div className="text-xl font-bold text-purple-400">{formatBytes(totalSizeSaved)}</div>
            <div className="text-xs text-purple-300">Économisé</div>
          </div>
        </div>
      )}

      {/* Barre de progression */}
      {isProcessing && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">
              Traitement en cours... ({currentIndex + 1}/{allImages.length})
            </span>
            <span className="text-gray-400 text-sm">{Math.round(((currentIndex + 1) / allImages.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / allImages.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Liste des images */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {processingStatuses.map((status, index) => (
          <div key={status.filename} className="flex items-center justify-between bg-black/20 rounded-sm p-3">
            <div className="flex items-center space-x-3">
              {status.status === "pending" && <div className="w-5 h-5 rounded-full bg-gray-500" />}
              {status.status === "processing" && <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />}
              {status.status === "completed" && <CheckCircle className="w-5 h-5 text-green-400" />}
              {status.status === "error" && <XCircle className="w-5 h-5 text-red-400" />}
              {status.status === "skipped" && <div className="w-5 h-5 rounded-full bg-gray-400" />}

              <div className="flex-1">
                <div className="text-white font-medium">{status.filename}</div>
                {status.result && (
                  <div className="text-xs text-gray-400 space-x-4">
                    <span>Temps: {formatTime(status.result.processingTime)}</span>
                    {status.result.success && (
                      <>
                        <span>
                          Taille: {formatBytes(status.result.originalSize)} → {formatBytes(status.result.processedSize)}
                        </span>
                        <span>Opérations: {status.result.operations.join(", ")}</span>
                      </>
                    )}
                    {status.result.error && <span className="text-red-400">{status.result.error}</span>}
                  </div>
                )}
              </div>
            </div>

            {status.status === "completed" && status.result?.processedUrl && (
              <button
                onClick={() => downloadProcessedImage(status)}
                className="flex items-center space-x-1 bg-neon-green/20 text-neon-green px-3 py-1 rounded-sm hover:bg-neon-green/30 transition-colors text-xs"
              >
                <Download className="w-3 h-3" />
                <span>Télécharger</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {processingStatuses.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Cliquez sur "Démarrer" pour commencer le traitement automatique</p>
          <p className="text-sm mt-2">{allImages.length} images à traiter</p>
        </div>
      )}
    </div>
  )
}
