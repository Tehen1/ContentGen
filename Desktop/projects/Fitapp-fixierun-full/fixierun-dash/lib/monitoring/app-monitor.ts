import { neon } from "@neondatabase/serverless"

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy"
  version: string
  uptime: number
  environment: string
  database: {
    status: "connected" | "error"
    latency: number
  }
  memory: {
    usage: number
    limit: number
    percentage: number
  }
  services: Record<
    string,
    {
      status: "healthy" | "degraded" | "unhealthy"
      latency: number
    }
  >
}

// Timestamp de démarrage de l'application
const startTime = Date.now()

export async function getHealthStatus(): Promise<HealthStatus> {
  const status: HealthStatus = {
    status: "healthy",
    version: process.env.APP_VERSION || "1.0.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    environment: process.env.NODE_ENV || "development",
    database: {
      status: "error",
      latency: 0,
    },
    memory: {
      usage: process.memoryUsage().heapUsed,
      limit: process.memoryUsage().heapTotal,
      percentage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
    },
    services: {
      web3: { status: "healthy", latency: 0 },
      storage: { status: "healthy", latency: 0 },
    },
  }

  // Vérifier la connexion à la base de données
  try {
    const dbStart = Date.now()
    const sql = neon(process.env.DATABASE_URL!)
    await sql`SELECT 1`
    status.database.latency = Date.now() - dbStart
    status.database.status = "connected"
  } catch (error) {
    console.error("Erreur de connexion à la base de données:", error)
    status.database.status = "error"
    status.status = "degraded"
  }

  // Vérifier les services externes
  try {
    const web3Start = Date.now()
    // Simuler une vérification Web3
    await new Promise((resolve) => setTimeout(resolve, 50))
    status.services.web3.latency = Date.now() - web3Start
  } catch (error) {
    status.services.web3.status = "unhealthy"
    status.status = "degraded"
  }

  // Vérifier l'utilisation de la mémoire
  if (status.memory.percentage > 90) {
    status.status = "degraded"
  }

  // Déterminer le statut global
  if (status.database.status === "error" || Object.values(status.services).some((s) => s.status === "unhealthy")) {
    status.status = "unhealthy"
  }

  return status
}

export async function sendMetrics(metrics: any): Promise<void> {
  if (!process.env.METRICS_ENDPOINT) return

  try {
    await fetch(process.env.METRICS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...metrics,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      }),
    })
  } catch (error) {
    console.error("Erreur lors de l'envoi des métriques:", error)
  }
}

export async function logError(error: Error, context?: any): Promise<void> {
  console.error("Application error:", error)

  if (!process.env.ERROR_LOGGING_ENDPOINT) return

  try {
    await fetch(process.env.ERROR_LOGGING_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      }),
    })
  } catch (logError) {
    console.error("Erreur lors de la journalisation de l'erreur:", logError)
  }
}
