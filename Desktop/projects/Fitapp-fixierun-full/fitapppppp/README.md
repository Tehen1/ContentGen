# FIXIE - Fitness App with Blockchain Rewards

FIXIE is an innovative fitness application that combines traditional activity tracking with blockchain rewards, allowing users to earn $FIXIE tokens for their physical activities.

## Project Structure

```
fitapppppp/
│
├── backend/                 # Backend services
│   └── services/            # Microservices
│       ├── activity-tracking/  # Activity tracking service
│       ├── rewards/         # Rewards and tokens management
│       ├── analytics/       # Data analysis and statistics
│       ├── challenges/      # Challenges and competitions
│       └── nft-management/  # NFT and badges management
│
├── frontend/               # Web PWA (React with Next.js)
│   ├── components/         # Reusable UI components
│   ├── pages/              # Application pages
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React context providers
│   ├── styles/             # CSS/SCSS styles
│   └── public/             # Static assets
│
├── mobile/                 # Mobile app (Flutter)
│   ├── lib/                # Dart code
│   │   ├── src/            # Main app code
│   │   │   ├── screens/    # App screens
│   │   │   ├── widgets/    # Reusable widgets
│   │   │   ├── services/   # API and business logic
│   │   │   ├── models/     # Data models
│   │   │   ├── bloc/       # State management
│   │   │   └── utils/      # Utilities and constants
│   │   └── main.dart       # Entry point
│   ├── assets/             # Mobile app assets
│   └── test/               # Test files
│
├── blockchain/             # Blockchain integration
│   ├── contracts/          # Smart contracts
│   ├── scripts/            # Deployment and management scripts
│   ├── test/               # Contract tests
│   └── wallet/             # Wallet integration
│
├── infrastructure/         # DevOps and infrastructure
│
└── docs/                   # Documentation
    ├── architecture.md     # Architecture overview
    ├── api-specs.md        # API specifications
    ├── microservices.md    # Microservices details
    └── blockchain-integration.md # Blockchain integration details
```

## Development Status

This project is currently in the initial setup phase:

- ✅ Basic project structure created
- ✅ Backend microservices architecture defined
- ✅ Activity tracking service skeleton implemented
- ✅ Frontend web application initialized with Next.js
- ✅ Mobile app initialized with Flutter
- ✅ Smart contract for $FIXIE token created
- ✅ Documentation framework established
- ✅ Backend services initialized
- ✅ Frontend initialized
- ✅ Blockchain integration setup

## Next Steps

1. Complete implementation of all microservices
2. Implement user authentication and authorization
3. Build frontend interfaces for all core features
4. Complete mobile app development
5. Set up CI/CD pipeline for automated testing and deployment
6. Deploy to staging environment

## Core Features

- Activity tracking (running, cycling, walking)
- Comprehensive dashboard with key metrics
- $FIXIE tokens earned through physical activity
- Level system with progressive rewards
- Weekly and monthly challenges
- Multiplayer competitions
- NFT badges and collectibles
- Integrated wallet for managing tokens

## Technology Stack

- **Backend**: Python/FastAPI
- **Frontend**: React/Next.js
- **Mobile**: Flutter
- **Blockchain**: zkEVM/Solidity
- **Databases**: PostgreSQL, MongoDB
- **Real-time Communication**: WebSockets
- **Infrastructure**: Serverless (AWS Lambda or Google Cloud Functions)

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Flutter SDK
- Ethereum development tools (Hardhat/Truffle)
- Python 3.9+

### Running the Backend

```bash
# Start all microservices with Docker Compose
docker-compose up -d

# Or run a specific service
cd backend/services/activity-tracking
npm install
npm run dev
```

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

### Running the Mobile App

```bash
cd mobile
flutter pub get
flutter run
```

### Deploying Smart Contracts

```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat test
```

## Contributing

(Contribution guidelines will be added)

## License

(License information will be added)
