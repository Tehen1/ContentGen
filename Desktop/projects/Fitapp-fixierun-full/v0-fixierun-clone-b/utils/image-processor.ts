"use client"

// Utilitaire pour traiter les images côté client
export class ImageProcessor {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement("canvas")
    this.ctx = this.canvas.getContext("2d")!
  }

  // Supprimer l'arrière-plan blanc/transparent d'une image
  async removeBackground(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        this.canvas.width = img.width
        this.canvas.height = img.height

        // Dessiner l'image sur le canvas
        this.ctx.drawImage(img, 0, 0)

        // Obtenir les données de pixels
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
        const data = imageData.data

        // Supprimer les pixels blancs/gris clairs (arrière-plan)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          // Détecter les pixels blancs/gris clairs
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0 // Rendre transparent
          }

          // Détecter les pixels gris très clairs
          if (r > 220 && g > 220 && b > 220 && Math.abs(r - g) < 10 && Math.abs(g - b) < 10) {
            data[i + 3] = 0 // Rendre transparent
          }
        }

        // Remettre les données modifiées
        this.ctx.putImageData(imageData, 0, 0)

        // Convertir en blob
        this.canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            resolve(url)
          } else {
            reject(new Error("Impossible de créer le blob"))
          }
        }, "image/png")
      }

      img.onerror = () => reject(new Error("Impossible de charger l'image"))
      img.src = imageUrl
    })
  }

  // Optimiser une image (redimensionner et compresser)
  async optimizeImage(imageUrl: string, maxWidth = 800, quality = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        // Calculer les nouvelles dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        this.canvas.width = width
        this.canvas.height = height

        // Dessiner l'image redimensionnée
        this.ctx.drawImage(img, 0, 0, width, height)

        // Convertir en blob avec compression
        this.canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              resolve(url)
            } else {
              reject(new Error("Impossible de créer le blob"))
            }
          },
          "image/jpeg",
          quality,
        )
      }

      img.onerror = () => reject(new Error("Impossible de charger l'image"))
      img.src = imageUrl
    })
  }

  // Appliquer un filtre cyberpunk à une image
  async applyCyberpunkFilter(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        this.canvas.width = img.width
        this.canvas.height = img.height

        // Dessiner l'image
        this.ctx.drawImage(img, 0, 0)

        // Obtenir les données de pixels
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
        const data = imageData.data

        // Appliquer le filtre cyberpunk (augmenter les bleus et cyans)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          // Augmenter les tons bleus/cyans
          data[i] = Math.min(255, r * 0.8) // Réduire le rouge
          data[i + 1] = Math.min(255, g * 1.1) // Augmenter légèrement le vert
          data[i + 2] = Math.min(255, b * 1.3) // Augmenter le bleu
        }

        // Remettre les données modifiées
        this.ctx.putImageData(imageData, 0, 0)

        // Convertir en blob
        this.canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            resolve(url)
          } else {
            reject(new Error("Impossible de créer le blob"))
          }
        }, "image/png")
      }

      img.onerror = () => reject(new Error("Impossible de charger l'image"))
      img.src = imageUrl
    })
  }
}

// Hook pour utiliser le processeur d'images
export function useImageProcessor() {
  const processor = new ImageProcessor()

  return {
    removeBackground: processor.removeBackground.bind(processor),
    optimizeImage: processor.optimizeImage.bind(processor),
    applyCyberpunkFilter: processor.applyCyberpunkFilter.bind(processor),
  }
}
