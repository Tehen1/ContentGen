"use client"

import { useUserNFTs, getRarityColor, getRarityGradient } from "@/lib/nft/client-utils"
import { useWeb3 } from "@/components/providers/simple-web3-provider"
import { supportedChains } from "@/lib/web3/config"
import Image from "next/image"
import { Zap, Shield, Award } from "lucide-react"
import { useMemo } from "react"
import type { RarityLevel, NFT } from "@/lib/nft/types"

type SortOption = "newest" | "oldest" | "rarity" | "level"

interface EnhancedNFTGalleryProps {
  rarityFilter?: RarityLevel | ""
  sortOption?: SortOption
}

export function EnhancedNFTGallery({ 
  rarityFilter = "", 
  sortOption = "newest" 
}: EnhancedNFTGalleryProps) {
  const { isConnected, address, chainId } = useWeb3()
  const { nfts, isLoading, error } = useUserNFTs()

  // Connection check
  if (!isConnected) {
    return (
      <div className="text-center p-8 bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm shadow-lg cyber-border">
        <h2 className="text-2xl font-cyber font-bold mb-4 text-white">Connect Your Wallet</h2>
        <p className="text-gray-300 mb-6">Connect your wallet to view your NFT collection</p>
        <button 
          onClick={() => window.dispatchEvent(new Event('connect-wallet'))}
          className="cyber-button px-6 py-2 uppercase font-bold shadow-neon-glow"
        >
          Connect Wallet
        </button>
      </div>
    )
  }

  // Network validation
  const isValidNetwork = chainId && supportedChains.map(c => c.id).includes(chainId)
  
  if (!isValidNetwork) {
    return (
      <div className="text-center p-8 bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm shadow-lg cyber-border">
        <h2 className="text-2xl font-cyber font-bold mb-4 text-white">Unsupported Network</h2>
        <p className="text-gray-300 mb-6">Please switch to a supported network:</p>
        <ul className="mb-6 space-y-2">
          {supportedChains.map(chain => (
            <li key={chain.id} className="text-accent">
              {chain.name}
            </li>
          ))}
        </ul>
        <button className="cyber-button px-6 py-2 uppercase font-bold shadow-neon-glow">
          Switch Network
        </button>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm overflow-hidden cyber-border animate-pulse">
            <div className="h-64 bg-gradient-to-r from-cyberpunk-darker to-cyberpunk-dark"></div>
            <div className="p-6 space-y-4">
              <div className="h-6 bg-gradient-to-r from-cyberpunk-darker to-cyberpunk-dark rounded-sm w-3/4"></div>
              <div className="h-4 bg-gradient-to-r from-cyberpunk-darker to-cyberpunk-dark rounded-sm"></div>
              <div className="grid grid-cols-3 gap-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-12 bg-gradient-to-r from-cyberpunk-darker to-cyberpunk-dark rounded-sm"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center p-8 bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm shadow-lg cyber-border">
        <h2 className="text-2xl font-cyber font-bold mb-4 text-red-500">Error Loading NFTs</h2>
        <p className="text-gray-300">{error}</p>
      </div>
    )
  }

  // Filter and sort NFTs
  const processedNFTs = useMemo(() => {
    let filteredNFTs = [...nfts];
    
    // Filter by rarity if specified
    if (rarityFilter) {
      filteredNFTs = filteredNFTs.filter(nft => nft.rarity === rarityFilter);
    }
    
    // Sort NFTs based on the selected option
    return filteredNFTs.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          // Assuming tokenId is sequential, higher tokenId = newer
          return parseInt(b.tokenId) - parseInt(a.tokenId);
        case "oldest":
          return parseInt(a.tokenId) - parseInt(b.tokenId);
        case "rarity": {
          // Sort by rarity (Legendary > Epic > Rare > Common)
          const rarityOrder = {
            "Legendary": 4,
            "Epic": 3,
            "Rare": 2,
            "Common": 1
          };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        }
        case "level": {
          // Find level attribute and sort by it
          const getLevel = (nft: NFT) => {
            const levelAttr = nft.attributes.find(attr => attr.trait_type.toLowerCase() === "level");
            return levelAttr ? Number(levelAttr.value) : 0;
          };
          return getLevel(b) - getLevel(a);
        }
        default:
          return 0;
      }
    });
  }, [nfts, rarityFilter, sortOption]);

  // Empty state
  if (nfts.length === 0) {
    return (
      <div className="text-center p-8 bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm shadow-lg cyber-border">
        <h2 className="text-2xl font-cyber font-bold mb-4 text-white">No NFTs Found</h2>
        <p className="text-gray-300 mb-6">You don't have any Fixie NFTs in your collection yet</p>
        <a href="/create-nft" className="cyber-button px-6 py-2 uppercase font-bold shadow-neon-glow">
          Create Your First NFT
        </a>
      </div>
    )
  }

  // Empty state after filtering
  if (processedNFTs.length === 0 && nfts.length > 0) {
    return (
      <div className="text-center p-8 bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm shadow-lg cyber-border">
        <h2 className="text-2xl font-cyber font-bold mb-4 text-white">No NFTs Match Filter</h2>
        <p className="text-gray-300 mb-6">Try adjusting your filter settings</p>
      </div>
    );
  }

  // Success state - NFT gallery
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {processedNFTs.map(nft => (
        <div
          key={nft.tokenId}
          className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm overflow-hidden cyber-border hover:shadow-neon-glow transition-all duration-300 group"
        >
          <div className="relative h-64">
            <Image
              src={nft.image}
              alt={nft.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className={`absolute top-2 right-2 ${getRarityColor(nft.rarity)} px-2 py-1 rounded-sm text-xs font-cyber text-white`}>
              {nft.rarity}
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-cyber font-bold text-white mb-2">{nft.name}</h3>
            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{nft.description}</p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {nft.attributes.map((attr, index) => (
                <div key={index} className="bg-black/30 p-2 rounded-sm text-center">
                  <div className="text-accent text-xs">{attr.trait_type}</div>
                  <div className="text-white font-bold">{attr.value}</div>
                </div>
              ))}
            </div>

            <div className={`h-1 bg-gradient-to-r ${getRarityGradient(nft.rarity)} rounded-full mb-4`}></div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Token #{nft.tokenId}</span>
              <a
                href={`/nft/${nft.tokenId}`}
                className="bg-accent/20 text-accent px-3 py-1 rounded-sm hover:bg-accent/30 transition-colors text-sm"
              >
                View Details
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
