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

// Hook to calculate NFT stats based on the user's collection
export function useNFTStats(nfts: NFT[]) {
  const rarityOrder = {
    Common: 1,
    Rare: 2,
    Epic: 3,
    Legendary: 4
  }

  // Default return value for empty collections
  if (!nfts || nfts.length === 0) {
    return {
      totalDistance: 0,
      totalEarnings: 0,
      bestRarity: null
    }
  }

  // Calculate total distance based on speed attribute (mock calculation)
  const totalDistance = nfts.reduce((sum, nft) => {
    const speedAttr = nft.attributes.find(attr => attr.trait_type === "Speed")
    const speed = speedAttr ? Number(speedAttr.value) : 0
    // Mock calculation: speed * 10 = kilometers traveled
    return sum + (speed * 10)
  }, 0)

  // Calculate earnings based on distance and rarity (mock calculation)
  const totalEarnings = nfts.reduce((sum, nft) => {
    const speedAttr = nft.attributes.find(attr => attr.trait_type === "Speed")
    const speed = speedAttr ? Number(speedAttr.value) : 0
    const distance = speed * 10
    
    // Earnings multiplier based on rarity
    const multiplier = nft.rarity === "Legendary" ? 2.5 :
                       nft.rarity === "Epic" ? 1.75 :
                       nft.rarity === "Rare" ? 1.25 : 1
    
    // Mock calculation: distance * multiplier = earnings
    return sum + (distance * multiplier)
  }, 0)

  // Find the highest rarity
  const bestRarity = nfts.reduce((highest, nft) => {
    if (!highest || rarityOrder[nft.rarity] > rarityOrder[highest]) {
      return nft.rarity
    }
    return highest
  }, null as null | NFT['rarity'])

  return {
    totalDistance,
    totalEarnings,
    bestRarity
  }
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
