// Utilitaire pour gérer les chemins d'images de vélos
export const BIKE_IMAGES = {
  // Images principales vérifiées
  "futuristic-neon-bike": "/futuristic-neon-bike.png",
  "neon-velocity": "/bikes/neon-velocity.png",
  "quantum-flux": "/bikes/quantum-flux.png",
  "cyberpunk-racer": "/bikes/cyberpunk-racer.png",
  "ghost-rider": "/bikes/ghost-rider.png",
  "cyan-racer-pro": "/bikes/cyan-racer-pro.png",
  "purple-teal-fixie": "/bikes/purple-teal-fixie.png",
  "rainbow-spectrum-legendary": "/bikes/rainbow-spectrum-legendary.png",
  "teal-frame-glow": "/bikes/teal-frame-glow.png",
  "neon-purple-fixie": "/bikes/neon-purple-fixie.png",
  "cyan-racer": "/bikes/cyan-racer.png",
  "teal-reflection": "/bikes/teal-reflection.png",
  "digital-speedster": "/bikes/digital-speedster.png",
  "teal-frame": "/bikes/teal-frame.png",
  "magenta-glow": "/bikes/magenta-glow.png",
  "chrome-phantom": "/bikes/chrome-phantom.png",
  "digital-dream": "/bikes/digital-dream.png",
  "graffiti-custom": "/bikes/graffiti-custom.png",
  "track-competition": "/bikes/track-competition.png",
  "urban-chic-fixie": "/bikes/urban-chic-fixie.png",
  "vintage-racer": "/bikes/vintage-racer.png",
} as const

export type BikeImageKey = keyof typeof BIKE_IMAGES

// Fonction pour obtenir le chemin d'une image
export function getBikeImagePath(key: BikeImageKey | string): string {
  if (key in BIKE_IMAGES) {
    return BIKE_IMAGES[key as BikeImageKey]
  }

  // Fallback pour images non trouvées
  return "/placeholder.svg?height=400&width=300&text=Bike+Image"
}

// Fonction pour valider si une image existe
export function validateImagePath(path: string): boolean {
  // Liste des extensions d'images supportées
  const supportedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".svg"]

  // Vérifier si c'est une URL blob problématique
  if (path.includes("blob.v0.dev")) {
    return false
  }

  return supportedExtensions.some((ext) => path.toLowerCase().endsWith(ext))
}

// Images de fallback simples pour la production
export function getFallbackImage(rarity?: string): string {
  return "/placeholder.svg?height=400&width=300&text=NFT+Bike"
}

// Fonction pour détecter et corriger les URLs blob problématiques
export function sanitizeImageUrl(url: string): string {
  if (url.includes("blob.v0.dev/s3reU.png") || url.includes("blob.v0.dev")) {
    console.warn(`URL blob problématique détectée: ${url}`)
    return "/placeholder.svg?height=400&width=300&text=Image+Indisponible"
  }
  return url
}

// Liste des images Fixie.run- à traiter
export const FIXIE_RUN_IMAGES = [
  "Fixie.run-20250516-003546.png",
  "Fixie.run-20250516-003603.png",
  "Fixie.run-20250516-003608.png",
  "Fixie.run-20250516-004007.png",
  "Fixie.run-20250516-010033.png",
  "Fixie.run-20250516-010051.png",
  "Fixie.run-20250516-010101.png",
  "Fixie.run-20250516-010201.png",
  "Fixie.run-20250516-010224.png",
  "Fixie.run-20250516-010825.png",
  "Fixie.run-20250516-011210.png",
  "Fixie.run-20250516-011741.png",
  "Fixie.run-20250516-011854.png",
  "Fixie.run-20250516-011902.png",
  "Fixie.run-20250516-011922.png",
  "Fixie.run-20250516-011928.png",
  "Fixie.run-20250516-013057.png",
  "Fixie.run-20250516-013653.png",
  "Fixie.run-20250516-013835.png",
  "Fixie.run-20250516-014607.png",
  "Fixie.run-20250516-014817.png",
  "Fixie.run-20250516-020735.png",
  "Fixie.run-20250516-020802.png",
  "Fixie.run-20250516-025741.png",
  "Fixie.run-20250516-031533.png",
  "Fixie.run-20250516-032604.png",
  "Fixie.run-20250516-042042.png",
  "Fixie.run-20250516-141433.png",
  "Fixie.run-20250516-141501.png",
  "Fixie.run-20250519-063202.png",
  "Fixie.run-20250519-065234.png",
  "Fixie.run-20250519-065326.png",
  "Fixie.run-20250520-005213.png",
  "Fixie.run-20250520-013015.png",
  "Fixie.run-20250520-191745.png",
  "Fixie.run-20250520-202124.png",
  "Fixie.run-20250521-075007.png",
  "Fixie.run-20250521-080542.png",
  "Fixie.run-20250521-081831.png",
  "Fixie.run-20250521-083522.png",
  "Fixie.run-20250521-084300.png",
  "Fixie.run-20250521-084957.png",
  "Fixie.run-20250521-085404.png",
  "Fixie.run-20250521-085419.png",
  "Fixie.run-20250521-085440.png",
  "Fixie.run-20250521-085723.png",
  "Fixie.run-20250521-085812.png",
  "Fixie.run-20250521-085913.png",
  "Fixie.run-20250521-085926.png",
  "Fixie.run-20250521-095602.png",
]
