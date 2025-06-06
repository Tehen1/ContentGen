import Link from "next/link"

import { cn } from "@/lib/utils"
import { DotIcon as DashboardIcon, ImageIcon, Settings } from "lucide-react"
import { Activity, Database } from "lucide-react"

interface DashboardNavProps {
  className?: string
}

export const DashboardNav = ({ className }: DashboardNavProps) => {
  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: DashboardIcon,
    },
    {
      title: "Collection",
      href: "/collection",
      icon: ImageIcon,
    },
    {
      title: "Activités",
      href: "/activities",
      icon: Activity,
    },
    {
      title: "Test DB",
      href: "/test-database",
      icon: Database,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <nav className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center space-x-2 rounded-md p-2 hover:bg-secondary hover:text-accent-foreground"
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  )
}
