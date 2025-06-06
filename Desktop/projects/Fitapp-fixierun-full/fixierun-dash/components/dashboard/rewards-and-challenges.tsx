import { Check, Trophy } from "lucide-react"

import { Separator } from "@/components/ui/separator"

interface Challenge {
  id: string
  name: string
  description: string
  type: string
  target_value: number
  reward_tokens: number
  current_value: number
  completed: boolean
}

interface RewardsAndChallengesProps {
  challenges?: Challenge[]
}

export function RewardsAndChallenges({ challenges }: RewardsAndChallengesProps) {
  // Default challenges if none are provided
  const defaultChallenges = [
    {
      id: "1",
      name: "Daily Streak",
      description: "5 days in a row",
      type: "streak",
      target_value: 5,
      reward_tokens: 15,
      current_value: 5,
      completed: true,
    },
    {
      id: "2",
      name: "Distance Milestone",
      description: "Reached 100km this week",
      type: "distance",
      target_value: 100,
      reward_tokens: 50,
      current_value: 100,
      completed: true,
    },
    {
      id: "3",
      name: "Community Challenge",
      description: "Top 100 in city leaderboard",
      type: "leaderboard",
      target_value: 100,
      reward_tokens: 25,
      current_value: 42,
      completed: true,
    },
  ]

  const displayChallenges = challenges?.length ? challenges : defaultChallenges

  // Calculate total rewards
  const totalRewards = displayChallenges
    .filter((challenge) => challenge.completed)
    .reduce((sum, challenge) => sum + challenge.reward_tokens, 0)

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {displayChallenges.map((challenge) => (
          <div key={challenge.id} className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                {challenge.completed ? (
                  <Check className="h-3 w-3 text-primary" />
                ) : (
                  <Trophy className="h-3 w-3 text-primary" />
                )}
              </div>
              <div>
                <div className="font-medium">{challenge.name}</div>
                <div className="text-xs text-muted-foreground">{challenge.description}</div>
              </div>
            </div>
            <div className="text-sm font-medium text-green-500">+{challenge.reward_tokens} $FIX</div>
          </div>
        ))}
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <div className="font-medium">Total Rewards This Week</div>
        <div className="font-bold text-green-500">+{totalRewards} $FIX</div>
      </div>
    </div>
  )
}
