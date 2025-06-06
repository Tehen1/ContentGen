import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProfileForm } from "@/components/profile-form"
import { ProfileStats } from "@/components/profile-stats"
import { ProfileAchievements } from "@/components/profile-achievements"

export default function ProfilePage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Profile" text="Manage your profile and preferences." />
      <div className="grid gap-4 md:grid-cols-7">
        <div className="col-span-4">
          <ProfileForm />
        </div>
        <div className="col-span-3">
          <ProfileStats />
          <ProfileAchievements />
        </div>
      </div>
    </DashboardShell>
  )
}
