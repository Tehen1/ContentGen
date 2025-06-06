# FitApp zkEVM Dashboard

A decentralized fitness application built on Polygon zkEVM that rewards users with tokens for achieving fitness milestones. This project connects with Google Fit data and issues NFT achievements and HLTH tokens.

## Overview

FitApp uses blockchain technology to incentivize fitness activities through tokenized rewards. Users connect their Google Fit accounts, and the app tracks achievements such as step counts and calories burned, rewarding users with HLTH tokens and NFT badges.

### Key Features

- **Fitness Tracking**: Integration with Google Fit to track steps, calories, and other metrics
- **Token Rewards**: Earn HLTH tokens for reaching fitness goals
- **Achievement NFTs**: Collect NFT badges for fitness milestones
- **Leaderboards**: Compete with friends and the community

## Smart Contracts

The project includes three main smart contracts:

1. **HealthCoin.sol** - ERC20 token for fitness rewards
   - Standard ERC20 token with minting capabilities
   - Used to reward users for achieving fitness goals

2. **AchievementTracker.sol** - NFT contract for tracking achievements
   - ERC721 standard NFT implementation
   - Stores metadata for each achievement badge
   - Links achievements to user profiles

3. **ProfileManager.sol** - Contract for user profiles and fitness data
   - Manages user fitness data and profiles
   - Defines achievement criteria and tracks progress
   - Authorizes data providers for submitting fitness metrics
   - Handles token rewards and achievement issuance

## Setup and Installation

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Hardhat
- An Ethereum wallet with Polygon zkEVM testnet funds

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/FitApp-zkEVM-Dashboard.git
   cd FitApp-zkEVM-Dashboard
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PRIVATE_KEY=your_private_key
   POLYGONSCAN_API_KEY=your_polygonscan_api_key
   POLYGON_ZKEVM_RPC_URL=your_rpc_url
   INITIAL_OWNER=your_wallet_address
   ```

## Deployment

The project includes three scripts for deployment, verification, and initialization:

1. **deploy.ts** - Deploys the contracts to Polygon zkEVM
   ```
   npx hardhat run scripts/deploy.ts --network polygonZkEvm
   ```
   This script will:
   - Deploy HealthCoin, AchievementTracker, and ProfileManager contracts
   - Set up the initial configurations
   - Save deployment details to `deployed-contracts.json`

2. **verify.ts** - Verifies the contracts on Polygonscan
   ```
   npx hardhat run scripts/verify.ts --network polygonZkEvm
   ```
   This will verify all three contracts on Polygonscan's explorer, making the source code visible.

3. **setup.ts** - Initializes the system with sample achievements
   ```
   npx hardhat run scripts/setup.ts --network polygonZkEvm
   ```
   This sets up:
   - Step count achievements (10K, 50K, 100K, 1M)
   - Calorie burn achievements (5K, 20K, 50K)
   - Base URIs for achievement metadata
   - A test data provider account

## Next Steps: Frontend Development

The next phase of the project will focus on creating a user-friendly frontend:

1. **User Authentication**
   - Implement Web3 wallet connections (MetaMask, WalletConnect)
   - Set up Google OAuth for fitness data access

2. **Dashboard Features**
   - User profile display with fitness metrics
   - Achievement showcase with NFT gallery
   - Token balance and transaction history
   - Leaderboard with community rankings

3. **Google Fit Integration**
   - API integration for pulling fitness data
   - Regular synchronization of metrics
   - Data submission to the blockchain

4. **Mobile Responsiveness**
   - Ensure the dashboard works well on mobile devices
   - Consider PWA capabilities for better mobile experience

5. **Notifications**
   - Achievement alerts when milestones are reached
   - Token earning notifications
   - Challenges and community updates

### Proposed Tech Stack for Frontend

- **Framework**: React with Next.js
- **Styling**: Tailwind CSS
- **Web3 Integration**: ethers.js or viem/wagmi
- **State Management**: Redux Toolkit or Zustand
- **API Integration**: React Query

## License

This project is licensed under the MIT License - see the LICENSE file for details.
