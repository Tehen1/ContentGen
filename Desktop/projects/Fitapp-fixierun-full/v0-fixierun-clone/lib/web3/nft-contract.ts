import { ethers } from "ethers"
import { useWeb3 } from "./web3-provider"

// ABI simplifié pour un contrat NFT ERC-721
const NFT_ABI = [
  // Fonctions de lecture
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  
  // Fonctions d'écriture
  "function mint(address to, string memory tokenURI) returns (uint256)",
  "function approve(address to, uint256 tokenId)",
  "function setApprovalForAll(address operator, bool approved)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  
  // Événements
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
]

// ABI pour le marketplace
const MARKETPLACE_ABI = [
  // Fonctions de lecture
  "function getListingPrice() view returns (uint256)",
  "function getListing(uint256 tokenId) view returns (uint256 price, address seller, bool active)",
  "function getActiveListings() view returns (uint256[])",
  
  // Fonctions d'écriture
  "function listNFT(address nftContract, uint256 tokenId, uint256 price)",
  "function buyNFT(address nftContract, uint256 tokenId) payable",
  "function cancelListing(address nftContract, uint256 tokenId)",
  "function updatePrice(address nftContract, uint256 tokenId, uint256 newPrice)",
  
  // Événements
  "event NFTListed(address indexed nftContract, uint256 indexed tokenId, uint256 price, address indexed seller)",
  "event NFTSold(address indexed nftContract, uint256 indexed tokenId, uint256 price, address indexed seller, address indexed buyer)",
  "event ListingCancelled(address indexed nftContract, uint256 indexed tokenId, address indexed seller)",
]

// Adresses des contrats (à remplacer par les vraies adresses)
const CONTRACT_ADDRESSES = {
  NFT: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
  MARKETPLACE: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
}

export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
}

export interface NFTListing {
  tokenId: string
  price: string
  seller: string
  active: boolean
}

export class NFTContract {
  private contract: ethers.Contract | null = null
  private marketplaceContract: ethers.Contract | null = null
  private signer: ethers.JsonRpcSigner | null = null

  constructor(signer: ethers.JsonRpcSigner | null) {
    this.signer = signer
    if (signer) {
      this.contract = new ethers.Contract(CONTRACT_ADDRESSES.NFT, NFT_ABI, signer)
      this.marketplaceContract = new ethers.Contract(CONTRACT_ADDRESSES.MARKETPLACE, MARKETPLACE_ABI, signer)
    }
  }

