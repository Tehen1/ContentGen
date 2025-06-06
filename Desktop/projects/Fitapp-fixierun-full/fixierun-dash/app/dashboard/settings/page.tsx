"use client"

import { useState, useEffect } from "react"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardFooter } from "@/components/dashboard/dashboard-footer"
import { useLocalStorage } from "@/hooks/use-local-storage"

export default function SettingsPage() {
  const [menuPosition, setMenuPosition] = useLocalStorage<"top" | "bottom">("menuPosition", "top")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <main className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Interface Settings</CardTitle>
              <CardDescription>Customize how the dashboard appears</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="menu-position">Menu Position</Label>
                <RadioGroup
                  id="menu-position"
                  value={menuPosition}
                  onValueChange={(value) => setMenuPosition(value as "top" | "bottom")}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="top" id="top" className="peer sr-only" />
                    <Label
                      htmlFor="top"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="mb-2 block h-8 w-full rounded-md border border-dashed border-muted-foreground/50 bg-muted/50"></span>
                      <span className="block h-2 w-full rounded-md bg-primary/50"></span>
                      <span className="mt-2 block h-24 w-full rounded-md border border-dashed border-muted-foreground/50 bg-muted/50"></span>
                      <span className="mt-2">Top Navigation</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="bottom" id="bottom" className="peer sr-only" />
                    <Label
                      htmlFor="bottom"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="mb-2 block h-8 w-full rounded-md border border-dashed border-muted-foreground/50 bg-muted/50"></span>
                      <span className="block h-24 w-full rounded-md border border-dashed border-muted-foreground/50 bg-muted/50"></span>
                      <span className="mt-2 block h-2 w-full rounded-md bg-primary/50"></span>
                      <span className="mt-2">Bottom Navigation</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}
