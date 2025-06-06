"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Bike, Info, Plus, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardFooter } from "@/components/dashboard/dashboard-footer"

export default function CreateNFTPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [rarity, setRarity] = useState("common")
  const [boostType, setBoostType] = useState("earnings")
  const [speedPoints, setSpeedPoints] = useState(50)
  const [endurancePoints, setEndurancePoints] = useState(50)
  const [remainingPoints, setRemainingPoints] = useState(0)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Calculate remaining points based on rarity
  const totalPoints = {
    common: 100,
    uncommon: 120,
    rare: 140,
    epic: 160,
    legendary: 180,
  }[rarity]

  // Update remaining points when speed or endurance changes
  const updatePoints = (type: "speed" | "endurance", value: number) => {
    if (type === "speed") {
      setSpeedPoints(value)
      setEndurancePoints(Math.min(endurancePoints, totalPoints - value))
    } else {
      setEndurancePoints(value)
      setSpeedPoints(Math.min(speedPoints, totalPoints - value))
    }
    setRemainingPoints(totalPoints - speedPoints - endurancePoints)
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Calculate boost amount based on rarity and boost type
  const boostAmounts = {
    common: { earnings: 10, speed: 5, endurance: 5 },
    uncommon: { earnings: 15, speed: 10, endurance: 10 },
    rare: { earnings: 20, speed: 15, endurance: 15 },
    epic: { earnings: 25, speed: 20, endurance: 20 },
    legendary: { earnings: 35, speed: 25, endurance: 25 },
  }

  const boostAmount = boostAmounts[rarity as keyof typeof boostAmounts][boostType as keyof typeof boostAmounts.common]

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <main className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Create NFT Bike</h1>
          <p className="text-muted-foreground">Design your own NFT bike with custom attributes and appearance.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the details of your new NFT bike.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Bike Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter a name for your bike"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Describe your bike's appearance and features"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rarity</Label>
                  <RadioGroup
                    value={rarity}
                    onValueChange={(value) => {
                      setRarity(value)
                      // Reset points when rarity changes
                      setSpeedPoints(50)
                      setEndurancePoints(50)
                    }}
                    className="grid grid-cols-2 gap-2 sm:grid-cols-5"
                  >
                    <div>
                      <RadioGroupItem value="common" id="common" className="peer sr-only" />
                      <Label
                        htmlFor="common"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="text-xs font-semibold uppercase text-gray-500">Common</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="uncommon" id="uncommon" className="peer sr-only" />
                      <Label
                        htmlFor="uncommon"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="text-xs font-semibold uppercase text-green-500">Uncommon</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="rare" id="rare" className="peer sr-only" />
                      <Label
                        htmlFor="rare"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="text-xs font-semibold uppercase text-blue-500">Rare</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="epic" id="epic" className="peer sr-only" />
                      <Label
                        htmlFor="epic"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="text-xs font-semibold uppercase text-purple-500">Epic</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="legendary" id="legendary" className="peer sr-only" />
                      <Label
                        htmlFor="legendary"
                        className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="text-xs font-semibold uppercase text-orange-500">Legendary</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label>Boost Type</Label>
                  <Select value={boostType} onValueChange={setBoostType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a boost type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="earnings">Earnings Boost</SelectItem>
                      <SelectItem value="speed">Speed Boost</SelectItem>
                      <SelectItem value="endurance">Endurance Boost</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Your bike will receive a +{boostAmount}% boost to {boostType}.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attribute Points</CardTitle>
                <CardDescription>
                  Distribute attribute points between speed and endurance. You have {remainingPoints} points remaining.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="speed">Speed: {speedPoints}</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Determines how fast your bike can go.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Slider
                    id="speed"
                    min={10}
                    max={totalPoints - 10}
                    step={1}
                    value={[speedPoints]}
                    onValueChange={(value) => updatePoints("speed", value[0])}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="endurance">Endurance: {endurancePoints}</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Determines how long your bike can maintain performance.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Slider
                    id="endurance"
                    min={10}
                    max={totalPoints - 10}
                    step={1}
                    value={[endurancePoints]}
                    onValueChange={(value) => updatePoints("endurance", value[0])}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bike Appearance</CardTitle>
                <CardDescription>Upload an image for your NFT bike.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="relative h-64 w-full overflow-hidden rounded-lg border-2 border-dashed border-muted bg-muted">
                    {imagePreview ? (
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Bike preview"
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                        <Bike className="h-16 w-16 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Upload an image of your bike or drag and drop here
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <label htmlFor="image-upload">
                      <Button variant="outline" className="cursor-pointer" asChild>
                        <div>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Image
                        </div>
                      </Button>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button variant="outline" onClick={() => setImagePreview(null)}>
                      Reset
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, GIF. Max size: 5MB.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>NFT Preview</CardTitle>
                <CardDescription>This is how your NFT will appear in the marketplace.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-lg border">
                  <div className="relative aspect-square bg-muted">
                    {imagePreview ? (
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Bike preview"
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                        <Bike className="h-16 w-16 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">No image uploaded</p>
                      </div>
                    )}
                    <div
                      className={`absolute top-2 left-2 rounded-full px-3 py-1 text-xs font-medium text-white ${
                        rarity === "legendary"
                          ? "bg-orange-500"
                          : rarity === "epic"
                            ? "bg-purple-500"
                            : rarity === "rare"
                              ? "bg-blue-500"
                              : rarity === "uncommon"
                                ? "bg-green-500"
                                : "bg-gray-500"
                      }`}
                    >
                      {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                    </div>
                    <div className="absolute top-2 right-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                      Level 1
                    </div>
                  </div>
                  <div className="bg-background p-4">
                    <h3 className="font-bold">{name || "Unnamed Bike"}</h3>
                    <p className="text-xs text-muted-foreground">{description || "No description provided"}</p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">SPEED</div>
                        <div className="font-bold">{speedPoints}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">ENDURANCE</div>
                        <div className="font-bold">{endurancePoints}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">{boostType.toUpperCase()}</div>
                        <div className="font-bold text-green-500">+{boostAmount}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create NFT Bike
            </Button>
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}
