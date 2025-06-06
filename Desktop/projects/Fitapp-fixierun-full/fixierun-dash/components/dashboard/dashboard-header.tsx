"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MainNav } from "@/components/dashboard/main-nav"
import { UserNav } from "@/components/dashboard/user-nav"
// Update the import to use the default export
import ThemeSwitcher from "@/components/theme-switcher"

export function DashboardHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">Fixie.Run</span>
            <span className="text-xs text-muted-foreground">Powered by zkEVM</span>
          </Link>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col gap-4 p-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl" onClick={() => setIsOpen(false)}>
                  <span className="text-primary">Fixie.Run</span>
                </Link>
                <MainNav className="flex flex-col gap-2" setIsOpen={setIsOpen} />
              </div>
            </SheetContent>
          </Sheet>
          <MainNav className="hidden md:flex" />
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <UserNav />
        </div>
      </div>
    </header>
  )
}
