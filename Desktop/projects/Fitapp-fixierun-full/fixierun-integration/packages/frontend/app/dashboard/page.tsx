import { Suspense } from "react"
import ActivityMetrics from "@/components/activity/activity-metrics"
import ActivityVisualizations from "@/components/activity/activity-visualizations"
import RewardsOverview from "@/components/rewards/rewards-overview"
import NftCollection from "@/components/nft/nft-collection"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Activity Dashboard</h1>

      <Tabs defaultValue="activity">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="nfts">NFT Bikes</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <ActivityMetrics />
          </Suspense>
        </TabsContent>

        <TabsContent value="visualizations">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <ActivityVisualizations />
          </Suspense>
        </TabsContent>

        <TabsContent value="rewards">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <RewardsOverview />
          </Suspense>
        </TabsContent>

        <TabsContent value="nfts">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <NftCollection />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
