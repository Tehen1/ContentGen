import { neon } from "@neondatabase/serverless"

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy"
  checks: {
    database: boolean
    tables: boolean
    performance: boolean
    storage: boolean
  }
  metrics: {
    responseTime: number
    activeConnections: number
    tableCount: number
    totalRows: number
    databaseSize: string
  }
  errors: string[]
}

export async function performHealthCheck(): Promise<HealthCheckResult> {
  const errors: string[] = []
  const startTime = Date.now()

  const result: HealthCheckResult = {
    status: "healthy",
    checks: {
      database: false,
      tables: false,
      performance: false,
      storage: false,
    },
    metrics: {
      responseTime: 0,
      activeConnections: 0,
      tableCount: 0,
      totalRows: 0,
      databaseSize: "0 MB",
    },
    errors,
  }

  try {
    const sql = neon(process.env.DATABASE_URL!)

    // 1. Vérifier la connexion
    try {
      await sql`SELECT 1`
      result.checks.database = true
    } catch (error) {
      errors.push("Impossible de se connecter à la base de données")
    }

    // 2. Vérifier les tables essentielles
    try {
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `

      const requiredTables = ["users", "nft_bikes", "cycling_activities", "rewards", "challenges"]
      const existingTables = tables.map((t) => t.table_name)

      result.metrics.tableCount = existingTables.length
      result.checks.tables = requiredTables.every((t) => existingTables.includes(t))

      if (!result.checks.tables) {
        errors.push("Tables manquantes dans la base de données")
      }
    } catch (error) {
      errors.push("Erreur lors de la vérification des tables")
    }

    // 3. Vérifier les performances
    try {
      const perfStart = Date.now()
      await sql`
        SELECT COUNT(*) as count 
        FROM cycling_activities 
        WHERE created_at > CURRENT_DATE - INTERVAL '7 days'
      `
      const queryTime = Date.now() - perfStart

      result.checks.performance = queryTime < 1000 // Moins d'1 seconde

      if (!result.checks.performance) {
        errors.push(`Performances dégradées (temps de requête: ${queryTime}ms)`)
      }
    } catch (error) {
      errors.push("Erreur lors du test de performance")
    }

    // 4. Vérifier l'espace de stockage et les métriques
    try {
      const metrics = await sql`
        SELECT 
          (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
          (SELECT SUM(n_live_tup) FROM pg_stat_user_tables) as total_rows,
          pg_database_size(current_database()) as database_size
      `

      const dbMetrics = metrics[0]
      result.metrics.activeConnections = dbMetrics.active_connections
      result.metrics.totalRows = dbMetrics.total_rows
      result.metrics.databaseSize = formatBytes(dbMetrics.database_size)

      // Vérifier si l'espace est suffisant (exemple: alerter si > 80% de la limite)
      const maxSize = 10 * 1024 * 1024 * 1024 // 10 GB
      result.checks.storage = dbMetrics.database_size < maxSize * 0.8

      if (!result.checks.storage) {
        errors.push("Espace de stockage critique")
      }
    } catch (error) {
      errors.push("Erreur lors de la récupération des métriques")
    }
  } catch (error) {
    errors.push("Erreur générale lors du health check")
  }

  // Calculer le temps de réponse total
  result.metrics.responseTime = Date.now() - startTime

  // Déterminer le statut global
  const failedChecks = Object.values(result.checks).filter((check) => !check).length
  if (failedChecks === 0) {
    result.status = "healthy"
  } else if (failedChecks <= 1) {
    result.status = "degraded"
  } else {
    result.status = "unhealthy"
  }

  return result
}

export async function getSlowQueries(limit = 10): Promise<any[]> {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const queries = await sql`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        max_time
      FROM pg_stat_statements
      WHERE query NOT LIKE '%pg_stat_statements%'
      ORDER BY mean_time DESC
      LIMIT ${limit}
    `

    return queries
  } catch (error) {
    console.error("Erreur lors de la récupération des requêtes lentes:", error)
    return []
  }
}

export async function getDatabaseStats(): Promise<any> {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const stats = await sql`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        n_live_tup as row_count,
        n_dead_tup as dead_rows,
        last_vacuum,
        last_autovacuum
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `

    return stats
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error)
    return []
  }
}

function formatBytes(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  if (bytes === 0) return "0 Bytes"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
}

// Fonction pour envoyer des alertes
export async function sendAlert(message: string, severity: "info" | "warning" | "critical"): Promise<void> {
  // Implémenter l'envoi d'alertes (email, webhook, etc.)
  console.log(`[${severity.toUpperCase()}] ${message}`)

  // Exemple d'intégration avec un webhook
  if (process.env.MONITORING_WEBHOOK_URL) {
    try {
      await fetch(process.env.MONITORING_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          severity,
          message,
          timestamp: new Date().toISOString(),
          application: "fixierun-database",
        }),
      })
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'alerte:", error)
    }
  }
}

// Job de monitoring automatique
export async function runMonitoringJob(): Promise<void> {
  const health = await performHealthCheck()

  if (health.status === "unhealthy") {
    await sendAlert(`Base de données en état critique: ${health.errors.join(", ")}`, "critical")
  } else if (health.status === "degraded") {
    await sendAlert(`Base de données dégradée: ${health.errors.join(", ")}`, "warning")
  }

  // Vérifier les connexions actives
  if (health.metrics.activeConnections > 80) {
    await sendAlert(`Nombre élevé de connexions actives: ${health.metrics.activeConnections}`, "warning")
  }

  // Logger les métriques pour le monitoring
  console.log("Health Check Results:", JSON.stringify(health, null, 2))
}
