import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Bike, Flame, Timer, TrendingUp } from "lucide-react"

export function ProfileStats() {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Your Stats</CardTitle>
        <CardDescription>Your lifetime fitness statistics.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <Activity className="mr-1 h-4 w-4" />
              Total Distance
            </div>
            <div className="text-2xl font-bold">1,248 km</div>
          </div>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <Timer className="mr-1 h-4 w-4" />
              Total Activities
            </div>
            <div className="text-2xl font-bold">156</div>
          </div>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <Flame className="mr-1 h-4 w-4" />
              Calories Burned
            </div>
            <div className="text-2xl font-bold">78,350</div>
          </div>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="mr-1 h-4 w-4" />
              Elevation Gain
            </div>
            <div className="text-2xl font-bold">12,540 m</div>
          </div>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <Timer className="mr-1 h-4 w-4" />
              Running
            </div>
            <div className="text-2xl font-bold">748 km</div>
          </div>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <Bike className="mr-1 h-4 w-4" />
              Biking
            </div>
            <div className="text-2xl font-bold">500 km</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
