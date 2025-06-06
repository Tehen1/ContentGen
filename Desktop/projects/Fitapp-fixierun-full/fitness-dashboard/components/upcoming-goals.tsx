"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Calendar, Target, Timer, TrendingUp } from "lucide-react"

export function UpcomingGoals() {
  const goals = [
    {
      id: 1,
      title: "Run 100km this month",
      progress: 68,
      dueDate: "15 days left",
      type: "running",
      icon: <Timer className="h-4 w-4" />,
    },
    {
      id: 2,
      title: "Bike 200km this month",
      progress: 45,
      dueDate: "15 days left",
      type: "biking",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      id: 3,
      title: "Complete 5 activities per week",
      progress: 80,
      dueDate: "2 days left",
      type: "activity",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      id: 4,
      title: "Climb 1000m elevation",
      progress: 35,
      dueDate: "20 days left",
      type: "elevation",
      icon: <Target className="h-4 w-4" />,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Goals</CardTitle>
        <CardDescription>Track your progress towards your fitness goals.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {goal.icon}
                  <span className="text-sm font-medium">{goal.title}</span>
                </div>
                <Badge variant={goal.progress > 75 ? "default" : "outline"}>{goal.dueDate}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={goal.progress} className="h-2" />
                <span className="text-sm text-muted-foreground">{goal.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
