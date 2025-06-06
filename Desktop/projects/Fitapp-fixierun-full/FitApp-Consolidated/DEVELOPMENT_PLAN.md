# Plan de Développement – Projet Unifié FitApp/Fixie/FitApp-zkEVM

---

## Phase 1: Initialisation & socle technique

- 📌 Mettre en place les dépôts, scripts et l'infrastructure CI/CD (docker-compose, workflows, premiers README)
- 📌 Définir et valider le schéma de données, la configuration centralisée des microservices (FastAPI, Mongo/PostgreSQL)
- 📌 Générer les stubs/interfaces d'API (OpenAPI/Swagger) et conventions pour frontends et mobile

---

## Phase 2: Backend microservices (FastAPI)

### Semaine 1-4:

- Créer le service `user-auth` (inscription, login Web2/Web3, gestion profils, OAuth, JWT, Web3 signature)
- Développer `activity-tracking` (création d'activité, suivi, synchronisation, GPS, WebSocket)
- Implémenter `rewards` (gestion tokens, NFTs, système de points, endpoints de récompenses)
- Exposer les endpoints REST/GraphQL principaux pour les frontends (Next.js/Flutter)
- Intégrer le service `ws-gateway` pour le temps réel (subscriptions/live updates)

### Semaine 5-8:

- Ajouter `analytics` (stats, historisation, leaderboards): endpoints de reporting, dashboards communautaires
- Développer `challenges` (création/join de challenges, validation, ranking, historique)
- Synchroniser et tester l'intégration entre les services et l'API Gateway
- Commencer la couverture de tests unitaires et d'intégration automatisés (pytest, CI)

---

## Phase 3: Frontend (Next.js + Redux Toolkit)

### Semaine 2-6:

- Mettre en place le squelette Next.js, Redux, types partagés pour les endpoints
- Développer accès et authentification utilisateur (connexion social Web2/Web3)
- Concevoir la structure du dashboard (visualisation activités, NFT, notifications en temps réel)
- Intégrer les composants NFTGallery, Web3Wallet, ActivityChart, notifications via WebSocket
- Créer la page Challenges et Leaderboards
- Synchronisation du frontend avec l'API backend en temps réel (fetch, socket, etc)

---

## Phase 4: Mobile (Flutter)

### Semaine 6-10:

- Initialiser la base Flutter (gestion navigation, state management bloc/provider)
- Développer un onboarding solide (auth Web2/Web3, récupération profil)
- Intégration du tracking d'activité natif (santé, GPS, step-counter, synchronisé backend)
- Composants NFTGallery, dashboard mobile, notifications push (Firebase/WS: temps réel)
- Tests UI, intégration, device (flutter test)

---

## Phase 5: Blockchain (Hardhat, Solidity)

### Semaine 3-8:

- Déployer les smart-contracts consolidés FitApp-zkEVM (ERC20, ERC721, ProfileManager)
- Développer les scripts de déploiement, setup, verify
- Intégrer les interactions microservices backend ↔ blockchain (mint NFT, reward, profile sync)
- Exposer les fonctions principales en endpoints REST + websocket (events chain)
- Tester (unit/integration) toutes les interactions blockchain

---

## Phase 6: Tests, QA, monitoring & DevOps

- Étendre la couverture de tests pour tous les services (backend, frontend, mobile, blockchain)
- Mettre en place les workflows CI/CD complets (lint, build, test, déploiement staging)
- Monitoring applicatif avancé (logs, alertes, dashboards Grafana/Prometheus/ELK, Sentry, etc)
- Déploiement cloud/containerisation: docker-compose pour l'intégration, puis migration Kubernetes

---

## Phase 7: Mise en production & Evolutions

- Déploiement cloud final (AWS, GCP, autres), DNS, sécurité/auth, sauvegardes automatisées
- Roadmap post-MVP: modules IA, features communautaires, monétisation, API publiques, analytics avancées
- Itérations continues, feedback utilisateur, scalabilité

---

📌 Documenter chaque étape (README, guides d'intégration, diagrammes, mapping endpoints/exemples d'usage)
📌 Déployer très régulièrement sur un environnement de test/démo pour garantir le feedback itératif et la robustesse

