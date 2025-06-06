# Fixie.RUN

A blockchain-based Move-to-Earn (M2E) fitness application for cyclists. Fixie.RUN rewards users with crypto tokens for physical activities, featuring NFT bikes that evolve based on usage, and implements a robust reward system verified through zero-knowledge proofs.

## 📋 Project Overview

This project consists of multiple integrated components:

- **Frontend**: Next.js 15 application with Web3 integration
- **Backend**: Express-based API with WebSocket support
- **Contracts**: Smart contracts targeting Polygon zkEVM
- **Analyzer**: Python-based component for fitness activity analysis

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Python 3.8+
- PostgreSQL
- Docker (optional)

### Installation

1. **Clone the Repository**

```bash
git clone https://github.com/yourusername/fixie-run.git
cd fixie-run
```

2. **Install Dependencies**

```bash
# Install dependencies
npm install

# If using a monorepo structure
npm run bootstrap
```

3. **Set Up the Database**

```bash
# Create the database
createdb fixierun_db

# Run migrations
npm run migrate
```

4. **Install Python Dependencies (for the analyzer)**

```bash
# Navigate to the analyzer directory (if it exists)
cd analyzer

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

5. **Set Up Environment Variables**

Create `.env.local` file in the project root with the following variables:

```
# Web3Auth Configuration
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
WEB3AUTH_CLIENT_SECRET=your_web3auth_client_secret

# Backend URL (when implemented)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001

# Smart Contract Addresses (when deployed)
NEXT_PUBLIC_FIXIE_TOKEN_ADDRESS=your_token_address
NEXT_PUBLIC_PEDAL_TOKEN_ADDRESS=your_token_address
NEXT_PUBLIC_BIKE_NFT_ADDRESS=your_nft_address
NEXT_PUBLIC_STAKING_ADDRESS=your_staking_address
NEXT_PUBLIC_ACTIVITY_VERIFIER_ADDRESS=your_verifier_address

# Auth0 Configuration (if using Auth0)
AUTH0_DOMAIN=your_auth0_domain
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
```

## ⚙️ Development

### Start the Development Server

```bash
# Start the development server
npm run dev

# Start with specific configuration
npm run dev -- --turbo
```

### Compile Smart Contracts (when implemented)

```bash
# Navigate to contracts directory
cd contracts

# Compile contracts
npx hardhat compile
```

### Run Local Blockchain (when implemented)

```bash
# Start local blockchain
npx hardhat node
```

### Deploy Smart Contracts to Local Network (when implemented)

```bash
# Deploy to local network
npx hardhat run scripts/deploy.ts --network localhost
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run frontend tests
npm run test:frontend

# Run backend tests (when implemented)
npm run test:backend

# Run contract tests (when implemented)
npm run test:contracts
```

### Run Linting

```bash
# Lint all code
npm run lint
```

## 📦 Project Structure

```
fixie-run/
├── app/                      # Next.js pages and routes
├── components/               # React components
├── lib/                      # Utility functions and helpers
├── public/                   # Static assets
├── styles/                   # CSS styles
├── contracts/                # Smart contracts (to be implemented)
├── backend/                  # Express API server (to be implemented)
├── analyzer/                 # Python fitness analyzer (to be implemented)
└── scripts/                  # Utility scripts
```

## 🏗️ Implementation Roadmap

### Phase 1: Frontend (Current)
- ✅ Web3Auth integration
- ✅ User profile interface
- ⬜ Activity dashboard
- ⬜ Wallet functionality
- ⬜ NFT display

### Phase 2: Backend
- ⬜ Express API setup
- ⬜ Database integration
- ⬜ Authentication middleware
- ⬜ Activity endpoints
- ⬜ WebSocket implementation

### Phase 3: Smart Contracts
- ⬜ $FIX token implementation
- ⬜ NFT bike contracts
- ⬜ Staking mechanism
- ⬜ Reward distribution
- ⬜ Activity verification

### Phase 4: Python Analyzer
- ⬜ Activity detection
- ⬜ Metrics calculation
- ⬜ Data visualization
- ⬜ Integration with backend

## 🚢 Deployment (Future)

### Deploy Smart Contracts

```bash
# Deploy to testnet
npx hardhat run scripts/deploy.ts --network polygonzkevmTestnet

# Deploy to mainnet
npx hardhat run scripts/deploy.ts --network polygonzkevmMainnet
```

### Deploy Backend

```bash
# Build the backend
npm run build:backend

# Start the production server
npm start:backend
```

### Deploy Frontend

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Using Docker (Future)

```bash
# Build and start all services
docker-compose up -d

# Build and start specific service
docker-compose up -d frontend
```

## 🔐 Security

- All private keys and sensitive information should be stored in environment variables
- Use `.env.local` for local development
- Never commit `.env` files or private keys to the repository

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Web3Auth Documentation](https://web3auth.io/docs)
- [Polygon zkEVM Documentation](https://zkevm.polygon.technology/docs)
- [Hardhat Documentation](https://hardhat.org/getting-started)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
