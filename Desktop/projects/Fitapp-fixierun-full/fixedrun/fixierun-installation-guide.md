# Guide d'Installation et de Déploiement Fixie.Run

## Commandes d'Installation

### Prérequis
- Node.js v18+ 
- pnpm 8.x ou npm
- Git

### Installation du Projet

```bash
# Cloner le dépôt
git clone https://github.com/votre-utilisateur/fixierun-clone.git
cd fixierun-clone

# Installation avec pnpm (recommandé)
pnpm install

# Ou avec npm
npm install

# Ou avec yarn
yarn install
```

### Installation des Dépendances Essentielles

```bash
# Pour les images et l'optimisation
pnpm add sharp

# Pour Web3 et blockchain
pnpm add wagmi viem @rainbow-me/rainbowkit

# Pour Analytics
pnpm add @vercel/analytics

# Pour IPFS et NFT Storage
pnpm add @web3-storage/web3-storage pinata

# Pour l'authentification
pnpm add jsonwebtoken @auth0/auth0-react @web3auth/modal @web3auth/base
```

## Commandes de Développement

```bash
# Démarrer le serveur de développement
pnpm dev

# Construire pour la production
pnpm build

# Démarrer en mode production
pnpm start

# Linter le code
pnpm lint

# Vérifier les types TypeScript
pnpm type-check
```

## Résolution des Erreurs Communes

### 1. Erreur Sharp Module

```bash
# Solution 1: Installation directe
pnpm add sharp

# Solution 2: Variables d'environnement
export NEXT_SHARP_PATH=/app/node_modules/sharp

# Solution 3: Pour Docker Alpine
FROM node:18-slim instead of node:18-alpine
```

### 2. Erreur Prerendering

```typescript
// Pour forcer le rendu dynamique
export const dynamic = 'force-dynamic';

// Pour les composants client-only
import dynamic from 'next/dynamic';

const ClientComponent = dynamic(
  () => import('./ClientComponent'),
  { ssr: false }
);
```

### 3. Erreur 'use client' vs Server Components

```typescript
// Composant Serveur (par défaut)
export default function ServerComponent() {
  return <div>Rendu côté serveur</div>;
}

// Composant Client (avec directive)
'use client';
import { useState } from 'react';

export default function ClientComponent() {
  const [state, setState] = useState(0);
  return <button onClick={() => setState(s => s + 1)}>{state}</button>;
}
```

## Variables d'Environnement

Créer un fichier `.env.local` :

```env
# Web3 et Blockchain
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key

# NFT Storage et IPFS
PINATA_JWT=your_pinata_jwt
NFT_STORAGE_API_KEY=your_nft_storage_key

# Auth0 et JWT
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem

# Analytics
VERCEL_ANALYTICS_ID=your_analytics_id
```

## Structure de Fichiers Recommandée

```
fixierun-clone/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx           # Page d'accueil
│   ├── dashboard/         # Dashboard utilisateur
│   ├── collection/        # Collection NFT
│   └── api/              # Routes API
├── components/
│   ├── ui/               # Composants UI réutilisables
│   ├── providers/        # Providers (Web3, Theme, etc.)
│   └── features/         # Composants métier
├── lib/
│   ├── web3/            # Logique Web3
│   ├── ipfs/            # Logique IPFS
│   └── utils/           # Utilitaires
├── public/
│   └── bikes/           # Images de vélos NFT
└── types/               # Types TypeScript
```

## Commandes de Déploiement

### Déploiement Vercel

```bash
# Installation de Vercel CLI
pnpm add -g vercel

# Déploiement
vercel deploy

# Déploiement en production
vercel --prod
```

### Déploiement Docker

```dockerfile
FROM node:18-slim AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM base AS builder
COPY . .
RUN npm run build

FROM node:18-slim AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Construire l'image Docker
docker build -t fixierun .

# Lancer le conteneur
docker run -p 3000:3000 fixierun
```

## Tests et Qualité

```bash
# Tests unitaires
pnpm test

# Tests e2e
pnpm test:e2e

# Vérification de la qualité du code
pnpm lint:fix

# Vérification des types
pnpm type-check
```

## Optimisations de Performance

### 1. Optimisation des Images

```typescript
// next.config.js
const nextConfig = {
  images: {
    domains: ['ipfs.io', 'gateway.pinata.cloud'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

### 2. Bundle Analyzer

```bash
pnpm add -D @next/bundle-analyzer

# Analyser le bundle
ANALYZE=true pnpm build
```

### 3. Lazy Loading

```typescript
// Chargement paresseux des composants lourds
const HeavyComponent = dynamic(
  () => import('./HeavyComponent'),
  { 
    loading: () => <p>Chargement...</p>,
    ssr: false 
  }
);
```

## Surveillance et Monitoring

```bash
# Logs en production
pnpm add winston

# Monitoring des erreurs
pnpm add @sentry/nextjs

# Analytics de performance
pnpm add @vercel/analytics web-vitals
```

## Sécurité

```bash
# Audit des dépendances
pnpm audit

# Correction automatique
pnpm audit --fix

# Vérification des vulnérabilités
pnpm add -D audit-ci
```

## Mise à Jour et Maintenance

```bash
# Vérifier les mises à jour
pnpm outdated

# Mettre à jour toutes les dépendances
pnpm update

# Mettre à jour une dépendance spécifique
pnpm update next@latest
```

## Troubleshooting Avancé

### Erreurs Module Not Found

```javascript
// next.config.js
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};
```

### Erreurs de Build

```bash
# Nettoyer le cache
pnpm dlx rimraf .next node_modules/.cache

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
pnpm install

# Build en mode verbose
pnpm build --debug
```

Cette documentation couvre l'ensemble du processus d'installation, de développement et de déploiement de Fixie.Run, ainsi que la résolution des erreurs les plus courantes rencontrées.