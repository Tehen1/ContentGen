"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchUserNFTs } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface BikeNFT {
  id: number
  name: string
  image: string
  attributes: {
    level: number
    bikeType: string
    color: string
  }
}

export default function BikeSelector() {
  const [bikes, setBikes] = useState<BikeNFT[]>([])
  const [selectedBike, setSelectedBike] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const { address, isConnected } = useAccount()
  const { toast } = useToast()

  useEffect(() => {
    const loadBikes = async () => {
      if (!isConnected || !address) return

      try {
        setLoading(true)
        const userBikes = await fetchUserNFTs(address)
        setBikes(userBikes)

        if (userBikes.length > 0) {
          setSelectedBike(userBikes[0].id.toString())
        }
      } catch (error) {
        console.error("Failed to load bikes:", error)
        toast({
          title: "Error loading bikes",
          description: "Could not load your bike collection",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadBikes()
  }, [address, isConnected, toast])

  const handleBikeChange = (value: string) => {
    setSelectedBike(value)
    // Store selected bike in local storage for activity tracking
    localStorage.setItem("selectedBikeId", value)
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Connect your wallet to select a bike</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Loading your bikes...</p>
        </CardContent>
      </Card>
    )
  }

  if (bikes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">You don't have any bikes yet</p>
        </CardContent>
      </Card>
    )
  }

  const selectedBikeObj = bikes.find((bike) => bike.id.toString() === selectedBike)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Bike</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedBike} onValueChange={handleBikeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a bike" />
          </SelectTrigger>
          <SelectContent>
            {bikes.map((bike) => (
              <SelectItem key={bike.id} value={bike.id.toString()}>
                {bike.name} (Level {bike.attributes.level})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedBikeObj && (
          <div className="mt-4 flex items-center gap-3">
            <div className="w-16 h-16 rounded-md overflow-hidden">
              <img
                src={selectedBikeObj.image || "/placeholder.svg"}
                alt={selectedBikeObj.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium">{selectedBikeObj.name}</p>
              <p className="text-sm text-muted-foreground">
                Level {selectedBikeObj.attributes.level} {selectedBikeObj.attributes.bikeType}
              </p>
              <p className="text-xs text-muted-foreground">Color: {selectedBikeObj.attributes.color}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
