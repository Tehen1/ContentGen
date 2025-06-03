# ContentGen - Générateur de Contenu pour Réseaux Sociaux
ContentGen est une application web moderne construite avec Next.js, React, TypeScript et Tailwind CSS, conçue pour aider les utilisateurs à générer et planifier du contenu adapté à diverses plateformes de réseaux sociaux. Elle s'inspire d'une interface utilisateur fournie et intègre des fonctionnalités telles que la configuration de contenu, la génération assistée par IA (simulée), l'adaptation multi-plateforme, et la planification de posts.

## Fonctionnalités Principales
* Configuration Détaillée du Contenu : Définissez le sujet, le ton, la longueur, les mots-clés et les appels à l'action.
* Sélection Multi-Plateforme : Ciblez LinkedIn, Twitter/X, Facebook, et Instagram.
* Génération de Contenu (Simulée) : Utilise une Server Action Next.js pour simuler la génération de contenu par une IA.
* Adaptation Automatique : Le contenu de base est formaté et ajusté pour chaque plateforme sélectionnée, en respectant les limites de caractères.
* Limiteur de Taux (Rate Limiter) : Un système de tokens côté client pour simuler les limitations d'usage d'API.
* Édition en Ligne : Modifiez le contenu généré directement dans l'interface.
* Planification de Posts : Programmez la "publication" de vos posts (simulation via localStorage et timers côté client).
* Interface Réactive et Moderne : Construite avec Tailwind CSS et shadcn/ui pour une expérience utilisateur agréable et responsive.
* Mode Sombre/Clair : S'adapte aux préférences système.

## Technologies Utilisées
* Framework Frontend : Next.js (App Router)
* Bibliothèque UI : React.js
* Langage : TypeScript
* Styling : Tailwind CSS
* Composants UI : shadcn/ui
* Icônes : Lucide React
* Gestion d'État (Client) : React Hooks (useState, useEffect, useMemo)
* Actions Serveur : Next.js Server Actions (pour la logique de génération de contenu)
* Linting/Formatting : (Recommandé : ESLint, Prettier)

## Démarrage Rapide
Pour faire fonctionner ce projet localement, suivez ces étapes :

1. Cloner le dépôt (si vous l'avez déjà poussé sur GitHub) :
```bash
git clone https://github.com/Tehen1/ContentGen.git
cd ContentGen
```

Si vous partez de zéro avec le code fourni par v0, assurez-vous que tous les fichiers sont dans la bonne structure de projet Next.js.

2. Installer les dépendances : En utilisant npm, yarn, ou pnpm.
```bash
npm install
# ou
yarn install
# ou
pnpm install
```
Cela installera Next.js, React, Tailwind CSS, shadcn/ui, Lucide React, et les autres dépendances nécessaires.

3. Configurer les variables d'environnement (si nécessaire) : Pour l'instant, ce projet n'utilise pas de variables d'environnement critiques pour son fonctionnement de base (la génération IA est simulée). Si vous intégrez une vraie API d'IA, vous devrez ajouter un fichier .env.local avec vos clés API. Exemple :
```
OPENAI_API_KEY=votre_cle_api_openai
ANTHROPIC_API_KEY=votre_cle_api_anthropic
```

4. Lancer le serveur de développement :
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```
Ouvrez http://localhost:3000 dans votre navigateur pour voir l'application.

## Structure du Projet (Simplifiée)
```
ContentGen/
├── app/ # Routeur d'application Next.js
│   ├── actions.ts # Server Actions (génération de contenu)
│   ├── layout.tsx # Layout principal
│   └── page.tsx # Page d'accueil (contient SocialContentGenerator)
├── components/
│   ├── ui/ # Composants shadcn/ui (Button, Card, Input, etc.)
│   └── social-content-generator.tsx # Composant principal de l'application
├── lib/
│   ├── platform-handlers.ts # Logique spécifique à chaque plateforme
│   ├── rate-limiter.ts # Implémentation du limiteur de taux
│   └── types.ts # Définitions TypeScript
├── public/
│   └── limiter.py # Fichier Python de référence (non utilisé activement)
├── tailwind.config.ts
├── next.config.mjs
└── README.md
```

## Prochaines Étapes et Améliorations Possibles
* Intégration d'un vrai modèle IA : Connecter la Server Action à une API d'IA (OpenAI, Anthropic Claude, etc.) en utilisant le Vercel AI SDK.
* Backend pour la Planification : Remplacer la simulation localStorage par un vrai système de cron jobs et une base de données pour la planification des posts.
* Authentification Utilisateur : Permettre aux utilisateurs de sauvegarder leurs configurations et posts.
* Prévisualisation Améliorée : Afficher un aperçu plus fidèle du post tel qu'il apparaîtrait sur chaque plateforme.
* Tests : Ajouter des tests unitaires et d'intégration.

## Contribution
Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

Généré avec l'aide de v0.
