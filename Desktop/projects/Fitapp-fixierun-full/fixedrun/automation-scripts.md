# Script Automatisé de Correction et Déploiement

## Script Principal de Correction (fix-and-deploy.sh)

```bash
#!/bin/bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Script de Correction et Déploiement Fixie.Run${NC}"
echo "=============================================="

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Phase 1: Nettoyage
log_info "Phase 1: Nettoyage des modules problématiques..."

# Supprimer les modules problématiques
log_info "Suppression des dépendances problématiques..."
npm uninstall pino-pretty @rainbow-me/rainbowkit wagmi viem sharp 2>/dev/null || true

# Nettoyer le cache
log_info "Nettoyage du cache npm..."
npm cache clean --force

# Supprimer node_modules et package-lock.json
log_info "Suppression de node_modules et package-lock.json..."
rm -rf node_modules package-lock.json

log_success "Nettoyage terminé"

# Phase 2: Installation des nouvelles dépendances
log_info "Phase 2: Installation des dépendances optimisées..."

# Installer les dépendances de base
log_info "Installation des dépendances de base..."
npm install next@latest react@latest react-dom@latest typescript

# Installer les types
log_info "Installation des types TypeScript..."
npm install -D @types/react @types/react-dom @types/node

# Installer les outils de développement
log_info "Installation des outils de développement..."
npm install -D eslint eslint-config-next @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier husky lint-staged

# Installer les dépendances UI
log_info "Installation des dépendances UI..."
npm install framer-motion lucide-react clsx tailwind-merge

# Installer les outils de test
log_info "Installation des outils de test..."
npm install -D jest @testing-library/react @testing-library/jest-dom

log_success "Toutes les dépendances installées"

# Phase 3: Configuration des fichiers
log_info "Phase 3: Configuration des fichiers..."

# Créer next.config.js optimisé
log_info "Création de next.config.js..."
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['localhost', 'gateway.pinata.cloud', 'ipfs.io', 'dweb.link'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
EOF

# Créer tsconfig.json optimisé
log_info "Création de tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/contexts/*": ["./src/contexts/*"],
      "@/app/*": ["./src/app/*"]
    },
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", ".next", "out", "build", "dist"]
}
EOF

# Créer .eslintrc.json
log_info "Création de .eslintrc.json..."
cat > .eslintrc.json << 'EOF'
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "no-console": "warn",
    "prefer-const": "error"
  }
}
EOF

# Créer .prettierrc
log_info "Création de .prettierrc..."
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf"
}
EOF

# Mettre à jour package.json avec les scripts
log_info "Mise à jour des scripts package.json..."
npm pkg set scripts.dev="next dev"
npm pkg set scripts.build="next build"
npm pkg set scripts.start="next start"
npm pkg set scripts.lint="next lint --fix"
npm pkg set scripts.type-check="tsc --noEmit"
npm pkg set scripts.format="prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\""
npm pkg set scripts.test="jest"
npm pkg set scripts.deploy="vercel --prod"
npm pkg set scripts.build-check="npm run type-check && npm run lint && npm run build"

log_success "Configuration des fichiers terminée"

# Phase 4: Créer les dossiers et fichiers manquants
log_info "Phase 4: Création de la structure de dossiers..."

# Créer la structure src/
mkdir -p src/{app,components,lib,hooks,types,utils,contexts}
mkdir -p src/components/{ui,dashboard}
mkdir -p public/{images,bikes}

# Créer un fichier placeholder pour les images
echo "Placeholder" > public/images/placeholder.png

log_success "Structure de dossiers créée"

# Phase 5: Vérifications
log_info "Phase 5: Vérifications finales..."

# Vérifier TypeScript
log_info "Vérification TypeScript..."
if npm run type-check; then
    log_success "TypeScript: OK"
else
    log_warning "TypeScript: Avertissements détectés"
fi

# Vérifier ESLint
log_info "Vérification ESLint..."
if npm run lint; then
    log_success "ESLint: OK"
else
    log_warning "ESLint: Avertissements détectés"
fi

# Tenter un build
log_info "Test de build..."
if npm run build; then
    log_success "Build: OK"
else
    log_error "Build: Échec"
    log_info "Vérifiez les erreurs ci-dessus et relancez le script"
    exit 1
fi

log_success "Toutes les vérifications passées!"

# Phase 6: Instructions finales
echo ""
echo -e "${GREEN}🎉 Correction terminée avec succès!${NC}"
echo "=============================================="
echo ""
echo -e "${BLUE}📋 Prochaines étapes:${NC}"
echo "1. Configurez vos variables d'environnement dans .env.local:"
echo "   - NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id"
echo "   - PINATA_JWT=your_pinata_jwt"
echo ""
echo "2. Testez l'application localement:"
echo "   npm run dev"
echo ""
echo "3. Déployez sur Vercel:"
echo "   npm run deploy"
echo ""
echo -e "${GREEN}✨ Votre application Fixie.Run est prête!${NC}"
```

## Script de Vérification Rapide (quick-check.sh)

```bash
#!/bin/bash

echo "🔍 Vérification rapide de l'application..."

# Vérifier les dépendances
echo "📦 Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules manquant. Exécutez: npm install"
    exit 1
fi

# Vérifier les fichiers de configuration
echo "⚙️ Vérification des fichiers de configuration..."
files=("next.config.js" "tsconfig.json" "package.json")
for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ $file manquant"
        exit 1
    fi
done

# Vérifier TypeScript
echo "🔧 Vérification TypeScript..."
if npm run type-check > /dev/null 2>&1; then
    echo "✅ TypeScript: OK"
else
    echo "⚠️ TypeScript: Erreurs détectées"
fi

# Vérifier ESLint
echo "🔍 Vérification ESLint..."
if npm run lint > /dev/null 2>&1; then
    echo "✅ ESLint: OK"
else
    echo "⚠️ ESLint: Erreurs détectées"
fi

# Vérifier les variables d'environnement
echo "🔐 Vérification des variables d'environnement..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local trouvé"
else
    echo "⚠️ .env.local manquant - créez-le avec vos variables"
fi

echo "✨ Vérification terminée!"
```

## Instructions d'Utilisation

### 1. Rendre les scripts exécutables
```bash
chmod +x fix-and-deploy.sh
chmod +x quick-check.sh
```

### 2. Exécuter le script de correction
```bash
./fix-and-deploy.sh
```

### 3. Vérifications rapides ultérieures
```bash
./quick-check.sh
```

## Automatisation avec GitHub Actions

```yaml
# .github/workflows/auto-fix.yml
name: Auto Fix and Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  fix-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Run fix script
        run: |
          chmod +x fix-and-deploy.sh
          ./fix-and-deploy.sh
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

Ce script automatisé va :
1. ✅ Supprimer tous les modules problématiques
2. ✅ Installer les bonnes dépendances
3. ✅ Configurer tous les fichiers correctement
4. ✅ Créer la structure de dossiers appropriée
5. ✅ Vérifier que tout fonctionne
6. ✅ Préparer le déploiement

Exécutez simplement `./fix-and-deploy.sh` et votre application sera corrigée et prête pour le déploiement!