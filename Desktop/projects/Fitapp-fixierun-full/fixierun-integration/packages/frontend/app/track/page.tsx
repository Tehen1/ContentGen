import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import ActivityTracker from "@/components/activity/activity-tracker"
import ActivityMap from "@/components/activity/activity-map"
import BikeSelector from "@/components/activity/bike-selector"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function TrackPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-8 pb-20 md:pb-8">
      <h1 className="text-3xl font-bold mb-6">Track Activity</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <ActivityTracker />

          <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
            <BikeSelector />
          </Suspense>
        </div>

        <div className="md:col-span-2">
          <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
            <ActivityMap />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
