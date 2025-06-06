import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { GoalsList } from "@/components/goals-list"
import { NewGoalButton } from "@/components/new-goal-button"

export default function GoalsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Goals" text="Set and track your fitness goals.">
        <NewGoalButton />
      </DashboardHeader>
      <GoalsList />
    </DashboardShell>
  )
}
