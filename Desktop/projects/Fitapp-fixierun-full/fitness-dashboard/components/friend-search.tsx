"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, UserPlus } from "lucide-react"

export function FriendSearch() {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const searchResults = [
    {
      id: 1,
      name: "Robert Davis",
      username: "robert_davis",
      avatar: "/placeholder.svg",
      initials: "RD",
      mutualFriends: 5,
    },
    {
      id: 2,
      name: "Olivia Martin",
      username: "olivia_m",
      avatar: "/placeholder.svg",
      initials: "OM",
      mutualFriends: 2,
    },
    {
      id: 3,
      name: "James Wilson",
      username: "jwilson",
      avatar: "/placeholder.svg",
      initials: "JW",
      mutualFriends: 4,
    },
  ]

  const filteredResults = searchQuery
    ? searchResults.filter(
        (result) =>
          result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.username.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Find Friends</DialogTitle>
          <DialogDescription>Search for friends by name or username.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="mt-4 space-y-4">
          {searchQuery && filteredResults.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">No users found</div>
          ) : (
            filteredResults.map((result) => (
              <div key={result.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={result.avatar} alt={result.name} />
                    <AvatarFallback>{result.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-xs text-muted-foreground">
                      @{result.username} • {result.mutualFriends} mutual friends
                    </div>
                  </div>
                </div>
                <Button size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
