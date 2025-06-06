# Guide Onboarding Développeur FitApp

## Prérequis
- Docker, Docker Compose
- Node.js >= 18, npm
- Python >= 3.9, pip
- Flutter >= 3, Dart
- Accès repo GitHub

## Installation rapide
```bash
git clone <repo>
cd FitApp-Consolidated
docker-compose up --build
```

## Structure des dossiers
Voir [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

## Bonnes pratiques
- Toujours créer une branche pour chaque feature
- Lint et tests obligatoires avant PR
- Documentation à jour dans `docs/`
- Secrets dans fichiers `.env` (jamais commit)

## Checklist avant PR
- [ ] Code testé localement
- [ ] Lint passé
- [ ] Documentation mise à jour
- [ ] Tests automatisés OK
