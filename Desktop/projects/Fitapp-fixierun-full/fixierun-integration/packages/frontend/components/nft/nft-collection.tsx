"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchUserNFTs } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface BikeNFT {
  id: number
  name: string
  image: string
  attributes: {
    level: number
    experience: number
    speed: number
    endurance: number
    efficiency: number
    rarity: number
    bikeType: string
    color: string
  }
}

export default function NftCollection() {
  const [nfts, setNfts] = useState<BikeNFT[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNft, setSelectedNft] = useState<BikeNFT | null>(null)
  const { address, isConnected } = useAccount()
  const { toast } = useToast()

  useEffect(() => {
    const loadNfts = async () => {
      if (!isConnected || !address) return

      try {
        setLoading(true)
        const userNfts = await fetchUserNFTs(address)
        setNfts(userNfts)

        if (userNfts.length > 0) {
          setSelectedNft(userNfts[0])
        }
      } catch (error) {
        console.error("Failed to load NFTs:", error)
        toast({
          title: "Error loading NFTs",
          description: "Could not load your bike collection",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadNfts()
  }, [address, isConnected, toast])

  const getNextLevelThreshold = (level: number) => {
    const thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500]
    return level < 10 ? thresholds[level] : thresholds[9]
  }

  const calculateProgress = (experience: number, level: number) => {
    if (level >= 10) return 100

    const currentThreshold = getNextLevelThreshold(level - 1)
    const nextThreshold = getNextLevelThreshold(level)
    const levelExperience = nextThreshold - currentThreshold
    const currentExperience = experience - currentThreshold

    return Math.floor((currentExperience / levelExperience) * 100)
  }

  const getRarityLabel = (rarity: number) => {
    switch (rarity) {
      case 1:
        return "Common"
      case 2:
        return "Uncommon"
      case 3:
        return "Rare"
      case 4:
        return "Epic"
      case 5:
        return "Legendary"
      default:
        return "Unknown"
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Connect your wallet to view your bike collection</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Loading your bike collection...</p>
        </CardContent>
      </Card>
    )
  }

  if (nfts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center gap-4">
          <p className="text-center">You don't have any bikes yet</p>
          <Button>Get Your First Bike</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Your Bikes</CardTitle>
            <CardDescription>Select a bike to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nfts.map((nft) => (
                <div
                  key={nft.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedNft?.id === nft.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedNft(nft)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md overflow-hidden">
                      <img
                        src={nft.image || "/placeholder.svg"}
                        alt={nft.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{nft.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Level {nft.attributes.level} {nft.attributes.bikeType}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedNft && (
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedNft.name}</CardTitle>
                  <CardDescription>
                    {selectedNft.attributes.bikeType} Bike • {selectedNft.attributes.color}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="ml-auto">
                  {getRarityLabel(selectedNft.attributes.rarity)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedNft.image || "/placeholder.svg"}
                    alt={selectedNft.name}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Level {selectedNft.attributes.level}</span>
                      <span className="text-sm text-muted-foreground">
                        {selectedNft.attributes.experience} / {getNextLevelThreshold(selectedNft.attributes.level)} XP
                      </span>
                    </div>
                    <Progress
                      value={calculateProgress(selectedNft.attributes.experience, selectedNft.attributes.level)}
                    />
                  </div>

                  <Tabs defaultValue="stats">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="stats">Stats</TabsTrigger>
                      <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="stats" className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Speed</span>
                          <span className="text-sm">{selectedNft.attributes.speed}/100</span>
                        </div>
                        <Progress value={selectedNft.attributes.speed} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Endurance</span>
                          <span className="text-sm">{selectedNft.attributes.endurance}/100</span>
                        </div>
                        <Progress value={selectedNft.attributes.endurance} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Efficiency</span>
                          <span className="text-sm">{selectedNft.attributes.efficiency}/100</span>
                        </div>
                        <Progress value={selectedNft.attributes.efficiency} />
                      </div>
                    </TabsContent>
                    <TabsContent value="history">
                      <div className="text-sm text-muted-foreground">
                        <p>Recent activity will appear here.</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Use This Bike</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
