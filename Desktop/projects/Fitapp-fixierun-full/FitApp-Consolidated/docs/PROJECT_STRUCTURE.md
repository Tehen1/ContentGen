# Structure du Monorepo FitApp

```
FitApp-Consolidated/
│
├── backend/           # Microservices Python (FastAPI, Flask)
├── frontend/          # Next.js (React, Redux, TypeScript)
├── mobile/            # Flutter (Dart)
├── blockchain/        # Solidity, Hardhat
├── devops/            # Docker, CI/CD, Terraform, scripts
├── docs/              # Documentation centralisée
├── README.md          # Synthèse, liens docs
├── docker-compose.yml # Orchestration multi-services
└── ...
```

## Règles de nommage
- Branches : `feature/<module>-<description>`, `fix/<module>-<description>`
- Commits : convention [Conventional Commits](https://www.conventionalcommits.org/)

## Exemples de commandes
- Build backend : `docker-compose up --build backend`
- Lancer tests frontend : `cd frontend && npm run test`
- Déployer smart contracts : `cd blockchain && npx hardhat run scripts/deploy.ts`

## Lien vers scripts et Dockerfile
- Chaque service a son propre `Dockerfile`
- Scripts de migration dans `devops/scripts/`
