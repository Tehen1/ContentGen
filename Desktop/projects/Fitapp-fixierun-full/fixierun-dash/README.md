# Fixie.Run - Application Web3 pour Cyclistes

## 🚀 Installation

### Méthode 1 : Installation automatique (recommandée)

\`\`\`bash
# Cloner le dépôt
git clone https://github.com/votre-utilisateur/fixierun-app.git
cd fixierun-app

# Installer les dépendances
npm run install-deps

# Démarrer l'application
npm run dev
\`\`\`

### Méthode 2 : Installation manuelle

\`\`\`bash
# Cloner le dépôt
git clone https://github.com/votre-utilisateur/fixierun-app.git
cd fixierun-app

# Installer les dépendances
npm install

# Créer les composants manquants
npx tsx scripts/fix-missing-components.ts

# Démarrer l'application
npm run dev
\`\`\`

### Méthode 3 : Installation avec script shell

\`\`\`bash
# Cloner le dépôt
git clone https://github.com/votre-utilisateur/fixierun-app.git
cd fixierun-app

# Rendre le script exécutable
chmod +x install.sh

# Exécuter le script d'installation
./install.sh

# Démarrer l'application
npm run dev
\`\`\`

## 🔧 Scripts disponibles

- `npm run dev` : Démarrer le serveur de développement
- `npm run build` : Construire l'application pour la production
- `npm run start` : Démarrer l'application en mode production
- `npm run lint` : Exécuter ESLint
- `npm run install-deps` : Installer toutes les dépendances
- `npm run verify` : Vérifier l'installation
- `npm run fix-components` : Créer les composants manquants
- `npm run check-components` : Vérifier les exports des composants

## 📚 Technologies utilisées

- **Frontend** : React.js, Next.js, TypeScript, Tailwind CSS
- **Blockchain** : Web3.js, Ethereum
- **UI** : Radix UI, shadcn/ui
- **Base de données** : Neon (PostgreSQL)
- **Animations** : Framer Motion
- **Icônes** : Lucide React

## 🏗️ Structure du projet

\`\`\`
fixierun-app/
├── app/                  # Pages et routes Next.js
├── components/           # Composants React
│   ├── dashboard/        # Composants du tableau de bord
│   ├── landing/          # Composants de la page d'accueil
│   ├── theme/            # Composants de thème
│   ├── ui/               # Composants UI réutilisables
│   └── web3/             # Composants Web3
├── hooks/                # Hooks React personnalisés
├── lib/                  # Bibliothèques et utilitaires
│   ├── i18n/             # Internationalisation
│   └── web3/             # Utilitaires Web3
├── public/               # Fichiers statiques
├── scripts/              # Scripts d'installation et de vérification
└── styles/               # Styles CSS globaux
\`\`\`

## 🌐 Fonctionnalités

- **Authentification Web3** : Connexion avec MetaMask et autres wallets
- **Tableau de bord** : Suivi des activités cyclistes
- **NFTs** : Création et gestion de NFTs de vélos
- **Marketplace** : Achat et vente de NFTs
- **Thèmes** : Plusieurs thèmes disponibles
- **Responsive** : Compatible mobile et desktop

## 📝 Licence

MIT
