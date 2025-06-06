# FitApp

FitApp est une plateforme modulaire de santé et bien-être intégrant Web3, mobile, IA et gamification.

## Table des matières

- [Structure du Monorepo](#structure-du-monorepo)
- [Démarrage rapide](#démarrage-rapide)
- [Documentation](#documentation)
- [Contribution](#contribution)
- [Roadmap](#roadmap)

## Structure du Monorepo

- `backend/` : Microservices Python (API Gateway, user-auth, activity-tracking...)
- `frontend/` : Frontend Next.js (React, Redux, TypeScript)
- `mobile/` : Application Flutter
- `blockchain/` : Smart contracts Solidity, Hardhat
- `devops/` : Docker, CI/CD, Terraform, scripts de migration
- `docs/` : Documentation technique et guides onboarding

## Démarrage rapide

```bash
docker-compose up --build
```

## CI/CD

- Workflows GitHub Actions dans `.github/workflows/`
- Lint, tests, build et déploiement automatisés

## Documentation

- [Plan de développement](docs/DEVELOPMENT_PLAN.md)
- [Structure du projet](docs/PROJECT_STRUCTURE.md)
- [Roadmap produit](docs/PRODUCT_ROADMAP.md)
- [Guide onboarding](docs/ONBOARDING.md)
- [Architecture unifiée](docs/fitapp-unified-architecture.md)
- [Plan d'implémentation](docs/fitapp-implementation-plan.md)
- [Guides techniques](docs/)
  - [API Backend](docs/API_BACKEND.md) (à créer)
  - [Smart Contracts](docs/SMART_CONTRACTS.md) (à créer)
  - [Mobile/Flutter](docs/MOBILE.md) (à créer)
  - [CI/CD](docs/CI_CD.md) (à créer)

## Contribution

- Fork, PR, respect du lint et des tests, changelog à jour

## Roadmap

- MVP: Auth, tracking, dashboard, NFT, notifications
- Post-MVP: IA, communautés, marketplace, API publique
