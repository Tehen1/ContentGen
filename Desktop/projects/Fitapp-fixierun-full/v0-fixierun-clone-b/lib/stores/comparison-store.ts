// Add these functions to the existing comparison-store.ts

import type { NFT } from "@/lib/nft/types"

interface ImportedComparison {
  timestamp: string
  note?: string
  nft1: {
    tokenId: string
    name: string
    rarity: string
    attributes: Array<{ trait_type: string; value: string | number }>
  }
  nft2: {
    tokenId: string
    name: string
    rarity: string
    attributes: Array<{ trait_type: string; value: string | number }>
  }
}

// Add these to the ComparisonStore interface
interface ComparisonStore {
  // ... existing properties ...
  importComparison: (data: ImportedComparison) => void
  searchHistory: (query: string) => ComparisonRecord[]
}

// Update the store creation
export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      // ... existing properties ...
      
      importComparison: (data) => set((state) => ({
        history: [
          {
            id: `${Date.now()}-${data.nft1.tokenId}-${data.nft2.tokenId}`,
            timestamp: new Date(data.timestamp).getTime(),
            nfts: [data.nft1.tokenId, data.nft2.tokenId],
            note: data.note,
          },
          ...state.history,
        ].slice(0, 10), // Keep max 10 items
      })),

      searchHistory: (query) => {
        const state = get()
        const lowerQuery = query.toLowerCase()
        
        return state.history.filter((record) => {
          // Search in notes
          if (record.note?.toLowerCase().includes(lowerQuery)) {
            return true
          }
          
          // Search in NFT IDs
          if (record.nfts.some(id => id.toLowerCase().includes(lowerQuery))) {
            return true
          }
          
          return false
        })
      },
    }),
    {
      name: "nft-comparison-history",
    }
  )
)
