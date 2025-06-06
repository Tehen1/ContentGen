#!/usr/bin/env node
import fs from "fs"
import { execSync } from "child_process"

console.log("🔍 Démarrage du diagnostic des erreurs serveur...")

// Vérifier les fichiers de configuration
const configFiles = ["next.config.js", "tsconfig.json", "tailwind.config.ts"]
console.log("\n📁 Vérification des fichiers de configuration...")

configFiles.forEach((file) => {
  try {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} existe`)
    } else {
      console.log(`❌ ${file} est manquant`)
    }
  } catch (err) {
    console.error(`❌ Erreur lors de la vérification de ${file}:`, err)
  }
})

// Vérifier les dépendances
console.log("\n📦 Vérification des dépendances...")
try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"))
  const requiredDeps = ["next", "react", "react-dom", "next-themes", "@radix-ui/react-dropdown-menu", "lucide-react"]

  const missingDeps = requiredDeps.filter((dep) => !packageJson.dependencies[dep])

  if (missingDeps.length === 0) {
    console.log("✅ Toutes les dépendances requises sont présentes")
  } else {
    console.log("❌ Dépendances manquantes:", missingDeps.join(", "))
  }
} catch (err) {
  console.error("❌ Erreur lors de la vérification des dépendances:", err)
}

// Vérifier les composants critiques
console.log("\n🧩 Vérification des composants critiques...")
const criticalComponents = [
  "components/theme-provider.tsx",
  "components/theme-switcher.tsx",
  "lib/web3/web3-provider.tsx",
  "app/layout.tsx",
]

criticalComponents.forEach((component) => {
  try {
    if (fs.existsSync(component)) {
      console.log(`✅ ${component} existe`)

      // Vérifier les exports
      const content = fs.readFileSync(component, "utf8")
      if (content.includes("export default")) {
        console.log(`  ✅ ${component} a un export par défaut`)
      } else {
        console.log(`  ⚠️ ${component} n'a pas d'export par défaut`)
      }

      // Vérifier les imports problématiques
      if (content.includes("useEffect") && !content.includes("mounted")) {
        console.log(`  ⚠️ ${component} utilise useEffect sans vérification de montage`)
      }
    } else {
      console.log(`❌ ${component} est manquant`)
    }
  } catch (err) {
    console.error(`❌ Erreur lors de la vérification de ${component}:`, err)
  }
})

// Vérifier les erreurs TypeScript
console.log("\n🔧 Vérification des erreurs TypeScript...")
try {
  execSync("npx tsc --noEmit", { stdio: "pipe" })
  console.log("✅ Aucune erreur TypeScript détectée")
} catch (err) {
  console.log("❌ Erreurs TypeScript détectées:")
  console.log(err.stdout?.toString() || err.message)
}

// Vérifier les erreurs ESLint
console.log("\n🧹 Vérification des erreurs ESLint...")
try {
  execSync("npx eslint . --ext .ts,.tsx --max-warnings=0", { stdio: "pipe" })
  console.log("✅ Aucune erreur ESLint détectée")
} catch (err) {
  console.log("❌ Erreurs ESLint détectées:")
  console.log(err.stdout?.toString() || err.message)
}

console.log("\n🏁 Diagnostic terminé!")
