"use client"

import type React from "react"

import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { MainNav } from "@/components/main-nav"
import { BarChart3, Home, ListTodo, Users, User, Settings, LogOut } from "lucide-react"
import Link from "next/link"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [open, setOpen] = useState(true)

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b bg-background md:hidden">
          <div className="container flex h-16 items-center justify-between py-4">
            <MainNav />
            <MobileNav />
          </div>
        </header>
        <div className="flex flex-1">
          <Sidebar>
            <SidebarHeader className="flex items-center px-2 py-4">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                <span className="rounded-md bg-primary p-1">
                  <BarChart3 className="h-6 w-6 text-primary-foreground" />
                </span>
                <span>FitTrack</span>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Dashboard">
                    <Link href="/">
                      <Home className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Activities">
                    <Link href="/activities">
                      <BarChart3 className="h-5 w-5" />
                      <span>Activities</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Goals">
                    <Link href="/goals">
                      <ListTodo className="h-5 w-5" />
                      <span>Goals</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Friends">
                    <Link href="/friends">
                      <Users className="h-5 w-5" />
                      <span>Friends</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Profile">
                    <Link href="/profile">
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Settings">
                    <Link href="/settings">
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Logout">
                    <button>
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <SidebarInset>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">{children}</div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}
