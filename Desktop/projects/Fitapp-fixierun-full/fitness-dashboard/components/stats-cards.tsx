"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Bike, Timer, TrendingUp, Flame } from "lucide-react"

export function StatsCards() {
  // In a real app, this data would come from an API or database
  const stats = [
    {
      title: "Total Distance",
      value: "245.8 km",
      change: "+12.5% from last month",
      icon: <Activity className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Total Activities",
      value: "24",
      change: "+3 from last month",
      icon: <Bike className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Active Time",
      value: "18h 24m",
      change: "+2h from last month",
      icon: <Timer className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Elevation Gain",
      value: "1,248 m",
      change: "+15% from last month",
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
