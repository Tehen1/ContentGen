import { Metadata } from "next"
import { MarketplaceClient } from "./MarketplaceClient"

export const metadata: Metadata = {
  title: "Marketplace - Fixie.Run",
  description: "Achetez et vendez des NFTs de vélos uniques sur la marketplace Fixie.Run",
}

export default function MarketplacePage() {
  return <MarketplaceClient />
}