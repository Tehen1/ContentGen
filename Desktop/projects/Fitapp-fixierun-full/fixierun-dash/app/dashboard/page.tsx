import type { Metadata } from "next"
import DashboardClientPage from "./DashboardClientPage"

export const metadata: Metadata = {
  title: "Cycling Dashboard - Track Fixed Gear Rides & Crypto Earnings",
  description:
    "Monitor your fixed gear cycling performance, track $FIX token earnings, view NFT bike collection, and analyze ride statistics on your personalized Fixie.Run dashboard.",
  keywords: [
    "cycling dashboard",
    "fixie bike tracking",
    "crypto earnings tracker",
    "NFT bike collection",
    "cycling statistics",
    "blockchain fitness dashboard",
  ],
  openGraph: {
    title: "Fixie.Run Dashboard - Track Your Cycling & Crypto Rewards",
    description:
      "Personal dashboard for fixed gear cyclists. Track rides, monitor $FIX earnings, and manage your NFT bike collection.",
  },
}

export default function DashboardPage() {
  return <DashboardClientPage />
}
