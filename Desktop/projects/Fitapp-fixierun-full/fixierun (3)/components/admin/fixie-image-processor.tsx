"use client"

import { useState } from "react"
import { Download, Upload, Zap, CheckCircle, XCircle } from "lucide-react"
import { FIXIE_RUN_IMAGES } from "@/utils/image-paths"
import { useImageProcessor } from "@/utils/image-processor"

interface ProcessingStatus {
  filename: string
  status: "pending" | "processing" | "completed" | "error"
  processedUrl?: string
  error?: string
}

export default function FixieImageProcessor() {
  const [processingStatuses, setProcessingStatuses] = useState<ProcessingStatus[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const { removeBackground, applyCyberpunkFilter } = useImageProcessor()

  const processAllImages = async () => {
    setIsProcessing(true)
    const statuses: ProcessingStatus[] = FIXIE_RUN_IMAGES.map((filename) => ({
      filename,
      status: "pending",
    }))
    setProcessingStatuses([...statuses])

    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i]
      status.status = "processing"
      setProcessingStatuses([...statuses])

      try {
        const originalPath = `/bikes/${status.filename}`

        // Supprimer l'arrière-plan
        const withoutBg = await removeBackground(originalPath)

        // Appliquer le filtre cyberpunk
        const processed = await applyCyberpunkFilter(withoutBg)

        status.status = "completed"
        status.processedUrl = processed
      } catch (error) {
        status.status = "error"
        status.error = error instanceof Error ? error.message : "Erreur inconnue"
      }

      setProcessingStatuses([...statuses])
    }

    setIsProcessing(false)
  }

  const downloadProcessedImage = (status: ProcessingStatus) => {
    if (status.processedUrl) {
      const link = document.createElement("a")
      link.href = status.processedUrl
      link.download = `processed-${status.filename}`
      link.click()
    }
  }

  const downloadAllProcessed = () => {
    processingStatuses
      .filter((s) => s.status === "completed" && s.processedUrl)
      .forEach((status) => downloadProcessedImage(status))
  }

  const completedCount = processingStatuses.filter((s) => s.status === "completed").length
  const errorCount = processingStatuses.filter((s) => s.status === "error").length
  const processingCount = processingStatuses.filter((s) => s.status === "processing").length

  return (
    <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 cyber-border">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-cyber font-bold text-white mb-2">Processeur d'Images Fixie.run</h3>
          <p className="text-gray-300 text-sm">
            Supprime automatiquement l'arrière-plan et applique des filtres cyberpunk
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={processAllImages}
            disabled={isProcessing}
            className="flex items-center space-x-2 bg-accent/20 text-accent px-4 py-2 rounded-sm hover:bg-accent/30 transition-colors disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${isProcessing ? "animate-pulse" : ""}`} />
            <span>{isProcessing ? "Traitement..." : "Traiter Tout"}</span>
          </button>
          {completedCount > 0 && (
            <button
              onClick={downloadAllProcessed}
              className="flex items-center space-x-2 bg-neon-green/20 text-neon-green px-4 py-2 rounded-sm hover:bg-neon-green/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger Tout</span>
            </button>
          )}
        </div>
      </div>

      {processingStatuses.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-500/20 border border-green-500/30 rounded-sm p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{completedCount}</div>
            <div className="text-sm text-green-300">Complétées</div>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-sm p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">{processingCount}</div>
            <div className="text-sm text-yellow-300">En cours</div>
          </div>
          <div className="bg-red-500/20 border border-red-500/30 rounded-sm p-3 text-center">
            <div className="text-2xl font-bold text-red-400">{errorCount}</div>
            <div className="text-sm text-red-300">Erreurs</div>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {processingStatuses.map((status) => (
          <div key={status.filename} className="flex items-center justify-between bg-black/20 rounded-sm p-3">
            <div className="flex items-center space-x-3">
              {status.status === "pending" && <div className="w-5 h-5 rounded-full bg-gray-500" />}
              {status.status === "processing" && <div className="w-5 h-5 rounded-full bg-yellow-400 animate-pulse" />}
              {status.status === "completed" && <CheckCircle className="w-5 h-5 text-green-400" />}
              {status.status === "error" && <XCircle className="w-5 h-5 text-red-400" />}
              <div>
                <div className="text-white font-medium">{status.filename}</div>
                {status.error && <div className="text-red-400 text-xs">{status.error}</div>}
              </div>
            </div>
            {status.status === "completed" && status.processedUrl && (
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
          <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Cliquez sur "Traiter Tout" pour commencer le traitement des images</p>
          <p className="text-sm mt-2">{FIXIE_RUN_IMAGES.length} images à traiter</p>
        </div>
      )}
    </div>
  )
}