  // Fonctions NFT
  async mintNFT(to: string, metadata: NFTMetadata): Promise<string> {
    if (!this.contract || !this.signer) {
      throw new Error("Contrat ou signer non initialisé")
    }

    try {
      // Upload metadata to IPFS (simulation)
      const tokenURI = await this.uploadMetadataToIPFS(metadata)
      
      // Mint le NFT
      const tx = await this.contract.mint(to, tokenURI)
      const receipt = await tx.wait()
      
      // Récupérer l'ID du token depuis les événements
      const transferEvent = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id("Transfer(address,address,uint256)")
      )
      
      if (transferEvent) {
        const tokenId = ethers.getBigInt(transferEvent.topics[3]).toString()
        return tokenId
      }
      
      throw new Error("Token ID non trouvé dans les événements")
    } catch (error) {
      console.error("Erreur lors du mint:", error)
      throw error
    }
  }

  async getNFTMetadata(tokenId: string): Promise<NFTMetadata | null> {
    if (!this.contract) {
      throw new Error("Contrat non initialisé")
    }

    try {
      const tokenURI = await this.contract.tokenURI(tokenId)
      // Récupérer les métadonnées depuis IPFS ou HTTP
      const response = await fetch(tokenURI)
      const metadata = await response.json()
      return metadata
    } catch (error) {
      console.error("Erreur lors de la récupération des métadonnées:", error)
      return null
    }
  }

  async getOwnerNFTs(owner: string): Promise<string[]> {
    if (!this.contract) {
      throw new Error("Contrat non initialisé")
    }

    try {
      const balance = await this.contract.balanceOf(owner)
      const tokenIds: string[] = []
      
      // Note: Cette méthode n'est pas optimale pour de gros volumes
      // En production, il faudrait utiliser des événements ou un indexer
      const totalSupply = await this.contract.totalSupply()
      
      for (let i = 1; i <= totalSupply; i++) {
        try {
          const tokenOwner = await this.contract.ownerOf(i)
          if (tokenOwner.toLowerCase() === owner.toLowerCase()) {
            tokenIds.push(i.toString())
          }
        } catch (error) {
          // Token peut ne pas exister
          continue
        }
      }
      
      return tokenIds
    } catch (error) {
      console.error("Erreur lors de la récupération des NFTs:", error)
      return []
    }
  }

  // Fonctions Marketplace
  async listNFT(tokenId: string, price: string): Promise<void> {
    if (!this.contract || !this.marketplaceContract || !this.signer) {
      throw new Error("Contrats ou signer non initialisés")
    }

    try {
      // Approuver le marketplace pour transférer le NFT
      const approveTx = await this.contract.approve(CONTRACT_ADDRESSES.MARKETPLACE, tokenId)
      await approveTx.wait()
      
      // Lister le NFT
      const priceInWei = ethers.parseEther(price)
      const listTx = await this.marketplaceContract.listNFT(CONTRACT_ADDRESSES.NFT, tokenId, priceInWei)
      await listTx.wait()
    } catch (error) {
      console.error("Erreur lors de la mise en vente:", error)
      throw error
    }
  }

  async buyNFT(tokenId: string, price: string): Promise<void> {
    if (!this.marketplaceContract) {
      throw new Error("Contrat marketplace non initialisé")
    }

    try {
      const priceInWei = ethers.parseEther(price)
      const tx = await this.marketplaceContract.buyNFT(CONTRACT_ADDRESSES.NFT, tokenId, {
        value: priceInWei
      })
      await tx.wait()
    } catch (error) {
      console.error("Erreur lors de l'achat:", error)
      throw error
    }
  }

  async cancelListing(tokenId: string): Promise<void> {
    if (!this.marketplaceContract) {
      throw new Error("Contrat marketplace non initialisé")
    }

    try {
      const tx = await this.marketplaceContract.cancelListing(CONTRACT_ADDRESSES.NFT, tokenId)
      await tx.wait()
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error)
      throw error
    }
  }

  async getActiveListings(): Promise<NFTListing[]> {
    if (!this.marketplaceContract) {
      throw new Error("Contrat marketplace non initialisé")
    }

    try {
      const tokenIds = await this.marketplaceContract.getActiveListings()
      const listings: NFTListing[] = []
      
      for (const tokenId of tokenIds) {
        const listing = await this.marketplaceContract.getListing(tokenId)
        listings.push({
          tokenId: tokenId.toString(),
          price: ethers.formatEther(listing.price),
          seller: listing.seller,
          active: listing.active
        })
      }
      
      return listings
    } catch (error) {
      console.error("Erreur lors de la récupération des listings:", error)
      return []
    }
  }

  // Utilitaires
  private async uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
    // Simulation d'upload IPFS
    // En production, utiliser un service comme Pinata, Infura IPFS, ou Web3.Storage
    const metadataString = JSON.stringify(metadata)
    const blob = new Blob([metadataString], { type: 'application/json' })
    
    // Pour la démo, on retourne une URL fictive
    // En réalité, il faudrait uploader vers IPFS
    return `ipfs://QmExample${Date.now()}`
  }
}

// Hook pour utiliser le contrat NFT
export function useNFTContract() {
  const { signer, isConnected } = useWeb3()
  
  const contract = isConnected && signer ? new NFTContract(signer) : null
  
  return {
    contract,
    isReady: !!contract
  }
}

// Utilitaires pour les métadonnées
export function createBikeMetadata(
  name: string,
  description: string,
  imageUrl: string,
  attributes: {
    rarity: string
    speed: number
    endurance: number
    boostType: string
    boostAmount: number
  }
): NFTMetadata {
  return {
    name,
    description,
    image: imageUrl,
    attributes: [
      { trait_type: "Rarity", value: attributes.rarity },
      { trait_type: "Speed", value: attributes.speed },
      { trait_type: "Endurance", value: attributes.endurance },
      { trait_type: "Boost Type", value: attributes.boostType },
      { trait_type: "Boost Amount", value: `${attributes.boostAmount}%` },
      { trait_type: "Category", value: "Bike" },
      { trait_type: "Created", value: new Date().toISOString() }
    ]
  }
}