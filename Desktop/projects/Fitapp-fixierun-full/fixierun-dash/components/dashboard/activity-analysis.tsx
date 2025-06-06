"use client"

import { ArrowUp } from "lucide-react"

import { Separator } from "@/components/ui/separator"

export function ActivityAnalysis() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
          <ArrowUp className="h-3 w-3" />
          +19%
        </div>
        <span className="text-sm text-muted-foreground">from last week</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-xl font-bold">51.4 km</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Average</div>
          <div className="text-xl font-bold">10.3 km</div>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Maximum</div>
          <div className="text-xl font-bold">15.3 km</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Active Days</div>
          <div className="text-xl font-bold">5 / 7</div>
        </div>
      </div>
    </div>
  )
}
