#!/usr/bin/env node
import { execSync } from "child_process"
import fs from "fs"
import chalk from "chalk"
import { prompt } from "inquirer"

// Configuration
const ENVIRONMENTS = ["development", "staging", "production"]
const VERCEL_ORG_ID = process.env.VERCEL_ORG_ID
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID

async function deploy() {
  console.log(chalk.blue("🚀 Assistant de déploiement Fixie.Run"))

  try {
    // 1. Vérifier les prérequis
    console.log(chalk.yellow("Vérification des prérequis..."))

    // Vérifier Git
    try {
      execSync("git --version", { stdio: "ignore" })
    } catch (error) {
      console.error(chalk.red("❌ Git n'est pas installé ou n'est pas dans le PATH"))
      process.exit(1)
    }

    // Vérifier Vercel CLI
    try {
      execSync("vercel --version", { stdio: "ignore" })
    } catch (error) {
      console.log(chalk.yellow("Vercel CLI n'est pas installé. Installation..."))
      execSync("npm install -g vercel", { stdio: "inherit" })
    }

    // 2. Demander l'environnement
    const { environment } = await prompt([
      {
        type: "list",
        name: "environment",
        message: "Choisissez l'environnement de déploiement:",
        choices: ENVIRONMENTS,
      },
    ])

    // 3. Vérifier les modifications non commitées
    const hasChanges = execSync("git status --porcelain").toString().trim().length > 0

    if (hasChanges && environment === "production") {
      const { confirmDeploy } = await prompt([
        {
          type: "confirm",
          name: "confirmDeploy",
          message: "Des modifications non commitées ont été détectées. Voulez-vous continuer?",
          default: false,
        },
      ])

      if (!confirmDeploy) {
        console.log(chalk.yellow("Déploiement annulé"))
        process.exit(0)
      }
    }

    // 4. Exécuter les tests si production
    if (environment === "production") {
      console.log(chalk.yellow("Exécution des tests..."))
      try {
        execSync("npm test", { stdio: "inherit" })
      } catch (error) {
        const { ignoreTestFailure } = await prompt([
          {
            type: "confirm",
            name: "ignoreTestFailure",
            message: "Les tests ont échoué. Voulez-vous continuer le déploiement?",
            default: false,
          },
        ])

        if (!ignoreTestFailure) {
          console.log(chalk.yellow("Déploiement annulé"))
          process.exit(0)
        }
      }
    }

    // 5. Build optimisé
    console.log(chalk.yellow(`Build pour l'environnement ${environment}...`))
    process.env.NODE_ENV = environment === "development" ? "development" : "production"
    execSync("node scripts/build-optimized.ts", { stdio: "inherit" })

    // 6. Déployer sur Vercel
    console.log(chalk.yellow(`Déploiement sur Vercel (${environment})...`))

    let deployCommand = `vercel deploy --env NODE_ENV=${environment}`

    if (environment === "production") {
      deployCommand += " --prod"
    }

    if (VERCEL_ORG_ID && VERCEL_PROJECT_ID) {
      deployCommand += ` --scope ${VERCEL_ORG_ID} --confirm -t ${process.env.VERCEL_API_TOKEN}`
    }

    execSync(deployCommand, { stdio: "inherit" })

    // 7. Déployer la base de données
    console.log(chalk.yellow("Déploiement de la base de données..."))
    execSync(`bash scripts/deploy-database.sh ${environment}`, { stdio: "inherit" })

    // 8. Vérification post-déploiement
    console.log(chalk.yellow("Vérification post-déploiement..."))

    // Vérifier l'état de santé de l'application
    const healthCheckUrl =
      environment === "production"
        ? "https://fixierun.com/api/health"
        : `https://${environment}-fixierun.vercel.app/api/health`

    try {
      execSync(`curl -s ${healthCheckUrl}`)
      console.log(chalk.green("✅ Vérification de santé réussie"))
    } catch (error) {
      console.log(chalk.red("⚠️ Impossible de vérifier l'état de santé de l'application"))
    }

    // 9. Notification de déploiement
    if (environment === "production" && process.env.SLACK_WEBHOOK_URL) {
      const version = JSON.parse(fs.readFileSync("package.json", "utf-8")).version
      const commitHash = execSync("git rev-parse --short HEAD").toString().trim()

      const message = {
        text: `🚀 *Fixie.Run v${version} déployé en production*`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                `🚀 *Fixie.Run v${version} déployé en production*\n\n` +
                `• Commit: \`${commitHash}\`\n` +
                `• Déployé par: ${process.env.USER || "Système"}\n` +
                `• Date: ${new Date().toISOString()}`,
            },
          },
        ],
      }

      execSync(
        `curl -X POST -H 'Content-type: application/json' --data '${JSON.stringify(message)}' ${process.env.SLACK_WEBHOOK_URL}`,
      )
    }

    console.log(chalk.green(`✅ Déploiement sur ${environment} terminé avec succès!`))
  } catch (error) {
    console.error(chalk.red("❌ Erreur lors du déploiement:"), error)
    process.exit(1)
  }
}

deploy()
