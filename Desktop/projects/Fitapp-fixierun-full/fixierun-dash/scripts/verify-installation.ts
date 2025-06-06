import * as fs from "fs"
import * as path from "path"

/**
 * Script de vérification de l'installation pour Fixie.Run
 *
 * Ce script vérifie que toutes les dépendances et composants nécessaires sont installés
 */

console.log("🔍 Vérification de l'installation de Fixie.Run...")

// Vérifier si package.json existe
const packageJsonPath = path.join(process.cwd(), "package.json")
if (!fs.existsSync(packageJsonPath)) {
  console.error("❌ Erreur: package.json non trouvé!")
  process.exit(1)
}

// Lire package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

// Liste des dépendances essentielles
const essentialDependencies = [
  "@radix-ui/react-dropdown-menu",
  "@radix-ui/react-slot",
  "class-variance-authority",
  "clsx",
  "lucide-react",
  "next-themes",
  "tailwind-merge",
  "tailwindcss-animate",
  "web3",
]

// Vérifier les dépendances
const missingDependencies = essentialDependencies.filter(
  (dep) => !packageJson.dependencies || !packageJson.dependencies[dep],
)

if (missingDependencies.length > 0) {
  console.error(`❌ Dépendances manquantes: ${missingDependencies.join(", ")}`)
  console.log('👉 Exécutez "npm run install-deps" pour installer les dépendances manquantes.')
} else {
  console.log("✅ Toutes les dépendances essentielles sont installées.")
}

// Vérifier les composants UI
console.log("🔍 Vérification des composants UI...")

const componentsDir = path.join(process.cwd(), "components", "ui")
if (!fs.existsSync(componentsDir)) {
  console.error("❌ Répertoire components/ui non trouvé!")
  console.log('👉 Exécutez "npm run fix-components" pour créer les composants manquants.')
  process.exit(1)
}

// Liste des composants UI essentiels
const essentialComponents = ["button", "dropdown-menu", "card", "input", "select", "tabs"]

// Vérifier les composants
const missingComponents = essentialComponents.filter((comp) => !fs.existsSync(path.join(componentsDir, `${comp}.tsx`)))

if (missingComponents.length > 0) {
  console.error(`❌ Composants UI manquants: ${missingComponents.join(", ")}`)
  console.log('👉 Exécutez "npm run fix-components" pour créer les composants manquants.')
} else {
  console.log("✅ Tous les composants UI essentiels sont présents.")
}

// Vérifier la configuration Next.js
console.log("🔍 Vérification de la configuration Next.js...")

const nextConfigPath = path.join(process.cwd(), "next.config.js")
if (!fs.existsSync(nextConfigPath)) {
  console.error("❌ Fichier next.config.js non trouvé!")
} else {
  console.log("✅ Configuration Next.js trouvée.")
}

// Vérifier les fichiers CSS
console.log("🔍 Vérification des fichiers CSS...")

const globalCssPath = path.join(process.cwd(), "app", "globals.css")
if (!fs.existsSync(globalCssPath)) {
  console.error("❌ Fichier globals.css non trouvé!")
} else {
  console.log("✅ Fichier CSS global trouvé.")
}

// Résumé
console.log("\n📋 Résumé de la vérification:")
if (missingDependencies.length === 0 && missingComponents.length === 0) {
  console.log("🎉 Toutes les vérifications sont passées! L'installation est complète.")
} else {
  console.log("⚠️ Certaines vérifications ont échoué. Suivez les instructions ci-dessus pour résoudre les problèmes.")
}
