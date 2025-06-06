"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Grid, List, ShoppingCart, Heart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWeb3 } from "@/lib/web3/web3-provider"
import { useTranslation } from "@/lib/i18n/use-translation"

interface NFTItem {
  id: string
  name: string
  description: string
  image: string
  price: string
  currency: string
  seller: string
  rarity: "Common" | "Rare" | "Epic" | "Legendary"
  category: "Road" | "Mountain" | "Urban" | "Electric"
  likes: number
  views: number
  isLiked: boolean
}

const mockNFTs: NFTItem[] = [
  {
    id: "1",
    name: "Cosmic Blue Fixie",
    description: "Un vélo fixie aux couleurs cosmiques avec des détails lumineux",
    image: "/cosmic-blue-fixie.png",
    price: "0.5",
    currency: "ETH",
    seller: "0x1234...5678",
    rarity: "Epic",
    category: "Urban",
    likes: 42,
    views: 156,
    isLiked: false,
  },
  {
    id: "2",
    name: "Neon Phantom",
    description: "Vélo fantôme avec éclairage néon intégré",
    image: "/neon-phantom.png",
    price: "1.2",
    currency: "ETH",
    seller: "0x9876...4321",
    rarity: "Legendary",
    category: "Electric",
    likes: 89,
    views: 234,
    isLiked: true,
  },
  {
    id: "3",
    name: "Urban Rider Action",
    description: "Vélo urbain parfait pour les déplacements en ville",
    image: "/urban-rider-action.png",
    price: "0.3",
    currency: "ETH",
    seller: "0x5555...7777",
    rarity: "Rare",
    category: "Urban",
    likes: 23,
    views: 98,
    isLiked: false,
  },
  {
    id: "4",
    name: "Cyberpunk Racer",
    description: "Vélo de course futuriste avec design cyberpunk",
    image: "/cyberpunk-racer.png",
    price: "0.8",
    currency: "ETH",
    seller: "0x3333...9999",
    rarity: "Epic",
    category: "Road",
    likes: 67,
    views: 189,
    isLiked: false,
  },
]

export function MarketplaceClient() {
  const [nfts, setNfts] = useState<NFTItem[]>(mockNFTs)
  const [filteredNfts, setFilteredNfts] = useState<NFTItem[]>(mockNFTs)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedRarity, setSelectedRarity] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const { isConnected, account } = useWeb3()
  const { t } = useTranslation()

  useEffect(() => {
    let filtered = nfts

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (nft) =>
          nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrer par catégorie
    if (selectedCategory !== "all") {
      filtered = filtered.filter((nft) => nft.category === selectedCategory)
    }

    // Filtrer par rareté
    if (selectedRarity !== "all") {
      filtered = filtered.filter((nft) => nft.rarity === selectedRarity)
    }

    // Trier
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
        break
      case "price-high":
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
        break
      case "popular":
        filtered.sort((a, b) => b.likes - a.likes)
        break
      case "newest":
      default:
        // Garder l'ordre par défaut
        break
    }

    setFilteredNfts(filtered)
  }, [searchTerm, selectedCategory, selectedRarity, sortBy, nfts])

  const handleLike = (id: string) => {
    setNfts((prev) =>
      prev.map((nft) =>
        nft.id === id
          ? {
              ...nft,
              isLiked: !nft.isLiked,
              likes: nft.isLiked ? nft.likes - 1 : nft.likes + 1,
            }
          : nft
      )
    )
  }

  const handleBuy = (nft: NFTItem) => {
    if (!isConnected) {
      alert("Veuillez connecter votre portefeuille pour acheter")
      return
    }
    // Logique d'achat NFT
    console.log("Achat NFT:", nft)
    alert(`Achat de ${nft.name} pour ${nft.price} ${nft.currency}`)
  }

  const getRarityColor = (rarity: string) => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Marketplace NFT</h1>
        <p className="text-muted-foreground">
          Découvrez et achetez des vélos NFT uniques créés par la communauté Fixie.Run
        </p>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des NFTs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              <SelectItem value="Road">Route</SelectItem>
              <SelectItem value="Mountain">VTT</SelectItem>
              <SelectItem value="Urban">Urbain</SelectItem>
              <SelectItem value="Electric">Électrique</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedRarity} onValueChange={setSelectedRarity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rareté" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les raretés</SelectItem>
              <SelectItem value="Common">Commun</SelectItem>
              <SelectItem value="Rare">Rare</SelectItem>
              <SelectItem value="Epic">Épique</SelectItem>
              <SelectItem value="Legendary">Légendaire</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Plus récent</SelectItem>
              <SelectItem value="price-low">Prix croissant</SelectItem>
              <SelectItem value="price-high">Prix décroissant</SelectItem>
              <SelectItem value="popular">Plus populaire</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grille des NFTs */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
        {filteredNfts.map((nft) => (
          <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="relative">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-48 object-cover"
                />
                <Badge className={`absolute top-2 right-2 ${getRarityColor(nft.rarity)}`}>
                  {nft.rarity}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 left-2 bg-black/50 hover:bg-black/70"
                  onClick={() => handleLike(nft.id)}
                >
                  <Heart className={`h-4 w-4 ${nft.isLiked ? "fill-red-500 text-red-500" : "text-white"}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg mb-2">{nft.name}</CardTitle>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {nft.description}
              </p>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {nft.views}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {nft.likes}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Prix</p>
                  <p className="text-lg font-bold">{nft.price} {nft.currency}</p>
                </div>
                <Badge variant="outline">{nft.category}</Badge>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button 
                className="w-full" 
                onClick={() => handleBuy(nft)}
                disabled={!isConnected}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isConnected ? "Acheter" : "Connecter le portefeuille"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredNfts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun NFT trouvé avec ces critères.</p>
        </div>
      )}
    </div>
  )
}