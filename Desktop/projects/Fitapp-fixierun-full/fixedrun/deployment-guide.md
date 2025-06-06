# Guide de Déploiement Complet - Fixie.Run

## 🚀 Plan d'Action pour Corriger et Déployer

### Phase 1: Nettoyage et Configuration

#### 1.1 Suppression des Modules Problématiques
```bash
# Supprimer les dépendances problématiques
npm uninstall pino-pretty @rainbow-me/rainbowkit wagmi viem sharp

# Nettoyer le cache
npm cache clean --force
rm -rf node_modules package-lock.json
```

#### 1.2 Installation des Dépendances Optimisées
```bash
# Installer les dépendances de base
npm install next@latest react@latest react-dom@latest typescript

# Outils de développement
npm install -D @types/react @types/react-dom @types/node
npm install -D eslint eslint-config-next @typescript-eslint/eslint-plugin
npm install -D prettier husky lint-staged

# UI et animations
npm install framer-motion lucide-react clsx tailwind-merge

# Testing
npm install -D jest @testing-library/react @testing-library/jest-dom
```

### Phase 2: Correction des Fichiers de Configuration

#### 2.1 Mise à jour de next.config.js
```javascript
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
    domains: ['localhost', 'gateway.pinata.cloud', 'ipfs.io'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  output: 'standalone',
};

module.exports = nextConfig;
```

#### 2.2 Configuration TypeScript Stricte
```json
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
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Phase 3: Correction des Composants

#### 3.1 Layout Principal Simplifié
```typescript
// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Fixie.Run - Move-to-Earn Cycling Platform',
  description: 'Transform your cycling activities into evolving NFTs and earn crypto rewards.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

#### 3.2 Providers Unifiés
```typescript
// src/app/providers.tsx
'use client';

import { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Web3Provider } from '@/components/Web3Provider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TranslationProvider } from '@/contexts/TranslationContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TranslationProvider>
          <Web3Provider>
            {children}
          </Web3Provider>
        </TranslationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

### Phase 4: Optimisation des Performances

#### 4.1 Optimisation des Images
```typescript
// src/components/OptimizedImage.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width = 400, 
  height = 400, 
  className = '',
  priority = false 
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={error ? '/images/placeholder.png' : src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
}
```

### Phase 5: Sécurité et Validation

#### 5.1 Validation des Variables d'Environnement
```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: z.string().min(1),
  PINATA_JWT: z.string().min(1),
  NEXT_PUBLIC_IPFS_GATEWAY: z.string().url().optional(),
  NEXT_PUBLIC_CHAIN_ID: z.string().optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  PINATA_JWT: process.env.PINATA_JWT,
  NEXT_PUBLIC_IPFS_GATEWAY: process.env.NEXT_PUBLIC_IPFS_GATEWAY,
  NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
});
```

### Phase 6: Déploiement

#### 6.1 Scripts de Déploiement
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "deploy:vercel": "vercel --prod",
    "deploy:check": "npm run type-check && npm run lint && npm run build"
  }
}
```

#### 6.2 Configuration Vercel
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "installCommand": "npm ci",
  "outputDirectory": ".next",
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

## 🔧 Commandes de Déploiement

### Étapes de Déploiement Local
```bash
# 1. Vérifier l'environnement
npm run env:check

# 2. Tests et validation
npm run type-check
npm run lint
npm run test

# 3. Build de production
npm run build

# 4. Test local du build
npm run start
```

### Déploiement sur Vercel
```bash
# Installation de Vercel CLI
npm i -g vercel

# Connexion à Vercel
vercel login

# Déploiement
vercel --prod

# Ou via GitHub Actions (recommandé)
git push origin main
```

## 🔍 Checklist Pré-Déploiement

- [ ] ✅ Variables d'environnement configurées
- [ ] ✅ Tests unitaires passent
- [ ] ✅ TypeScript compile sans erreur
- [ ] ✅ ESLint ne signale aucune erreur
- [ ] ✅ Build de production réussit
- [ ] ✅ Images optimisées et accessibles
- [ ] ✅ Error boundaries en place
- [ ] ✅ Performance optimisée (Lighthouse > 90)
- [ ] ✅ Sécurité validée (headers, CORS)

## 📊 Monitoring Post-Déploiement

### Analytics et Monitoring
```typescript
// src/lib/analytics.ts
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }
}

export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: url,
    });
  }
}
```

### Health Check API
```typescript
// src/pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    env: process.env.NODE_ENV,
  };

  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = 'Error';
    res.status(503).json(healthcheck);
  }
}
```

## 🎯 Résultat Attendu

Après avoir suivi ce guide, vous devriez avoir :

1. ✅ Une application qui compile sans erreur
2. ✅ Tous les modules problématiques supprimés
3. ✅ Configuration optimisée pour la production
4. ✅ Composants sécurisés et performants
5. ✅ Déploiement automatisé via Vercel
6. ✅ Monitoring et analytics en place

L'application sera accessible à l'adresse fournie par Vercel avec des performances optimisées et une sécurité renforcée.