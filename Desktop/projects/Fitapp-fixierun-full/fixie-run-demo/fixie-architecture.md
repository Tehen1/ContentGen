# Architecture Technique Fixie.RUN

## Vue d'Ensemble du Système

Fixie.RUN est une plateforme Move-to-Earn (M2E) décentralisée conçue pour les cyclistes, utilisant une architecture monorepo moderne avec intégration blockchain.

### Stack Technologique Principal

#### Frontend (Next.js 15)
- **Framework**: Next.js 15 avec App Router
- **Authentification**: Web3Auth + Auth0 pour l'authentification hybride Web2/Web3
- **Intégration Blockchain**: Rainbow Kit + Wagmi + Ethers.js
- **Interface**: React + TypeScript + Tailwind CSS
- **Cartes**: Mapbox GL pour le tracking GPS
- **State Management**: Zustand pour l'état global

#### Backend (Express.js)
- **API**: Express.js avec architecture RESTful
- **WebSocket**: Socket.io pour les mises à jour temps réel
- **Base de données**: MongoDB avec Mongoose ODM
- **Authentification**: JWT + signature de messages Web3
- **Storage**: IPFS/Filecoin pour les métadonnées NFT
- **Logging**: Winston pour la journalisation

#### Smart Contracts (Solidity)
- **Blockchain**: Polygon zkEVM pour des frais de gas réduits
- **Tokens**: 
  - `FixieToken.sol` (ERC20) - Token de récompense $FIX
  - `PedalToken.sol` (ERC20) - Token de gouvernance
- **NFTs**: `BikeNFT.sol` (ERC721) avec mécaniques d'évolution
- **DeFi**: `Staking.sol` pour les récompenses de staking
- **Vérification**: `ActivityVerifier.sol` avec ZK proofs

#### Analyseur Python
- **API**: FastAPI pour l'analyse de données fitness
- **ML**: Scikit-learn pour la détection d'anomalies
- **Données**: Pandas + NumPy pour le traitement
- **Visualisation**: Matplotlib + Seaborn

## Architecture des Composants

### 1. Couche d'Authentification
```
Utilisateur → Web3Auth/Auth0 → JWT Custom → Smart Contracts
```

### 2. Flux de Données d'Activité
```
GPS Mobile → Python Analyzer → Backend API → Smart Contracts → Récompenses
```

### 3. Gestion des NFTs
```
Activité Cycliste → Évolution NFT → Métadonnées IPFS → Affichage Frontend
```

## Sécurité et Vérification

### ZK Proofs pour l'Activité
- **Objectif**: Vérifier les activités cyclistes sans révéler les données GPS exactes
- **Implémentation**: Circuit ZK personnalisé pour valider la distance et la vitesse
- **Avantages**: Protection de la vie privée + prévention de la triche

### Détection d'Anomalies
- **ML Pipeline**: Analyse des patterns de déplacement suspects
- **Métriques**: Vitesse, accélération, consistance GPS
- **Action**: Marquage automatique pour révision manuelle

## Économie des Tokens

### Token $FIX (Récompenses)
- **Supply**: 1 milliard de tokens
- **Distribution**: 
  - 40% Récompenses utilisateurs
  - 25% Réserve de développement
  - 20% Staking rewards
  - 15% Équipe et advisors

### Token $PEDAL (Gouvernance)
- **Mécanisme**: Vote sur les propositions d'amélioration
- **Acquisition**: Participation active + staking long terme
- **Utilité**: Décisions sur les paramètres de récompenses

## Scalabilité et Performance

### Polygon zkEVM
- **Frais**: ~90% moins cher qu'Ethereum mainnet
- **Débit**: 2000+ TPS vs 15 TPS Ethereum
- **Finalité**: ~1-3 minutes pour la confirmation
- **Compatibilité**: 100% compatible EVM

### Architecture Microservices
- **Séparation**: Chaque composant peut être déployé indépendamment
- **Load Balancing**: Distribution des charges via nginx
- **Cache**: Redis pour les données fréquemment accédées
- **CDN**: CloudFlare pour les assets statiques

## Intégrations Externes

### APIs Fitness
- **Apple HealthKit**: iOS fitness data
- **Google Fit**: Android fitness data
- **Strava**: Import d'activités existantes
- **Garmin Connect**: Montres GPS

### Services Tiers
- **Mapbox**: Cartes et géolocalisation
- **OpenWeatherMap**: Conditions météorologiques
- **IPFS**: Stockage décentralisé
- **The Graph**: Indexation blockchain

## Monitoring et Analytics

### Métriques Utilisateur
- **Activité**: Distance, temps, calories brûlées
- **Engagement**: Sessions par semaine, durée moyenne
- **Économique**: Tokens gagnés, NFTs possédés

### Métriques Système
- **Performance**: Temps de réponse API, uptime
- **Blockchain**: Gas usage, succès des transactions
- **Erreurs**: Taux d'erreur, logs d'exception