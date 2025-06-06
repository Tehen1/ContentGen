# Guide de Déploiement Fixie.Run

Ce document décrit le processus de déploiement de l'application Fixie.Run en production.

## Prérequis

- Node.js 18+
- npm 8+
- Accès à Vercel
- Accès à la base de données Neon
- Git

## Environnements

L'application peut être déployée dans trois environnements :

- **Development** : Pour le développement local
- **Staging** : Pour les tests avant production
- **Production** : Environnement de production

## Variables d'Environnement

Créez un fichier `.env.{environment}` pour chaque environnement avec les variables suivantes :

\`\`\`env
# Base de données
DATABASE_URL=postgres://user:password@host/database

# Authentification
JWT_SECRET=your-secret-key

# Monitoring
MONITORING_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz
ERROR_LOGGING_ENDPOINT=https://api.monitoring.com/errors
METRICS_ENDPOINT=https://api.monitoring.com/metrics

# Vercel
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
VERCEL_API_TOKEN=your-api-token
\`\`\`

## Déploiement Automatisé

Le moyen le plus simple de déployer l'application est d'utiliser le script de déploiement automatisé :

\`\`\`bash
# Installer les dépendances
npm install

# Déployer en staging
npm run deploy:staging

# Déployer en production
npm run deploy:production
\`\`\`

## Déploiement Manuel

Si vous préférez un déploiement manuel, suivez ces étapes :

1. **Préparer l'application**

\`\`\`bash
# Installer les dépendances
npm install

# Construire l'application
npm run build
\`\`\`

2. **Déployer sur Vercel**

\`\`\`bash
# Installer Vercel CLI
npm install -g vercel

# Déployer en staging
vercel deploy --env NODE_ENV=staging

# Déployer en production
vercel deploy --prod --env NODE_ENV=production
\`\`\`

3. **Déployer la base de données**

\`\`\`bash
# Déployer les migrations en staging
bash scripts/deploy-database.sh staging

# Déployer les migrations en production
bash scripts/deploy-database.sh production
\`\`\`

## Vérification Post-Déploiement

Après le déploiement, vérifiez que l'application fonctionne correctement :

1. Accédez à l'URL de l'application
2. Vérifiez l'état de santé : `/api/health`
3. Testez les fonctionnalités principales

## Rollback

En cas de problème, vous pouvez revenir à la version précédente :

\`\`\`bash
# Revenir à la version précédente sur Vercel
vercel rollback

# Restaurer la base de données
bash scripts/restore-database.sh production backup_file.sql
\`\`\`

## Monitoring

L'application dispose d'un système de monitoring intégré :

- **État de santé** : `/api/health`
- **Métriques** : Envoyées automatiquement à l'endpoint configuré
- **Alertes** : Configurées pour notifier en cas de problème

## CI/CD

Le déploiement continu est configuré via GitHub Actions :

- Les commits sur `dev` sont déployés automatiquement en staging
- Les commits sur `main` sont déployés automatiquement en production
- Les tests sont exécutés avant chaque déploiement

## Optimisation des Performances

Pour optimiser les performances de l'application :

1. Exécutez l'optimisation des images :
\`\`\`bash
node scripts/optimize-images.js
\`\`\`

2. Analysez le bundle :
\`\`\`bash
npm run build -- --analyze
\`\`\`

3. Vérifiez les performances de la base de données :
\`\`\`bash
node scripts/check-db-performance.js
