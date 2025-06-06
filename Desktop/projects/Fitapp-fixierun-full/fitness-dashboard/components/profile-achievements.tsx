import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Calendar, Flame, Timer, TrendingUp } from "lucide-react"

export function ProfileAchievements() {
  const achievements = [
    {
      id: 1,
      title: "Marathon Finisher",
      description: "Completed a full marathon",
      icon: <Timer className="h-4 w-4" />,
      date: "Mar 15, 2023",
    },
    {
      id: 2,
      title: "Century Rider",
      description: "Biked 100 miles in a single ride",
      icon: <TrendingUp className="h-4 w-4" />,
      date: "Feb 28, 2023",
    },
    {
      id: 3,
      title: "Early Bird",
      description: "Completed 10 workouts before 7 AM",
      icon: <Flame className="h-4 w-4" />,
      date: "Jan 20, 2023",
    },
    {
      id: 4,
      title: "Consistent Runner",
      description: "Ran for 30 consecutive days",
      icon: <Calendar className="h-4 w-4" />,
      date: "Dec 15, 2022",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>Badges and achievements you've earned.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-start space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{achievement.title}</span>
                  <Badge variant="outline" className="px-1 py-0 text-xs">
                    {achievement.icon}
                    {achievement.date}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">{achievement.description}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
