#!/usr/bin/env node
import { neon } from "@neondatabase/serverless"
import chalk from "chalk"

async function fixDatabaseIssues() {
  console.log(chalk.blue("🔍 Analyse et correction des problèmes de base de données..."))

  try {
    const sql = neon(process.env.DATABASE_URL!)

    // 1. Vérifier les contraintes d'intégrité
    console.log(chalk.yellow("Vérification des contraintes d'intégrité..."))

    const orphanedActivities = await sql`
      SELECT id FROM cycling_activities ca
      LEFT JOIN users u ON ca.user_id = u.id
      WHERE u.id IS NULL
    `

    if (orphanedActivities.length > 0) {
      console.log(chalk.red(`Trouvé ${orphanedActivities.length} activités orphelines`))
      await sql`DELETE FROM cycling_activities WHERE id IN ${sql(orphanedActivities.map((a) => a.id))}`
      console.log(chalk.green("✅ Activités orphelines supprimées"))
    }

    // 2. Corriger les données incohérentes
    console.log(chalk.yellow("Correction des données incohérentes..."))

    // Corriger les vitesses moyennes impossibles
    await sql`
      UPDATE cycling_activities
      SET 
        average_speed = CASE 
          WHEN duration > 0 THEN distance / (duration / 3600.0)
          ELSE 0
        END,
        is_valid = CASE
          WHEN average_speed > 80 THEN FALSE
          ELSE is_valid
        END
      WHERE average_speed > 80 OR average_speed IS NULL
    `

    // 3. Corriger les index manquants
    console.log(chalk.yellow("Vérification des index..."))

    const missingIndexes = await sql`
      SELECT
        t.relname AS table_name,
        a.attname AS column_name
      FROM
        pg_class t
        JOIN pg_attribute a ON a.attrelid = t.oid
        LEFT JOIN pg_index i ON 
          i.indrelid = t.oid AND 
          a.attnum = ANY(i.indkey)
      WHERE
        t.relkind = 'r'
        AND a.attnum > 0
        AND NOT a.attisdropped
        AND i.indrelid IS NULL
        AND a.attname IN ('user_id', 'bike_id', 'created_at')
        AND t.relname IN ('cycling_activities', 'nft_bikes', 'rewards')
    `

    if (missingIndexes.length > 0) {
      console.log(chalk.red(`Trouvé ${missingIndexes.length} index manquants`))

      for (const idx of missingIndexes) {
        await sql`
          CREATE INDEX IF NOT EXISTS idx_${idx.table_name}_${idx.column_name}
          ON ${sql(idx.table_name)} (${sql(idx.column_name)})
        `
      }

      console.log(chalk.green("✅ Index manquants créés"))
    }

    // 4. Corriger les valeurs NULL
    console.log(chalk.yellow("Correction des valeurs NULL..."))

    await sql`
      UPDATE nft_bikes
      SET 
        speed = 50 WHERE speed IS NULL,
        endurance = 50 WHERE endurance IS NULL,
        earnings_multiplier = 1.0 WHERE earnings_multiplier IS NULL
    `

    // 5. Analyser les tables pour mettre à jour les statistiques
    console.log(chalk.yellow("Mise à jour des statistiques..."))
    await sql`ANALYZE`

    console.log(chalk.green("✅ Correction des problèmes terminée avec succès!"))
  } catch (error) {
    console.error(chalk.red("❌ Erreur lors de la correction des problèmes:"), error)
    process.exit(1)
  }
}

fixDatabaseIssues()
