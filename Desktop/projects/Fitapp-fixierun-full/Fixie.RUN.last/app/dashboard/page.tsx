import type { Metadata } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"
import DashboardHero from "@/components/dashboard/dashboard-hero"
import ActivityTracker from "@/components/dashboard/activity-tracker"
import ActivityStats from "@/components/dashboard/activity-stats"
import RewardsPanel from "@/components/dashboard/rewards-panel"
import ActivityMap from "@/components/dashboard/activity-map"
import ActivityChart from "@/components/dashboard/activity-chart"
import BikeStatus from "@/components/dashboard/bike-status"
import ThemeDemo from "@/components/theme-demo"
import UserProfile from "@/components/user-profile";

export const metadata: Metadata = {
  title: "Dashboard | Fixie.Run",
  description: "Track your cycling activities, earn rewards, and watch your NFT bike evolve.",
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Scanline effect */}
      <div className="scanline" aria-hidden="true"></div>

      <Header />
      <DashboardHero />

      <section className="py-8 md:py-12 relative overflow-hidden themed-section">
        <div className="absolute inset-0 z-0 themed-bg"></div>
        <div className="absolute inset-0 bg-cyber-grid z-0 opacity-20"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Activity tracking and bike status */}
            <div className="lg:col-span-1 space-y-6">
              <UserProfile />
              <ActivityTracker />
              <BikeStatus />
            </div>

            {/* Middle and right columns - Stats, map, and charts */}
            <div className="lg:col-span-2 space-y-6">
              <ActivityStats />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ActivityMap />
                <RewardsPanel />
              </div>
              <ActivityChart />
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ThemeDemo />
    </main>
  )
}
