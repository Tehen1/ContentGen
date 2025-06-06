import sharp from "sharp"
import fs from "fs"
import path from "path"
import { promisify } from "util"

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)

interface OptimizationOptions {
  quality?: number
  width?: number
  height?: number
  format?: "webp" | "avif" | "jpeg" | "png"
}

export async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options: OptimizationOptions = {},
): Promise<void> {
  const { quality = 80, width, height, format = "webp" } = options

  try {
    let image = sharp(inputPath)

    // Redimensionner si nécessaire
    if (width || height) {
      image = image.resize({
        width,
        height,
        fit: "inside",
        withoutEnlargement: true,
      })
    }

    // Convertir au format spécifié
    switch (format) {
      case "webp":
        image = image.webp({ quality })
        break
      case "avif":
        image = image.avif({ quality })
        break
      case "jpeg":
        image = image.jpeg({ quality })
        break
      case "png":
        image = image.png({ quality })
        break
    }

    // Sauvegarder l'image optimisée
    await image.toFile(outputPath)
  } catch (error) {
    console.error(`Erreur lors de l'optimisation de l'image ${inputPath}:`, error)
    throw error
  }
}

export async function optimizeAllImages(directory = "public", options: OptimizationOptions = {}): Promise<void> {
  try {
    const files = await readdir(directory)

    for (const file of files) {
      const filePath = path.join(directory, file)
      const fileStat = await stat(filePath)

      if (fileStat.isDirectory()) {
        // Récursion pour les sous-dossiers
        await optimizeAllImages(filePath, options)
      } else if (/\.(jpe?g|png|gif)$/i.test(file)) {
        // Optimiser uniquement les images
        const outputPath = path.join(
          path.dirname(filePath),
          `${path.basename(file, path.extname(file))}.${options.format || "webp"}`,
        )

        await optimizeImage(filePath, outputPath, options)
        console.log(`Optimisé: ${filePath} -> ${outputPath}`)
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'optimisation des images:", error)
    throw error
  }
}
