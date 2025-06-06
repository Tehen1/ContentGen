"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bike, Calendar, Edit, Timer, Trash, TrendingUp } from "lucide-react"

export function GoalsList() {
  const [activeTab, setActiveTab] = useState("active")

  const activeGoals = [
    {
      id: 1,
      title: "Run 100km this month",
      description: "Building endurance with consistent running",
      progress: 68,
      dueDate: "15 days left",
      type: "running",
      icon: <Timer className="h-4 w-4" />,
    },
    {
      id: 2,
      title: "Bike 200km this month",
      description: "Improving cycling distance",
      progress: 45,
      dueDate: "15 days left",
      type: "biking",
      icon: <Bike className="h-4 w-4" />,
    },
    {
      id: 3,
      title: "Complete 5 activities per week",
      description: "Maintaining consistency in workouts",
      progress: 80,
      dueDate: "2 days left",
      type: "activity",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      id: 4,
      title: "Climb 1000m elevation",
      description: "Building strength with elevation training",
      progress: 35,
      dueDate: "20 days left",
      type: "elevation",
      icon: <TrendingUp className="h-4 w-4" />,
    },
  ]

  const completedGoals = [
    {
      id: 5,
      title: "Run a half marathon",
      description: "Completed my first half marathon",
      progress: 100,
      completedDate: "Mar 15, 2023",
      type: "running",
      icon: <Timer className="h-4 w-4" />,
    },
    {
      id: 6,
      title: "Bike 150km in a week",
      description: "Intensive cycling week challenge",
      progress: 100,
      completedDate: "Feb 28, 2023",
      type: "biking",
      icon: <Bike className="h-4 w-4" />,
    },
    {
      id: 7,
      title: "30-day running streak",
      description: "Run every day for a month",
      progress: 100,
      completedDate: "Jan 30, 2023",
      type: "activity",
      icon: <Calendar className="h-4 w-4" />,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Goals</CardTitle>
        <CardDescription>Track and manage your fitness goals.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active" onClick={() => setActiveTab("active")}>
              Active Goals
            </TabsTrigger>
            <TabsTrigger value="completed" onClick={() => setActiveTab("completed")}>
              Completed Goals
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-4">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="rounded-full bg-primary/10 p-2">{goal.icon}</div>
                    <div>
                      <h3 className="font-medium">{goal.title}</h3>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                  </div>
                  <Badge variant={goal.progress > 75 ? "default" : "outline"}>{goal.dueDate}</Badge>
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  <Progress value={goal.progress} className="h-2 flex-1" />
                  <span className="text-sm font-medium">{goal.progress}%</span>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="rounded-full bg-primary/10 p-2">{goal.icon}</div>
                    <div>
                      <h3 className="font-medium">{goal.title}</h3>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                  </div>
                  <Badge>Completed on {goal.completedDate}</Badge>
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  <Progress value={goal.progress} className="h-2 flex-1" />
                  <span className="text-sm font-medium">{goal.progress}%</span>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
