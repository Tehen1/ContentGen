# Ressources et Liens Utiles - Fixie.Run

## 🔗 Liens de Configuration Essentiels

### 1. WalletConnect
- **Dashboard**: https://cloud.walletconnect.com/
- **Documentation**: https://docs.walletconnect.com/
- **Project ID**: Nécessaire pour `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`

### 2. Pinata (IPFS)
- **Dashboard**: https://app.pinata.cloud/
- **API Keys**: https://app.pinata.cloud/keys
- **Documentation**: https://docs.pinata.cloud/
- **JWT Token**: Nécessaire pour `PINATA_JWT`

### 3. Vercel (Déploiement)
- **Dashboard**: https://vercel.com/dashboard
- **CLI**: `npm i -g vercel`
- **Analytics**: https://vercel.com/analytics
- **Documentation**: https://vercel.com/docs

### 4. Polygon zkEVM
- **Network Details**: https://polygon.technology/polygon-zkevm
- **RPC Endpoint**: `https://zkevm-rpc.com`
- **Chain ID**: `1101`
- **Explorer**: https://zkevm.polygonscan.com/

## 📚 Documentation Technique

### Next.js 14
- **App Router**: https://nextjs.org/docs/app
- **Image Optimization**: https://nextjs.org/docs/app/api-reference/components/image
- **Performance**: https://nextjs.org/docs/app/building-your-application/optimizing

### TypeScript
- **Configuration**: https://www.typescriptlang.org/tsconfig
- **Strict Mode**: https://www.typescriptlang.org/tsconfig#strict
- **React Types**: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react

### TailwindCSS
- **Documentation**: https://tailwindcss.com/docs
- **Components**: https://tailwindui.com/
- **Color Palette**: https://tailwindcss.com/docs/customizing-colors

## 🛠️ Outils de Développement

### Analyse et Monitoring
- **Lighthouse CI**: https://github.com/GoogleChrome/lighthouse-ci
- **Bundle Analyzer**: https://www.npmjs.com/package/@next/bundle-analyzer
- **Core Web Vitals**: https://web.dev/vitals/

### Testing
- **Jest**: https://jestjs.io/docs/getting-started
- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro/
- **Playwright**: https://playwright.dev/

### Code Quality
- **ESLint**: https://eslint.org/docs/user-guide/getting-started
- **Prettier**: https://prettier.io/docs/en/index.html
- **Husky**: https://typicode.github.io/husky/

## 🔐 Variables d'Environnement

### Fichier .env.local (Template)
```bash
# Web3 Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_CHAIN_ID=1101

# IPFS Configuration
PINATA_JWT=your_pinata_jwt_token_here
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# Blockchain Configuration
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=https://zkevm-rpc.com

# Analytics (Optionnel)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Database (Si nécessaire)
DATABASE_URL=postgresql://...
```

### Vercel Environment Variables
```bash
# Production
vercel env add PINATA_JWT
vercel env add NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

# Preview
vercel env add PINATA_JWT preview
vercel env add NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID preview
```

## 📋 Commandes Utiles

### Développement
```bash
# Installer les dépendances
npm install

# Démarrer en développement
npm run dev

# Vérifier TypeScript
npm run type-check

# Linter et formater
npm run lint
npm run format

# Tests
npm run test
npm run test:watch
```

### Production
```bash
# Build de production
npm run build

# Démarrer en production
npm run start

# Analyser le bundle
npm run analyze

# Déployer sur Vercel
npm run deploy
```

### Debugging
```bash
# Debug avec Node.js
NODE_OPTIONS='--inspect' npm run dev

# Verbose build
npm run build -- --debug

# Profile build
npm run build -- --profile
```

## 🎨 Assets et Design

### Images NFT
- **Format recommandé**: PNG avec transparence
- **Taille**: 512x512px minimum
- **Optimisation**: WebP/AVIF avec fallback PNG
- **Nommage**: `bike-{rarity}-{id}.png`

### Thèmes Couleurs
```css
:root {
  /* Cyberpunk */
  --cyberpunk-primary: #6366f1;
  --cyberpunk-secondary: #8b5cf6;
  --cyberpunk-accent: #06ffa5;
  
  /* Neon */
  --neon-primary: #ff006e;
  --neon-secondary: #fb5607;
  --neon-accent: #ffbe0b;
}
```

### Icônes
- **Lucide React**: https://lucide.dev/icons/
- **Heroicons**: https://heroicons.com/
- **Tabler Icons**: https://tabler-icons.io/

## 📊 Métriques de Performance

### Core Web Vitals Targets
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Lighthouse Scores
- **Performance**: > 90
- **Accessibility**: > 95
- **Best Practices**: > 95
- **SEO**: > 90

## 🔍 Debugging et Monitoring

### Error Tracking
```typescript
// Sentry Configuration
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring
```typescript
// Web Vitals
export function reportWebVitals(metric: any) {
  console.log(metric);
  // Envoyer à votre service d'analytics
}
```

## 🚀 Checklist de Déploiement Final

### ✅ Configuration
- [ ] Variables d'environnement configurées
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] SSL/TLS activé
- [ ] Analytics configuré

### ✅ Performance
- [ ] Images optimisées
- [ ] Bundle size < 1MB
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals OK

### ✅ Sécurité
- [ ] Headers de sécurité activés
- [ ] CORS configuré
- [ ] Rate limiting activé
- [ ] Input validation implémentée

### ✅ Fonctionnalités
- [ ] Connexion wallet testée
- [ ] IPFS/Pinata fonctionnel
- [ ] Interface multilingue OK
- [ ] Responsive design validé

## 📞 Support et Communauté

### Discord/Telegram
- **Next.js**: https://nextjs.org/discord
- **Vercel**: https://vercel.com/discord
- **WalletConnect**: https://discord.gg/walletconnect

### Stack Overflow
- **Tag Next.js**: https://stackoverflow.com/questions/tagged/next.js
- **Tag React**: https://stackoverflow.com/questions/tagged/reactjs
- **Tag TypeScript**: https://stackoverflow.com/questions/tagged/typescript

### GitHub Repositories
- **Next.js**: https://github.com/vercel/next.js
- **Create Next App**: https://github.com/vercel/next.js/tree/canary/packages/create-next-app
- **Examples**: https://github.com/vercel/next.js/tree/canary/examples

## 🎯 Prochaines Étapes

1. **Exécuter le script de correction**:
   ```bash
   chmod +x fix-and-deploy.sh
   ./fix-and-deploy.sh
   ```

2. **Configurer les variables d'environnement**:
   - Créer un compte WalletConnect
   - Configurer Pinata
   - Copier les clés dans `.env.local`

3. **Tester localement**:
   ```bash
   npm run dev
   ```

4. **Déployer sur Vercel**:
   ```bash
   npm run deploy
   ```

5. **Monitorer les performances**:
   - Vérifier les Core Web Vitals
   - Surveiller les erreurs
   - Optimiser selon les retours

---

**🎉 Félicitations !** Votre application Fixie.Run est maintenant prête pour un déploiement en production avec toutes les optimisations et meilleures pratiques en place.