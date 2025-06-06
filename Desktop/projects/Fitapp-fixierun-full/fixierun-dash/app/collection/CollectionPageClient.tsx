"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, Filter, Search, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardFooter } from "@/components/dashboard/dashboard-footer"

// Updated NFT data with new bikes
const nfts = [
  {
    id: "1",
    name: "Constellation Rider",
    rarity: "Legendary",
    level: 50,
    image: "/constellation-fixie.jpeg",
    stats: {
      speed: 99,
      endurance: 96,
      earnings: 40,
    },
    lastUsed: "2 hours ago",
  },
  {
    id: "2",
    name: "Rainbow Velocity",
    rarity: "Epic",
    level: 35,
    image: "/rainbow-neon-fixie.png",
    stats: {
      speed: 92,
      endurance: 88,
      earnings: 30,
    },
    lastUsed: "1 day ago",
  },
  {
    id: "3",
    name: "Cosmic Cruiser",
    rarity: "Legendary",
    level: 48,
    image: "/cosmic-blue-fixie.png",
    stats: {
      speed: 96,
      endurance: 94,
      earnings: 38,
    },
    lastUsed: "3 days ago",
  },
  {
    id: "4",
    name: "Neon Cyclondon",
    rarity: "Legendary",
    level: 45,
    image: "/neon-cyclondon.jpeg",
    stats: {
      speed: 98,
      endurance: 92,
      earnings: 36,
    },
    lastUsed: "1 week ago",
  },
  {
    id: "5",
    name: "Legendarium Pro",
    rarity: "Legendary",
    level: 42,
    image: "/legendarium-bike.jpeg",
    stats: {
      speed: 97,
      endurance: 94,
      earnings: 35,
    },
    lastUsed: "2 weeks ago",
  },
  {
    id: "6",
    name: "Golden Particle",
    rarity: "Epic",
    level: 38,
    image: "/golden-particle-fixie.jpeg",
    stats: {
      speed: 89,
      endurance: 91,
      earnings: 28,
    },
    lastUsed: "3 weeks ago",
  },
  {
    id: "7",
    name: "Urban Chic Fixie",
    rarity: "Common",
    level: 12,
    image: "/urban-chic-fixie.png",
    stats: {
      speed: 75,
      endurance: 82,
      earnings: 10,
    },
    lastUsed: "1 month ago",
  },
  {
    id: "8",
    name: "Cyberpunk Racer",
    rarity: "Legendary",
    level: 45,
    image: "/cyberpunk-racer.png",
    stats: {
      speed: 99,
      endurance: 90,
      earnings: 38,
    },
    lastUsed: "2 months ago",
  },
]

export default function CollectionPageClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("level")
  const [filterRarity, setFilterRarity] = useState("all")

  // Filter and sort NFTs
  const filteredNFTs = nfts
    .filter((nft) => {
      // Filter by search query
      if (searchQuery && !nft.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      // Filter by rarity
      if (filterRarity !== "all" && nft.rarity.toLowerCase() !== filterRarity.toLowerCase()) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      // Sort by selected criteria
      switch (sortBy) {
        case "level":
          return b.level - a.level
        case "name":
          return a.name.localeCompare(b.name)
        case "rarity":
          return a.rarity.localeCompare(b.rarity)
        case "speed":
          return b.stats.speed - a.stats.speed
        case "endurance":
          return b.stats.endurance - a.stats.endurance
        case "earnings":
          return b.stats.earnings - a.stats.earnings
        default:
          return 0
      }
    })

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <main className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">My NFT Collection</h1>
          <p className="text-muted-foreground">
            Manage your NFT bikes, view their stats, and select which one to use for your rides.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="search"
              placeholder="Search bikes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
            <Button type="submit" size="sm" className="h-9 px-4 py-2">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter: {filterRarity === "all" ? "All Rarities" : filterRarity}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Rarity</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterRarity("all")}>All Rarities</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRarity("common")}>Common</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRarity("uncommon")}>Uncommon</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRarity("rare")}>Rare</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRarity("epic")}>Epic</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRarity("legendary")}>Legendary</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy("level")}>Level</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name")}>Name</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("rarity")}>Rarity</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("speed")}>Speed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("endurance")}>Endurance</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("earnings")}>Earnings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
            <Link href="/create-nft">
              <Button>Create NFT</Button>
            </Link>
          </div>
          <TabsContent value="grid" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredNFTs.map((nft) => (
                <Card key={nft.id} className="overflow-hidden">
                  <div className="relative aspect-square">
                    <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-cover" />
                    <div
                      className={`absolute top-2 left-2 rounded-full px-3 py-1 text-xs font-medium text-white ${
                        nft.rarity === "Legendary"
                          ? "bg-purple-600"
                          : nft.rarity === "Epic"
                            ? "bg-blue-600"
                            : nft.rarity === "Rare"
                              ? "bg-green-600"
                              : nft.rarity === "Uncommon"
                                ? "bg-yellow-600"
                                : "bg-gray-600"
                      }`}
                    >
                      {nft.rarity}
                    </div>
                    <div className="absolute top-2 right-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                      Level {nft.level}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-bold">{nft.name}</h3>
                      <span className="text-xs text-muted-foreground">Last used: {nft.lastUsed}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">SPEED</div>
                        <div className="font-bold">{nft.stats.speed}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">ENDURANCE</div>
                        <div className="font-bold">{nft.stats.endurance}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">EARNINGS</div>
                        <div className="font-bold text-green-500">+{nft.stats.earnings}%</div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View
                      </Button>
                      <Button size="sm" className="flex-1">
                        Use
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="list" className="mt-6">
            <div className="rounded-lg border">
              <div className="grid grid-cols-12 gap-2 border-b bg-muted p-4 font-medium">
                <div className="col-span-5">Bike</div>
                <div className="col-span-1 text-center">Level</div>
                <div className="col-span-1 text-center">Speed</div>
                <div className="col-span-1 text-center">Endurance</div>
                <div className="col-span-1 text-center">Earnings</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>
              {filteredNFTs.map((nft) => (
                <div key={nft.id} className="grid grid-cols-12 gap-2 border-b p-4 items-center">
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-md">
                      <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="font-medium">{nft.name}</div>
                      <div
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                          nft.rarity === "Legendary"
                            ? "bg-purple-600"
                            : nft.rarity === "Epic"
                              ? "bg-blue-600"
                              : nft.rarity === "Rare"
                                ? "bg-green-600"
                                : nft.rarity === "Uncommon"
                                  ? "bg-yellow-600"
                                  : "bg-gray-600"
                        }`}
                      >
                        {nft.rarity}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 text-center">{nft.level}</div>
                  <div className="col-span-1 text-center">{nft.stats.speed}</div>
                  <div className="col-span-1 text-center">{nft.stats.endurance}</div>
                  <div className="col-span-1 text-center text-green-500">+{nft.stats.earnings}%</div>
                  <div className="col-span-3 flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button size="sm">Use</Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <DashboardFooter />
    </div>
  )
}
