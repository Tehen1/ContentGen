"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { UserNav } from "@/components/user-nav"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <UserNav />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link href="/" className="hover:text-foreground/80" onClick={() => setOpen(false)}>
              Dashboard
            </Link>
            <Link href="/activities" className="hover:text-foreground/80" onClick={() => setOpen(false)}>
              Activities
            </Link>
            <Link href="/goals" className="hover:text-foreground/80" onClick={() => setOpen(false)}>
              Goals
            </Link>
            <Link href="/friends" className="hover:text-foreground/80" onClick={() => setOpen(false)}>
              Friends
            </Link>
            <Link href="/profile" className="hover:text-foreground/80" onClick={() => setOpen(false)}>
              Profile
            </Link>
            <Link href="/settings" className="hover:text-foreground/80" onClick={() => setOpen(false)}>
              Settings
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
