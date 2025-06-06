import type { ReactNode } from "react"
import { DashboardFooter } from "@/components/dashboard/dashboard-footer"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
      <DashboardFooter />
    </div>
  )
}
