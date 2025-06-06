import Header from "@/components/header"
import Footer from "@/components/footer"
import DashboardHero from "@/components/dashboard/dashboard-hero"
import ActivityStats from "@/components/dashboard/activity-stats"
import ActivityTracker from "@/components/dashboard/activity-tracker"
import BikeStatus from "@/components/dashboard/bike-status"
import RewardsPanel from "@/components/dashboard/rewards-panel"
import ActivityChart from "@/components/dashboard/activity-chart"

export default function Dashboard() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <section className="pt-28 pb-16 md:pt-32 md:pb-24 relative overflow-hidden themed-section">
        <div className="absolute inset-0 z-0 themed-bg"></div>

        <div className="container mx-auto px-4 relative z-10">
          <DashboardHero />

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
            {/* Left Column - Stats & Activity */}
            <div className="lg:col-span-2 space-y-8">
              <ActivityStats />
              <ActivityChart />
              <ActivityTracker />
            </div>

            {/* Right Column - Bike & Rewards */}
            <div className="space-y-8">
              <BikeStatus />
              <RewardsPanel />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
