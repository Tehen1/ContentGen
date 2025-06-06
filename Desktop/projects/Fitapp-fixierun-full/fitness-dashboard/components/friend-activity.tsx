"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bike, Timer } from "lucide-react"

export function FriendActivity() {
  const friends = [
    {
      id: 1,
      name: "Jane Smith",
      avatar: "/placeholder.svg",
      initials: "JS",
      activity: {
        type: "running",
        title: "Afternoon Run",
        distance: "8.5 km",
        time: "45:22",
      },
      lastActive: "2 hours ago",
    },
    {
      id: 2,
      name: "Mike Johnson",
      avatar: "/placeholder.svg",
      initials: "MJ",
      activity: {
        type: "biking",
        title: "Mountain Biking",
        distance: "22.3 km",
        time: "1:15:48",
      },
      lastActive: "5 hours ago",
    },
    {
      id: 3,
      name: "Sarah Williams",
      avatar: "/placeholder.svg",
      initials: "SW",
      activity: {
        type: "running",
        title: "Trail Run",
        distance: "12.1 km",
        time: "1:02:35",
      },
      lastActive: "Yesterday",
    },
    {
      id: 4,
      name: "David Brown",
      avatar: "/placeholder.svg",
      initials: "DB",
      activity: {
        type: "biking",
        title: "Evening Ride",
        distance: "18.7 km",
        time: "55:12",
      },
      lastActive: "Yesterday",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Friend Activity</CardTitle>
        <CardDescription>See what your friends have been up to.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {friends.map((friend) => (
            <div key={friend.id} className="flex items-start space-x-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={friend.avatar} alt={friend.name} />
                <AvatarFallback>{friend.initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{friend.name}</span>
                  <span className="text-xs text-muted-foreground">{friend.lastActive}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Badge variant="outline" className="px-1 py-0 text-xs">
                    {friend.activity.type === "running" ? (
                      <Timer className="mr-1 h-3 w-3" />
                    ) : (
                      <Bike className="mr-1 h-3 w-3" />
                    )}
                    {friend.activity.type}
                  </Badge>
                  <span>{friend.activity.title}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {friend.activity.distance} • {friend.activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
