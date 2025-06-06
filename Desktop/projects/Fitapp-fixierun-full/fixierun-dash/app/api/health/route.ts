import { type NextRequest, NextResponse } from "next/server"
import { getHealthStatus, sendMetrics } from "@/lib/monitoring/app-monitor"

export async function GET(request: NextRequest) {
  try {
    const health = await getHealthStatus()

    // Envoyer les métriques en arrière-plan
    sendMetrics(health).catch(console.error)

    // Définir le code de statut HTTP en fonction de l'état de santé
    const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503 // unhealthy

    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    console.error("Erreur lors de la vérification de santé:", error)
    return NextResponse.json({ status: "unhealthy", error: "Erreur interne du serveur" }, { status: 500 })
  }
}
