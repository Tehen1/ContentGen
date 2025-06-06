import { type NextRequest, NextResponse } from "next/server"

// Données mockées pour les NFTs
const mockNFTData = {
  "1": {
    name: "Cyber Racer #1",
    description: "Un vélo fixie cyberpunk avec des néons bleus",
    image: "/bikes/cyberpunk-racer.png",
    attributes: [
      { trait_type: "Rarity", value: "Legendary" },
      { trait_type: "Speed", value: "95" },
      { trait_type: "Style", value: "Cyberpunk" },
      { trait_type: "Color", value: "Neon Blue" },
    ],
  },
  "2": {
    name: "Neon Velocity #2",
    description: "Un vélo fixie avec des effets de lumière violette",
    image: "/bikes/neon-velocity.png",
    attributes: [
      { trait_type: "Rarity", value: "Epic" },
      { trait_type: "Speed", value: "88" },
      { trait_type: "Style", value: "Neon" },
      { trait_type: "Color", value: "Purple" },
    ],
  },
  "3": {
    name: "Digital Dream #3",
    description: "Un vélo fixie futuriste avec des hologrammes",
    image: "/bikes/digital-dream.png",
    attributes: [
      { trait_type: "Rarity", value: "Rare" },
      { trait_type: "Speed", value: "82" },
      { trait_type: "Style", value: "Digital" },
      { trait_type: "Color", value: "Holographic" },
    ],
  },
}

export async function GET(request: NextRequest, { params }: { params: { tokenId: string } }) {
  try {
    const tokenId = params.tokenId

    // Vérifier si le tokenId existe dans nos données mockées
    const nftData = mockNFTData[tokenId as keyof typeof mockNFTData]

    if (!nftData) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 })
    }

    // Retourner les métadonnées au format standard ERC-721
    return NextResponse.json({
      name: nftData.name,
      description: nftData.description,
      image: nftData.image,
      attributes: nftData.attributes,
      external_url: `https://fixie.run/nft/${tokenId}`,
      background_color: "000000",
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des métadonnées NFT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
