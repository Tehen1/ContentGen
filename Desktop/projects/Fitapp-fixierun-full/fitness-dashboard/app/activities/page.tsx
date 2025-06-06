import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { ActivityDashboard } from "@/components/activity-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActivityCalendar } from "@/components/activity-calendar"
import { ActivityMap } from "@/components/activity-map"
import { ActivityList } from "@/components/activity-list"
import { ActivityFilters } from "@/components/activity-filters"
import { ActivityStats } from "@/components/activity-stats"
import { ActivityComparison } from "@/components/activity-comparison"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// Import the activity data
import { getAllActivities } from "@/lib/activity-data"

const activityData = getAllActivities();

export default function ActivitiesPage() {
  // Calculate summary statistics
  const totalActivities = activityData.length
  const totalDistance = activityData.reduce((sum, activity) => sum + activity.distance_km, 0)
  const averageDistance = totalDistance / totalActivities

  // Get only 2024 and 2025 activities
  const recentActivities = activityData.filter((activity) => {
    const year = new Date(activity.start_time).getFullYear()
    return year >= 2024
  })

  return (
    <DashboardShell>
      <DashboardHeader heading="Cycling Activities" text="Track and analyze your cycling performance.">
        <ActivityFilters />
      </DashboardHeader>

      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-[120px] w-full" />
              ))}
          </div>
        }
      >
        <ActivityStats
          totalActivities={totalActivities}
          totalDistance={totalDistance}
          averageDistance={averageDistance}
          activities={recentActivities}
        />
      </Suspense>

      <Tabs defaultValue="dashboard" className="mt-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="list">Activities</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-4">
          <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
            <ActivityDashboard activities={recentActivities} />
          </Suspense>
        </TabsContent>
        <TabsContent value="map" className="mt-4">
          <ActivityMap activities={recentActivities} />
        </TabsContent>
        <TabsContent value="calendar" className="mt-4">
          <ActivityCalendar activities={recentActivities} />
        </TabsContent>
        <TabsContent value="list" className="mt-4">
          <ActivityList activities={recentActivities} />
        </TabsContent>
        <TabsContent value="comparison" className="mt-4">
          <ActivityComparison activities={recentActivities} />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
