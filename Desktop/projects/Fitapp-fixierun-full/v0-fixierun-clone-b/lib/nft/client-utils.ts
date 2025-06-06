"use client"

import { useState, useEffect } from "react"
import { useWeb3 } from "@/components/providers/simple-web3-provider"

export interface NFT {
  tokenId: string
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  rarity: "Common" | "Rare" | "Epic" | "Legendary"
}

// Hook pour récupérer les NFTs de l'utilisateur
export function useUserNFTs() {
  const { isConnected, address } = useWeb3()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isConnected || !address) {
      setNfts([])
      return
    }

    const fetchNFTs = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Simuler un délai de chargement
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Données mockées pour la démonstration
        const mockNFTs: NFT[] = [
          {
            tokenId: "1",
            name: "Cyber Racer #1",
            description: "Un vélo fixie cyberpunk avec des néons bleus",
            image: "/bikes/cyberpunk-racer.png",
            rarity: "Legendary",
            attributes: [
              { trait_type: "Speed", value: 95 },
              { trait_type: "Style", value: "Cyberpunk" },
              { trait_type: "Color", value: "Neon Blue" },
            ],
          },
          {
            tokenId: "2",
            name: "Neon Velocity #2",
            description: "Un vélo fixie avec des effets de lumière violette",
            image: "/bikes/neon-velocity.png",
            rarity: "Epic",
            attributes: [
              { trait_type: "Speed", value: 88 },
              { trait_type: "Style", value: "Neon" },
              { trait_type: "Color", value: "Purple" },
            ],
          },
          {
            tokenId: "3",
            name: "Digital Dream #3",
            description: "Un vélo fixie futuriste avec des hologrammes",
            image: "/bikes/digital-dream.png",
            rarity: "Rare",
            attributes: [
              { trait_type: "Speed", value: 82 },
              { trait_type: "Style", value: "Digital" },
              { trait_type: "Color", value: "Holographic" },
            ],
          },
        ]

        setNfts(mockNFTs)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
      } finally {
        setIsLoading(false)
      }
    }

    fetchNFTs()
  }, [isConnected, address])

  return { nfts, isLoading, error }
}

// Fonction pour obtenir la couleur de rareté
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case "Common":
      return "bg-gray-500"
    case "Rare":
      return "bg-blue-500"
    case "Epic":
      return "bg-purple-500"
    case "Legendary":
      return "bg-yellow-500"
    default:
      return "bg-gray-500"
  }
}

// Fonction pour obtenir le gradient de rareté
export function getRarityGradient(rarity: string): string {
  switch (rarity) {
    case "Common":
      return "from-gray-400 to-gray-600"
    case "Rare":
      return "from-blue-400 to-blue-600"
    case "Epic":
      return "from-purple-400 to-purple-600"
    case "Legendary":
      return "from-yellow-400 to-yellow-600"
    default:
      return "from-gray-400 to-gray-600"
  }
}
