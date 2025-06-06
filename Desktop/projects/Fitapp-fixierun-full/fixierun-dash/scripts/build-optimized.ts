#!/usr/bin/env node
import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import chalk from "chalk"

// Configuration
const ENABLE_SOURCE_MAPS = process.env.NODE_ENV === "development"
const ENABLE_SWC = true // Utiliser SWC pour une compilation plus rapide
const ANALYZE_BUNDLE = process.argv.includes("--analyze")

function buildOptimized() {
  console.log(chalk.blue("🚀 Démarrage du build optimisé..."))

  try {
    // 1. Nettoyer les anciens builds
    console.log(chalk.yellow("Nettoyage des anciens builds..."))
    if (fs.existsSync(".next")) {
      fs.rmSync(".next", { recursive: true, force: true })
    }

    // 2. Optimiser le next.config.js
    console.log(chalk.yellow("Configuration de Next.js optimisée..."))
    const nextConfig = `
      const withBundleAnalyzer = ${ANALYZE_BUNDLE} ? 
        require('@next/bundle-analyzer')({ enabled: true }) : 
        (config) => config;
      
      /** @type {import('next').NextConfig} */
      const nextConfig = {
        reactStrictMode: true,
        swcMinify: ${ENABLE_SWC},
        productionBrowserSourceMaps: ${ENABLE_SOURCE_MAPS},
        images: {
          formats: ['image/avif', 'image/webp'],
          remotePatterns: [
            {
              protocol: 'https',
              hostname: '**',
            },
          ],
        },
        experimental: {
          serverActions: true,
          serverComponentsExternalPackages: ['sharp'],
          optimizeCss: true,
        },
        compiler: {
          removeConsole: process.env.NODE_ENV === 'production',
        },
        webpack: (config) => {
          // Optimisations webpack
          config.optimization.moduleIds = 'deterministic';
          
          return config;
        },
      };
      
      module.exports = withBundleAnalyzer(nextConfig);
    `

    fs.writeFileSync("next.config.js", nextConfig)

    // 3. Optimiser le tsconfig.json
    console.log(chalk.yellow("Configuration de TypeScript optimisée..."))
    const tsConfig = JSON.parse(fs.readFileSync("tsconfig.json", "utf-8"))

    tsConfig.compilerOptions = {
      ...tsConfig.compilerOptions,
      incremental: true,
      skipLibCheck: true,
      isolatedModules: true,
    }

    fs.writeFileSync("tsconfig.json", JSON.stringify(tsConfig, null, 2))

    // 4. Exécuter le build
    console.log(chalk.yellow("Exécution du build..."))
    execSync("next build", { stdio: "inherit" })

    // 5. Analyser la taille du build
    console.log(chalk.yellow("Analyse de la taille du build..."))
    const buildSize = getFolderSize(".next")
    console.log(chalk.green(`Taille du build: ${formatBytes(buildSize)}`))

    // 6. Vérifier les performances
    console.log(chalk.yellow("Vérification des performances..."))
    if (buildSize > 10 * 1024 * 1024) {
      // 10 MB
      console.log(chalk.yellow("⚠️ Le build est assez volumineux. Considérez l'optimisation des dépendances."))
    } else {
      console.log(chalk.green("✅ Taille du build optimale"))
    }

    console.log(chalk.green("✅ Build optimisé terminé avec succès!"))
  } catch (error) {
    console.error(chalk.red("❌ Erreur lors du build:"), error)
    process.exit(1)
  }
}

// Fonction pour calculer la taille d'un dossier
function getFolderSize(folderPath: string): number {
  let totalSize = 0

  function getAllFiles(dirPath: string) {
    const files = fs.readdirSync(dirPath)

    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const stats = fs.statSync(filePath)

      if (stats.isFile()) {
        totalSize += stats.size
      } else if (stats.isDirectory()) {
        getAllFiles(filePath)
      }
    }
  }

  getAllFiles(folderPath)
  return totalSize
}

// Fonction pour formater les bytes
function formatBytes(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"]
  if (bytes === 0) return "0 Bytes"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
}

buildOptimized()
