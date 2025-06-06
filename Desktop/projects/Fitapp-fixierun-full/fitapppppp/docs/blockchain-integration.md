# FIXIE Blockchain Integration

**Dernière mise à jour : 2025-05-02**

## Overview

FIXIE integrates blockchain technology to create a tokenized fitness ecosystem, where physical activities are rewarded with $FIXIE tokens. This document outlines the blockchain architecture, token economics, and integration points with the rest of the application.

## Technology Stack

- **Blockchain**: Ethereum Layer 2 (zkEVM)
- **Smart Contracts**: Solidity 0.8.x
- **Libraries**: OpenZeppelin for standard contracts
- **Frontend Integration**: ethers.js, wagmi, RainbowKit
- **Backend Integration**: ethers.js for server-side operations

## $FIXIE Token

### Token Standard
$FIXIE is an ERC-20 token with the following characteristics:
- 18 decimal places
- Maximum supply: 100,000,000 tokens
- Mintable: Yes (only by authorized services)
- Burnable: Yes
- Pausable: Yes (for emergency situations)

### Token Contract
The main token contract is located at `blockchain/contracts/FixieToken.sol`.

### Token Economics

**Earning Mechanisms**:
- Physical activity (primary source)
- Completing challenges
- Participation in competitions
- Streak bonuses
- Referral rewards

**Rewards Formula** (basic):
```
Base Reward = distance_in_km * 1 token
Activity Multiplier = {
  running: 1.5x,
  cycling: 1.2x,
  walking: 1.0x
}
Duration Bonus = activity > 30min ? 1.2x : 1.0x
Streak Bonus = streak_weeks * 0.05 (capped at 0.25)

Total Reward = Base Reward * Activity Multiplier * Duration Bonus * (1 + Streak Bonus)
```

**Tokenomics Distribution**:
- 70% - User rewards
- 10% - Development fund
- 10% - Marketing and partnerships
- 5% - Liquidity pool
- 5% - Community treasury

## NFT Components

### Achievement Badges
NFT badges are awarded for specific fitness achievements:
- Distance milestones (e.g., 100km running badge)
- Completion of special challenges
- Participation in events
- Ranking achievements

### Virtual Items
NFT virtual items provide in-app benefits:
- Special shoes (boost running rewards)
- Virtual equipment (boost specific activities)
- Special accessories (unique visual elements)

### NFT Standards
All NFTs use the ERC-721 standard with metadata extensions.

## Integration Architecture

### Backend to Blockchain
The Rewards Service is the primary integration point between the application and blockchain:

1. User completes an activity
2. Activity Tracking Service records the activity
3. Rewards Service calculates token rewards
4. Rewards Service calls the FixieToken contract to mint tokens
5. Transaction is submitted to the blockchain
6. Transaction receipt is stored in the database
7. User is notified of rewards

### Security Considerations
- Backend uses a dedicated wallet with MINTER_ROLE
- Private keys are stored in secure environment variables
- Gas costs are optimized through batching where possible
- Layer 2 solution reduces transaction costs

### Transaction Processing
- Asynchronous transaction processing
- Retry mechanism for failed transactions
- Gas price strategy for timely confirmations

## Wallet Integration

### User Wallet Connection
- Support for multiple wallet providers (MetaMask, WalletConnect, etc.)
- Simplified onboarding for non-crypto users
- Custodial option for beginners

### In-App Wallet Features
- View $FIXIE balance
- View NFT collection
- Transfer tokens and NFTs
- Connect to external wallets

## Testing Framework

### Contract Testing
- Unit tests using Hardhat
- Integration tests with local blockchain
- Slither for security analysis

### End-to-End Testing
- Simulated user activities generating tokens
- Marketplace transactions
- NFT minting and transfers

## Deployment Process

### Testnet Deployment
Before mainnet deployment, all contracts are tested on:
1. Local development network
2. zkEVM testnet

### Mainnet Deployment
Deployment process:
1. Security audit
2. Multi-sig deployment
3. Contract verification
4. Initial configuration
5. Admin role distribution

## Gas Fee Management

To ensure a good user experience:
- Gas fees for rewards are covered by the platform
- Users pay gas fees for marketplace actions
- Batch processing for efficiency
- Layer 2 solution for reduced costs

## Future Blockchain Roadmap

Planned future developments:
- Cross-chain integrations
- DEX listing
- Governance features
- Enhanced NFT utility
- Partner integrations
