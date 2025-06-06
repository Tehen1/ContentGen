# FitApp Frontend (Next.js)

Ce frontend est basé sur Next.js + TypeScript.

## Démarrage rapide

```sh
npm install
npm run dev
```
puis ouvrir http://localhost:3000 dans le navigateur.

## Build Docker

```sh
docker build -t fitapp-frontend .
docker run -it --rm -p 3000:3000 fitapp-frontend
```

## Structure

- pages/index.tsx : page "Hello World"
- Config TypeScript et Dockerfile inclus.

