"use client"

export interface ProcessingOptions {
  removeBackground: boolean
  applyCyberpunkFilter: boolean
  optimizeSize: boolean
  maxWidth: number
  quality: number
  addGlow: boolean
  glowColor: string
  glowIntensity: number
}

export interface ProcessingResult {
  success: boolean
  originalUrl: string
  processedUrl?: string
  error?: string
  processingTime: number
  originalSize: number
  processedSize: number
  operations: string[]
}

export class AdvancedImageProcessor {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement("canvas")
    this.ctx = this.canvas.getContext("2d")!
  }

  async processImage(imageUrl: string, options: ProcessingOptions): Promise<ProcessingResult> {
    const startTime = Date.now()
    const operations: string[] = []

    try {
      const img = await this.loadImage(imageUrl)
      const originalSize = await this.getImageSize(imageUrl)

      this.canvas.width = img.width
      this.canvas.height = img.height
      this.ctx.drawImage(img, 0, 0)

      // Supprimer l'arrière-plan si demandé
      if (options.removeBackground) {
        await this.removeBackground()
        operations.push("Suppression arrière-plan")
      }

      // Appliquer le filtre cyberpunk si demandé
      if (options.applyCyberpunkFilter) {
        await this.applyCyberpunkFilter()
        operations.push("Filtre cyberpunk")
      }

      // Ajouter un effet de lueur si demandé
      if (options.addGlow) {
        await this.addGlowEffect(options.glowColor, options.glowIntensity)
        operations.push("Effet de lueur")
      }

      // Optimiser la taille si demandé
      if (options.optimizeSize && img.width > options.maxWidth) {
        await this.resizeImage(options.maxWidth)
        operations.push("Redimensionnement")
      }

      // Convertir en blob avec la qualité spécifiée
      const processedBlob = await this.canvasToBlob(options.quality)
      const processedUrl = URL.createObjectURL(processedBlob)
      const processedSize = processedBlob.size

      const processingTime = Date.now() - startTime

      return {
        success: true,
        originalUrl: imageUrl,
        processedUrl,
        processingTime,
        originalSize,
        processedSize,
        operations,
      }
    } catch (error) {
      return {
        success: false,
        originalUrl: imageUrl,
        error: error instanceof Error ? error.message : "Erreur inconnue",
        processingTime: Date.now() - startTime,
        originalSize: 0,
        processedSize: 0,
        operations,
      }
    }
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Impossible de charger l'image: ${url}`))
      img.src = url
    })
  }

  private async getImageSize(url: string): Promise<number> {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      return blob.size
    } catch {
      return 0
    }
  }

  private async removeBackground(): Promise<void> {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Détecter les pixels blancs/gris clairs (arrière-plan)
      const isWhiteish = r > 240 && g > 240 && b > 240
      const isGrayish = r > 220 && g > 220 && b > 220 && Math.abs(r - g) < 15 && Math.abs(g - b) < 15

      if (isWhiteish || isGrayish) {
        data[i + 3] = 0 // Rendre transparent
      }
    }

    this.ctx.putImageData(imageData, 0, 0)
  }

  private async applyCyberpunkFilter(): Promise<void> {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue // Skip transparent pixels

      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Appliquer le filtre cyberpunk
      data[i] = Math.min(255, r * 0.7 + b * 0.3) // Rouge avec influence bleue
      data[i + 1] = Math.min(255, g * 1.2) // Augmenter le vert
      data[i + 2] = Math.min(255, b * 1.4) // Augmenter fortement le bleu
    }

    this.ctx.putImageData(imageData, 0, 0)
  }

  private async addGlowEffect(color: string, intensity: number): Promise<void> {
    // Créer un effet de lueur
    this.ctx.shadowBlur = 20 * intensity
    this.ctx.shadowColor = color
    this.ctx.globalCompositeOperation = "source-over"
    this.ctx.globalAlpha = 0.8 * intensity

    // Redessiner l'image avec l'effet de lueur
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")!
    tempCanvas.width = this.canvas.width
    tempCanvas.height = this.canvas.height
    tempCtx.drawImage(this.canvas, 0, 0)

    this.ctx.drawImage(tempCanvas, 0, 0)
    this.ctx.globalAlpha = 1.0
    this.ctx.shadowBlur = 0
  }

  private async resizeImage(maxWidth: number): Promise<void> {
    const currentWidth = this.canvas.width
    const currentHeight = this.canvas.height

    if (currentWidth <= maxWidth) return

    const ratio = maxWidth / currentWidth
    const newHeight = currentHeight * ratio

    // Créer un nouveau canvas avec les nouvelles dimensions
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")!
    tempCanvas.width = maxWidth
    tempCanvas.height = newHeight

    // Redessiner l'image redimensionnée
    tempCtx.drawImage(this.canvas, 0, 0, maxWidth, newHeight)

    // Mettre à jour le canvas principal
    this.canvas.width = maxWidth
    this.canvas.height = newHeight
    this.ctx.drawImage(tempCanvas, 0, 0)
  }

  private canvasToBlob(quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Impossible de créer le blob"))
          }
        },
        "image/png",
        quality,
      )
    })
  }
}
