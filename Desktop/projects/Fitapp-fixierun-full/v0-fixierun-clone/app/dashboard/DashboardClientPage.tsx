"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityTracker } from "@/components/dashboard/activity-tracker"
import { NFTBikeStatus } from "@/components/dashboard/nft-bike-status"
import { ActivityStatistics } from "@/components/dashboard/activity-statistics"
import { ActivityMap } from "@/components/dashboard/activity-map"
import { RewardsAndChallenges } from "@/components/dashboard/rewards-and-challenges"
import { ActivityAnalysis } from "@/components/dashboard/activity-analysis"
import { DashboardFooter } from "@/components/dashboard/dashboard-footer"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { CyclingActivityList } from "@/components/dashboard/cycling-activity-list"

// Mock data to prevent server calls during initial load
const mockData = {
  userData: {
    weekly_distance: 87.5,
    token_balance: 1250,
    total_activities: 12,
    total_distance: 87.5,
    total_duration: 30240, // 8h 24m in seconds
    total_calories: 4250,
  },
  userNFTs: [
    {
      id: "1",
      name: "Neon Velocity X9",
      image_url: "/futuristic-neon-bike.png",
      rarity: "Legendary",
      level: 42,
      boost_type: "earnings",
      boost_amount: 35,
    },
  ],
  userActivities: [
    {
      id: "1",
      activity_type: "cycling",
      distance: 12.4,
      duration: 3600, // 1 hour in seconds
      calories: 450,
      tokens_earned: 125,
      start_time: new Date(Date.now() - 86400000).toISOString(), // yesterday
      end_time: new Date(Date.now() - 82800000).toISOString(), // yesterday + 1 hour
    },
  ],
  userChallenges: [
    {
      id: "1",
      name: "Daily Streak",
      description: "5 days in a row",
      type: "streak",
      target_value: 5,
      reward_tokens: 15,
      current_value: 5,
      completed: true,
    },
    {
      id: "2",
      name: "Distance Milestone",
      description: "Reached 100km this week",
      type: "distance",
      target_value: 100,
      reward_tokens: 50,
      current_value: 100,
      completed: true,
    },
    {
      id: "3",
      name: "Community Challenge",
      description: "Top 100 in city leaderboard",
      type: "leaderboard",
      target_value: 100,
      reward_tokens: 25,
      current_value: 42,
      completed: true,
    },
  ],
}

export default function DashboardPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [cyclingData, setCyclingData] = useState([])

  useEffect(() => {
    async function fetchCyclingData() {
      setIsLoading(true)
      try {
        const response = await fetch("/cycling-activity.json")
        const data = await response.json()
        setCyclingData(data)
      } catch (error: any) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCyclingData()
  }, [])

  // Use mock data directly instead of fetching from server
  const { userData, userNFTs, userActivities, userChallenges } = mockData

  try {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 space-y-8 p-4 md:p-8">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold">Rider Dashboard</h1>
            <p className="text-muted-foreground">
              Track your cycling activities, earn rewards, and watch your NFT bike evolve.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Today&apos;s Distance</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">
                    {userData?.weekly_distance ? (userData.weekly_distance / 7).toFixed(1) : "0.0"} km
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weekly Rank</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">#42</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">$FIX Balance</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{userData?.token_balance || "0"}</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Activity Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityTracker />
              </CardContent>
            </Card>
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>NFT Bike Status</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <NFTBikeStatus nft={userNFTs?.[0]} />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Activity Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <ActivityStatistics stats={userData} />
                )}
              </CardContent>
            </Card>
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Activity Map</CardTitle>
                <CardDescription>Last Ride: Central Park Loop</CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityMap activity={userActivities?.[0]} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Rewards & Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <RewardsAndChallenges challenges={userChallenges} />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Activity Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityAnalysis activities={userActivities} />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Cycling Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <CyclingActivityList cyclingData={cyclingData} />
              )}
            </CardContent>
          </Card>
        </main>

        <DashboardFooter />
      </div>
    )
  } catch (err) {
    console.error("Error rendering dashboard:", err)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Une erreur s'est produite lors du chargement du tableau de bord. Veuillez réessayer plus tard.
          </AlertDescription>
        </Alert>
      </div>
    )
  }
}
