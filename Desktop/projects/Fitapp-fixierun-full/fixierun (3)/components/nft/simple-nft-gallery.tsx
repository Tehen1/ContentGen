"use client"

import { useUserNFTs } from "@/lib/nft/client-utils"
import { NFTCardSimple } from "./nft-card-simple"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useWeb3 } from "@/components/providers/simple-web3-provider"

export function SimpleNFTGallery() {
  const { isConnected } = useWeb3()
  const { nfts, isLoading, error } = useUserNFTs()

  if (!isConnected) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">Connexion requise</h3>
          <p className="text-muted-foreground">Connectez votre portefeuille pour voir vos NFTs</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-0">
              <Skeleton className="w-full h-64 rounded-t-lg" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <p className="text-muted-foreground">Erreur lors du chargement des NFTs: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (nfts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">Aucun NFT trouvé</h3>
          <p className="text-muted-foreground">Vous n'avez pas encore de NFTs Fixie.Run</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {nfts.map((nft) => (
        <NFTCardSimple key={nft.tokenId} nft={nft} />
      ))}
    </div>
  )
}
