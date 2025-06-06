import type { Metadata } from "next"
import CollectionPageClient from "./CollectionPageClient"

export const metadata: Metadata = {
  title: "NFT Bike Collection - Fixed Gear Cycling NFTs | Fixie.Run",
  description:
    "Explore and manage your collection of evolving NFT fixed gear bikes. View stats, upgrade attributes, and trade unique cycling NFTs on the blockchain marketplace.",
  keywords: [
    "NFT bike collection",
    "fixed gear NFTs",
    "cycling NFT marketplace",
    "blockchain bike trading",
    "evolving NFT bikes",
    "cycling collectibles",
  ],
  openGraph: {
    title: "NFT Fixie Bike Collection - Blockchain Cycling Collectibles",
    description:
      "Discover unique NFT fixed gear bikes that evolve with your cycling performance. Collect, upgrade, and trade on the blockchain.",
  },
}

export default function CollectionPage() {
  return <CollectionPageClient />
}
