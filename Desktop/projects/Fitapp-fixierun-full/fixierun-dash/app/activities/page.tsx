"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUserActivities, getUserStats } from "@/app/actions/database-actions"
import { useWeb3 } from "@/lib/web3/web3-provider"
import { Bike, Clock, Flame, Coins, TrendingUp, Activity } from "lucide-react"
import Link from "next/link"

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const { account, isConnected } = useWeb3()

  useEffect(() => {
    if (isConnected && account) {
      loadUserData()
    }
  }, [isConnected, account])

  const loadUserData = async () => {
    setIsLoading(true)
    try {
      // Simuler un ID utilisateur (dans une vraie app, récupérer depuis la DB)
      const userId = 1

      const [activitiesResult, statsResult] = await Promise.all([getUserActivities(userId), getUserStats(userId)])

      if (activitiesResult.success) {
        setActivities(activitiesResult.data)
      }

      if (statsResult.success) {
        setStats(statsResult.data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}min`
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto p-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Connexion Requise</CardTitle>
            <CardDescription>Connectez votre portefeuille pour voir vos activités</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button className="w-full">Retour au Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <div className="space-y-8">
        {/* Statistiques Globales */}
        <div>
          <h1 className="text-3xl font-bold mb-6">Mes Activités Cyclistes</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Distance Totale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{stats.total_distance || 0} km</span>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Temps Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{formatDuration(stats.total_duration || 0)}</span>
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Calories Brûlées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{stats.total_calories || 0}</span>
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">$FIX Gagnés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{Number.parseFloat(stats.total_tokens || 0).toFixed(2)}</span>
                  <Coins className="h-5 w-5 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Liste des Activités */}
        <Card>
          <CardHeader>
            <CardTitle>Activités Récentes</CardTitle>
            <CardDescription>Vos dernières sorties à vélo et les récompenses gagnées</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Chargement des activités...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <Bike className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Aucune activité enregistrée</p>
                <Button>Commencer une Sortie</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Bike className="h-4 w-4" />
                          <span className="font-medium">{activity.bike_name || "Vélo Standard"}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">{activity.distance} km</span>
                            <span className="block text-xs">Distance</span>
                          </div>
                          <div>
                            <span className="font-medium">{formatDuration(activity.duration)}</span>
                            <span className="block text-xs">Durée</span>
                          </div>
                          <div>
                            <span className="font-medium">{activity.average_speed} km/h</span>
                            <span className="block text-xs">Vitesse moy.</span>
                          </div>
                          <div>
                            <span className="font-medium">{activity.calories_burned} kcal</span>
                            <span className="block text-xs">Calories</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-green-600">
                          <Coins className="h-4 w-4" />
                          <span className="font-bold">
                            +{Number.parseFloat(activity.fix_tokens_earned).toFixed(2)} $FIX
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
