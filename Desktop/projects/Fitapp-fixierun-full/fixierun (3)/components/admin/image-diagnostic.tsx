"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { BIKE_IMAGES } from "@/utils/image-paths"

interface ImageStatus {
  path: string
  name: string
  status: "loading" | "success" | "error"
  error?: string
}

export default function ImageDiagnostic() {
  const [imageStatuses, setImageStatuses] = useState<ImageStatus[]>([])
  const [isChecking, setIsChecking] = useState(false)

  const checkImages = async () => {
    setIsChecking(true)
    const statuses: ImageStatus[] = []

    for (const [name, path] of Object.entries(BIKE_IMAGES)) {
      statuses.push({
        name,
        path,
        status: "loading",
      })
    }

    setImageStatuses([...statuses])

    // Vérifier chaque image
    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i]

      try {
        const response = await fetch(status.path, { method: "HEAD" })
        if (response.ok) {
          status.status = "success"
        } else {
          status.status = "error"
          status.error = `HTTP ${response.status}`
        }
      } catch (error) {
        status.status = "error"
        status.error = error instanceof Error ? error.message : "Unknown error"
      }

      setImageStatuses([...statuses])
    }

    setIsChecking(false)
  }

  useEffect(() => {
    checkImages()
  }, [])

  const successCount = imageStatuses.filter((s) => s.status === "success").length
  const errorCount = imageStatuses.filter((s) => s.status === "error").length
  const loadingCount = imageStatuses.filter((s) => s.status === "loading").length

  return (
    <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 cyber-border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-cyber font-bold text-white">Image Diagnostic</h3>
        <button
          onClick={checkImages}
          disabled={isChecking}
          className="flex items-center space-x-2 bg-accent/20 text-accent px-4 py-2 rounded-sm hover:bg-accent/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-500/20 border border-green-500/30 rounded-sm p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{successCount}</div>
          <div className="text-sm text-green-300">Success</div>
        </div>
        <div className="bg-red-500/20 border border-red-500/30 rounded-sm p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{errorCount}</div>
          <div className="text-sm text-red-300">Errors</div>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-sm p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{loadingCount}</div>
          <div className="text-sm text-yellow-300">Loading</div>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {imageStatuses.map((status) => (
          <div key={status.name} className="flex items-center justify-between bg-black/20 rounded-sm p-3">
            <div className="flex items-center space-x-3">
              {status.status === "loading" && <AlertCircle className="w-5 h-5 text-yellow-400 animate-pulse" />}
              {status.status === "success" && <CheckCircle className="w-5 h-5 text-green-400" />}
              {status.status === "error" && <XCircle className="w-5 h-5 text-red-400" />}
              <div>
                <div className="text-white font-medium">{status.name}</div>
                <div className="text-gray-400 text-sm">{status.path}</div>
                {status.error && <div className="text-red-400 text-xs">{status.error}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
