"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bike, MessageSquare, Timer, UserPlus } from "lucide-react"

export function FriendsList() {
  const [activeTab, setActiveTab] = useState("friends")

  const friends = [
    {
      id: 1,
      name: "Jane Smith",
      avatar: "/placeholder.svg",
      initials: "JS",
      lastActivity: {
        type: "running",
        title: "Afternoon Run",
        date: "2 hours ago",
      },
    },
    {
      id: 2,
      name: "Mike Johnson",
      avatar: "/placeholder.svg",
      initials: "MJ",
      lastActivity: {
        type: "biking",
        title: "Mountain Biking",
        date: "5 hours ago",
      },
    },
    {
      id: 3,
      name: "Sarah Williams",
      avatar: "/placeholder.svg",
      initials: "SW",
      lastActivity: {
        type: "running",
        title: "Trail Run",
        date: "Yesterday",
      },
    },
    {
      id: 4,
      name: "David Brown",
      avatar: "/placeholder.svg",
      initials: "DB",
      lastActivity: {
        type: "biking",
        title: "Evening Ride",
        date: "Yesterday",
      },
    },
  ]

  const requests = [
    {
      id: 5,
      name: "Alex Johnson",
      avatar: "/placeholder.svg",
      initials: "AJ",
      mutualFriends: 3,
    },
    {
      id: 6,
      name: "Emma Wilson",
      avatar: "/placeholder.svg",
      initials: "EW",
      mutualFriends: 1,
    },
  ]

  const suggestions = [
    {
      id: 7,
      name: "Robert Davis",
      avatar: "/placeholder.svg",
      initials: "RD",
      mutualFriends: 5,
    },
    {
      id: 8,
      name: "Olivia Martin",
      avatar: "/placeholder.svg",
      initials: "OM",
      mutualFriends: 2,
    },
    {
      id: 9,
      name: "James Wilson",
      avatar: "/placeholder.svg",
      initials: "JW",
      mutualFriends: 4,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Friends</CardTitle>
        <CardDescription>Connect with friends and see their activities.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="friends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="friends" onClick={() => setActiveTab("friends")}>
              Friends
            </TabsTrigger>
            <TabsTrigger value="requests" onClick={() => setActiveTab("requests")}>
              Requests
              {requests.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {requests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="suggestions" onClick={() => setActiveTab("suggestions")}>
              Suggestions
            </TabsTrigger>
          </TabsList>
          <TabsContent value="friends" className="space-y-4">
            {friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={friend.avatar} alt={friend.name} />
                    <AvatarFallback>{friend.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{friend.name}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {friend.lastActivity.type === "running" ? (
                        <Timer className="mr-1 h-3 w-3" />
                      ) : (
                        <Bike className="mr-1 h-3 w-3" />
                      )}
                      <span>
                        {friend.lastActivity.title} • {friend.lastActivity.date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="requests" className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={request.avatar} alt={request.name} />
                    <AvatarFallback>{request.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{request.name}</div>
                    <div className="text-xs text-muted-foreground">{request.mutualFriends} mutual friends</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm">Accept</Button>
                  <Button variant="outline" size="sm">
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="suggestions" className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={suggestion.avatar} alt={suggestion.name} />
                    <AvatarFallback>{suggestion.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{suggestion.name}</div>
                    <div className="text-xs text-muted-foreground">{suggestion.mutualFriends} mutual friends</div>
                  </div>
                </div>
                <Button size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
