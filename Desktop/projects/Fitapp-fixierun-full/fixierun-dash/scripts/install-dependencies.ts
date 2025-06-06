import { execSync } from "child_process"
import * as fs from "fs"
import * as path from "path"

/**
 * Script d'installation des dépendances pour Fixie.Run
 *
 * Ce script installe toutes les dépendances nécessaires et vérifie leur installation
 */

console.log("🚀 Installation des dépendances pour Fixie.Run...")

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

// Vérifier les dépendances manquantes
const missingDependencies = essentialDependencies.filter(
  (dep) => !packageJson.dependencies || !packageJson.dependencies[dep],
)

// Installer les dépendances manquantes
if (missingDependencies.length > 0) {
  console.log(`📦 Installation des dépendances manquantes: ${missingDependencies.join(", ")}`)
  try {
    execSync(`npm install ${missingDependencies.join(" ")}`, { stdio: "inherit" })
    console.log("✅ Dépendances installées avec succès!")
  } catch (error) {
    console.error("❌ Erreur lors de l'installation des dépendances:", error)
    process.exit(1)
  }
} else {
  console.log("✅ Toutes les dépendances essentielles sont déjà installées.")
}

// Vérifier et créer les composants UI manquants
console.log("🔍 Vérification des composants UI...")

const componentsDir = path.join(process.cwd(), "components", "ui")
if (!fs.existsSync(componentsDir)) {
  console.log("📁 Création du répertoire components/ui...")
  fs.mkdirSync(componentsDir, { recursive: true })
}

// Liste des composants UI essentiels
const essentialComponents = ["button", "dropdown-menu", "card", "input", "select", "tabs"]

// Vérifier les composants manquants
const missingComponents = essentialComponents.filter((comp) => !fs.existsSync(path.join(componentsDir, `${comp}.tsx`)))

if (missingComponents.length > 0) {
  console.log(`🔧 Composants UI manquants détectés: ${missingComponents.join(", ")}`)
  console.log('👉 Exécutez "npm run fix-components" pour créer les composants manquants.')
} else {
  console.log("✅ Tous les composants UI essentiels sont présents.")
}

console.log("🎉 Installation terminée!")
console.log("📝 Prochaines étapes:")
console.log('1. Exécutez "npm run dev" pour démarrer l\'application')
console.log('2. Exécutez "npm run verify" pour vérifier l\'installation')
console.log('3. Exécutez "npm run fix-components" si des composants sont manquants')
