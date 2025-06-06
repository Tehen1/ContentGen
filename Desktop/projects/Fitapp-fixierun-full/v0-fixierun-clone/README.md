# FixieRun - Web3 Move-to-Earn Cycling Platform

FixieRun is a revolutionary Web3 platform that combines physical activity, blockchain technology, and NFTs to create a unique ecosystem where cyclists can stay active while collecting and trading digital assets and earning rewards for their efforts.

## 🏗️ Architecture

This project is built as a TurboRepo monorepo with the following structure:

```
fixierun-monorepo/
├── apps/
│   ├── frontend/          # Next.js frontend application
│   └── backend/           # Express.js backend with GraphQL
├── packages/
│   ├── web3-utils/        # Wallet and contract interaction hooks
│   ├── types/             # Shared TypeScript types
│   └── contracts/         # Hardhat smart contracts
└── docs/                  # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud)
- Redis (for caching and real-time features)
- MetaMask or compatible Web3 wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/fixierun.git
   cd fixierun
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Build packages**
   ```bash
   npm run build
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- GraphQL Playground: http://localhost:4000/graphql

## 🔧 Development

### Available Scripts

- `npm run dev` - Start all development servers
- `npm run build` - Build all packages and applications
- `npm run lint` - Run ESLint across all packages
- `npm run test` - Run tests across all packages
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean all build artifacts

### Package-specific Scripts

#### Frontend (apps/frontend)
```bash
cd apps/frontend
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
```

#### Backend (apps/backend)
```bash
cd apps/backend
npm run dev          # Start Express server with nodemon
npm run build        # Compile TypeScript
npm run start        # Start production server
```

#### Smart Contracts (packages/contracts)
```bash
cd packages/contracts
npm run build        # Compile contracts
npm run test         # Run contract tests
npm run deploy       # Deploy to local network
npm run deploy:scroll # Deploy to Scroll testnet
```

## 🌐 Blockchain Integration

### Scroll zkEVM Network

FixieRun is built on Scroll zkEVM, providing:
- Low transaction costs
- Ethereum compatibility
- Enhanced security through zero-knowledge proofs

### Smart Contracts

#### FixieToken (ERC-20)
- **Symbol**: FIXIE
- **Total Supply**: 1,000,000,000 FIXIE
- **Distribution**:
  - 40% User Rewards
  - 25% Development
  - 15% Marketing
  - 10% Team (3-year vesting)
  - 10% Community Reserve

#### BikeNFT (ERC-721)
- Unique bike NFTs with rarity levels
- Evolution and fusion mechanics
- On-chain attributes and metadata

### Deployment

1. **Configure environment**
   ```bash
   # Set in .env
   PRIVATE_KEY=your_private_key
   SCROLL_TESTNET_RPC_URL=https://sepolia-rpc.scroll.io/
   ```

2. **Deploy contracts**
   ```bash
   cd packages/contracts
   npm run deploy:scroll
   ```

3. **Verify contracts**
   ```bash
   npx hardhat verify --network scrollTestnet CONTRACT_ADDRESS
   ```

## 🎮 Features

### Move-to-Earn Mechanics
- GPS tracking integration
- Real-time activity verification
- Reward calculation based on distance, speed, and consistency
- ZK-proof validation for privacy-preserving verification

### NFT System
- **5 Rarity Levels**: Common, Rare, Epic, Legendary, Mythic
- **7 Attributes**: Speed, Endurance, Agility, Strength, Balance, Reflexes, Resilience
- **Evolution**: Upgrade bikes using FIXIE tokens
- **Fusion**: Combine multiple bikes to create stronger ones

### Social Features
- Global leaderboards
- Weekly challenges
- Community governance through DAO
- Social sharing and achievements

## 🔒 Security

### Smart Contract Security
- OpenZeppelin battle-tested contracts
- Comprehensive test coverage
- Multi-signature wallet integration
- Pausable contracts for emergency stops

### Backend Security
- JWT authentication
- Rate limiting
- Input validation and sanitization
- CORS protection
- Helmet.js security headers

### Frontend Security
- Secure wallet connections
- Transaction signing verification
- XSS protection
- Content Security Policy

## 🧪 Testing

### Smart Contracts
```bash
cd packages/contracts
npm run test
npm run coverage
```

### Backend
```bash
cd apps/backend
npm run test
npm run test:integration
```

### Frontend
```bash
cd apps/frontend
npm run test
npm run test:e2e
```

## 📊 Monitoring and Analytics

### Performance Monitoring
- Real-time performance metrics
- Error tracking with Sentry
- User analytics with PostHog
- Blockchain transaction monitoring

### Health Checks
- `/health` endpoint for backend
- Database connection monitoring
- Redis connection status
- Smart contract interaction health

## 🚀 Deployment

### Staging Environment
- Automatic deployment on `develop` branch
- Scroll Sepolia testnet
- Staging database and Redis

### Production Environment
- Manual deployment from `main` branch
- Scroll mainnet
- Production infrastructure
- CDN and caching optimization

### Infrastructure
- **Frontend**: Vercel Edge Functions
- **Backend**: Railway/Heroku with auto-scaling
- **Database**: MongoDB Atlas
- **Cache**: Redis Cloud
- **Monitoring**: Grafana + Prometheus

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the established code style (ESLint + Prettier)
- Write comprehensive tests
- Update documentation
- Ensure all CI checks pass

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Smart Contract Documentation](./docs/contracts.md)
- [Frontend Architecture](./docs/frontend.md)
- [Deployment Guide](./docs/deployment.md)

## 🛠�� Troubleshooting

### Common Issues

1. **Wallet Connection Issues**
   - Ensure MetaMask is installed and connected to Scroll network
   - Check network configuration in wallet

2. **Transaction Failures**
   - Verify sufficient ETH for gas fees
   - Check contract addresses are correct
   - Ensure proper network selection

3. **Development Server Issues**
   - Clear node_modules and reinstall dependencies
   - Check environment variables are set correctly
   - Verify database and Redis connections

### Getting Help
- Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Open an issue on GitHub
- Join our Discord community

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Scroll team for the zkEVM infrastructure
- Vercel for deployment and hosting
- The Web3 and cycling communities

---

**Ready to start your FixieRun journey? 🚴‍♂️💨**

Visit [https://fixierun.com](https://fixierun.com) to get started!