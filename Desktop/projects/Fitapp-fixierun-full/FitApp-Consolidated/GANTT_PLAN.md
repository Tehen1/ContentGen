# Gantt : Roadmap Développement Plateforme FitApp/Fixie/FitApp-zkEVM

| Phase                           | Tâche principale                                                      | Début | Fin/semaine | Durée (sem) | Dépendance(s)              |
|----------------------------------|-----------------------------------------------------------------------|-------|-------------|-------------|----------------------------|
| Phase 1: Initialisation socle    | Dépôts, CI/CD, BD, stubs API, docker-compose                         | S1    | S2          | 2           | -                          |
| Phase 2: Backend microservices   | user-auth, activity-tracking, rewards, ws-gateway, endpoints         | S1    | S8          | 8           | Phase 1                    |
|                                  | analytics, challenges, API Gateway, tests intégration                | S5    | S8          | 4           | Backend first batch (S4)   |
| Phase 3: Frontend Next.js        | Squelette, auth, dashboard, NFTGallery, WebSocket, challenges        | S2    | S6          | 5           | Backend endpoints (REST)   |
| Phase 4: Mobile Flutter          | Setup, onboarding, tracking, NFT, notifications, tests               | S6    | S10         | 5           | Backend + Front MVP        |
| Phase 5: Blockchain              | Déploiements, scripts, intégration backend, tests smart contract     | S3    | S8          | 6           | Phase 1, Backend début     |
| Phase 6: QA, DevOps, Monitoring  | Tests, CI/CD, monitoring, kubernetes, staging                        | S7    | S12         | 6           | Back+Front+Mobile MVP      |
| Phase 7: Prod & Evolutions       | Déploiement cloud, sécurité, roadmap évolutive                       | S13   | S16+        | 4+          | Fin de QA/Tests            |

**Légende**

- S1 = semaine 1, etc.
- Chevauchement : les phases peuvent démarrer dès que leurs dépendances minimales (API, CI, bases techniques) sont en place.

---

## Prochaine étape (Phase 1) : Initialisation & socle technique

1. Créer ou structurer les dépôts (monorepo recommandé).
2. Mettre en place les scripts de build/dev (backend, frontend, mobile, blockchain).
3. Implémenter les premiers fichiers CI/CD : 
    - `.github/workflows/ci.yml` (lint, test, docker build)
    - `docker-compose.yml` (orchestration des containers existants)
4. Écrire/adapter des README initiaux par service : backend/README.md, frontend/README.md, mobile/README.md, blockchain/README.md.
5. Starter la configuration de la BD centrale (docker-compose.yml: postgres & mongodb), valider l’accès/test.
6. Générer les schémas/stubs d’API initiaux :
    - Utiliser FastAPI pour générer la doc auto (OpenAPI/Swagger UI)
    - Exporter un premier `openapi.json` pour contracter dev front/mobile.
7. Planifier l’attribution et la branche de développement pour chaque équipe/service.

---

_À chaque étape, documenter l’avancement, versionner et valider (CI), puis itérer en débutant les développements des services critiques dès que le squelette est prêt._

