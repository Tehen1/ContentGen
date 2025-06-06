"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bike, Heart, MessageSquare, Share2, Timer } from "lucide-react"

export function ActivityFeed() {
  const activities = [
    {
      id: 1,
      user: {
        name: "John Doe",
        avatar: "/placeholder.svg",
        initials: "JD",
      },
      type: "running",
      title: "Morning Run",
      distance: "5.2 km",
      time: "28:35",
      pace: "5:30 /km",
      date: "Today at 7:30 AM",
      likes: 12,
      comments: 3,
    },
    {
      id: 2,
      user: {
        name: "Jane Smith",
        avatar: "/placeholder.svg",
        initials: "JS",
      },
      type: "biking",
      title: "Evening Ride",
      distance: "15.7 km",
      time: "45:22",
      pace: "20.8 km/h",
      date: "Yesterday at 6:15 PM",
      likes: 8,
      comments: 2,
    },
    {
      id: 3,
      user: {
        name: "John Doe",
        avatar: "/placeholder.svg",
        initials: "JD",
      },
      type: "running",
      title: "Interval Training",
      distance: "8.4 km",
      time: "42:18",
      pace: "5:02 /km",
      date: "Yesterday at 8:00 AM",
      likes: 15,
      comments: 5,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Your latest running and biking activities.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                  <AvatarFallback>{activity.user.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{activity.user.name}</div>
                  <div className="text-xs text-muted-foreground">{activity.date}</div>
                </div>
              </div>
              <div className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{activity.title}</div>
                  <Badge variant="outline">
                    {activity.type === "running" ? (
                      <Timer className="mr-1 h-3 w-3" />
                    ) : (
                      <Bike className="mr-1 h-3 w-3" />
                    )}
                    {activity.type}
                  </Badge>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground">Distance</div>
                    <div>{activity.distance}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Time</div>
                    <div>{activity.time}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">{activity.type === "running" ? "Pace" : "Speed"}</div>
                    <div>{activity.pace}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Heart className="mr-1 h-4 w-4" />
                    {activity.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <MessageSquare className="mr-1 h-4 w-4" />
                    {activity.comments}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2 ml-auto">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
