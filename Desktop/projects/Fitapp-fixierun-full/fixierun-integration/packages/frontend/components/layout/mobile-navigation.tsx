"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Home, Map, Trophy, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

export default function MobileNavigation() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show on mobile devices
    setIsVisible(isMobile)
  }, [isMobile])

  if (!isVisible) {
    return null
  }

  const navItems: NavItem[] = [
    {
      href: "/",
      label: "Home",
      icon: <Home className="h-5 w-5" />,
    },
    {
      href: "/activities",
      label: "Activities",
      icon: <Activity className="h-5 w-5" />,
    },
    {
      href: "/track",
      label: "Track",
      icon: <Map className="h-5 w-5" />,
    },
    {
      href: "/rewards",
      label: "Rewards",
      icon: <Trophy className="h-5 w-5" />,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: <User className="h-5 w-5" />,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
