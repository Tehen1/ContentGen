import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { FriendsList } from "@/components/friends-list"
import { FriendSearch } from "@/components/friend-search"

export default function FriendsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Friends" text="Connect with friends and see their activities.">
        <FriendSearch />
      </DashboardHeader>
      <FriendsList />
    </DashboardShell>
  )
}
