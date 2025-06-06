# FixieRun Smart Contract System Documentation

## Table of Contents
- [Overview](#overview)
- [Contract Architecture](#contract-architecture)
  - [FixieRun Contract](#fixierun-contract)
  - [FixieNFT Contract](#fixienft-contract)
  - [FixieToken Contract](#fixietoken-contract)
  - [Contract Interactions](#contract-interactions)
- [Google Health API Integration](#google-health-api-integration)
  - [Data Validation Workflow](#data-validation-workflow)
  - [Oracle Implementation](#oracle-implementation)
  - [Activity Verification](#activity-verification)
- [Frontend Integration with Viem](#frontend-integration-with-viem)
  - [Reading Contract Data](#reading-contract-data)
  - [Writing to Contracts](#writing-to-contracts)
  - [Event Handling](#event-handling)
- [Security Considerations](#security-considerations)
  - [Access Control](#access-control)
  - [Input Validation](#input-validation)
  - [Oracle Security](#oracle-security)
  - [Economic Security](#economic-security)
- [Deployment Process](#deployment-process)
  - [Preparation](#preparation)
  - [Deployment Steps](#deployment-steps)
  - [Post-Deployment Setup](#post-deployment-setup)
- [Future Improvements](#future-improvements)
  - [Technical Improvements](#technical-improvements)
  - [Feature Enhancements](#feature-enhancements)
  - [Business Model Evolution](#business-model-evolution)

## Overview

The FixieRun smart contract system is a decentralized application (dApp) designed to incentivize physical activity, specifically cycling, by rewarding users with tokens. The system incorporates NFT technology to represent bikes, implements activity tracking with oracle validation, and features a token economy to reward users for their physical activity.

Key features of the FixieRun contract system:

- **Activity Tracking**: Records cycling activities with distance, duration, and calories burned
- **NFT Bikes**: Each bike is represented as an NFT with properties affecting rewards
- **Oracle Validation**: Third-party verification of activity data
- **Token Rewards**: ERC20 tokens awarded for validated activities
- **Streak Bonuses**: Increased rewards for consistent activity
- **Admin Controls**: System parameters can be adjusted by administrators

The system is designed to integrate with fitness tracking applications, specifically the Google Health/Fit API, to validate activity data before rewarding users.

## Contract Architecture

The FixieRun smart contract system consists of three main contracts:

### FixieRun Contract

The primary contract that coordinates activity tracking, bike management, and reward calculations.

**Key Functions:**
- `recordRide`: Records new cycling activities
- `validateActivity`: Oracle validates activities for authenticity
- `registerBike`: Creates a new bike NFT and registers it in the system
- `claimRewards`: Allows users to claim tokens for validated activities

**State Variables:**
- Activity data structures
- Bike registrations and status
- Reward parameters and system settings

### FixieNFT Contract

An ERC721 contract that manages the NFTs representing bikes and other equipment.

**Key Functions:**
- `safeMint`: Creates new NFTs with specific metadata
- `upgradeRewardBoost`: Increases the rewards boost of an NFT
- `upgradeLevel`: Increases the level of an NFT
- `getTotalRewardBoost`: Calculates the total boost for a user

**NFT Properties:**
- Rarity levels (1-5)
- Reward boosts (0-100%)
- Equipment types (shoes, badge, collectible, equipment)
- Upgradability status

### FixieToken Contract

An ERC20 contract that manages the token economy and reward distribution.

**Key Functions:**
- `recordActivity`: Records activity and mints tokens as rewards
- `calculateTokenReward`: Determines token amount based on activity metrics
- `calculateStreakBonus`: Provides additional rewards for consistent activity

**Token Features:**
- Fixed maximum supply (100 million tokens)
- Activity-based minting
- Streak bonuses
- Different reward multipliers based on activity type

### Contract Interactions

The contracts interact in the following ways:

1. **Activity Lifecycle**:
   - User records an activity through `FixieRun.recordRide()`
   - Oracle validates the activity via `FixieRun.validateActivity()`
   - User claims rewards through `FixieRun.claimRewards()`
   - FixieRun calls `FixieToken.recordActivity()` to distribute tokens

2. **Bike Management**:
   - User registers a bike via `FixieRun.registerBike()`
   - FixieRun calls `FixieNFT.safeMint()` to create the NFT
   - FixieRun tracks bike usage and applies efficiency factors to rewards

3. **Reward Calculation**:
   - FixieRun calculates base rewards based on distance and activity
   - FixieRun queries `FixieNFT.getTotalRewardBoost()` to apply NFT bonuses
   - FixieToken applies additional bonuses for streaks and activity types

```
[User] --Records Activity--> [FixieRun] 
       <--Validates Activity-- [Oracle]
       --Bike Registration--> [FixieNFT]
       --Claims Rewards-----> [FixieToken]
```

## Google Health API Integration

The integration between FixieRun smart contracts and Google Health API requires a secure middleware layer to validate fitness data before submitting it to the blockchain.

### Data Validation Workflow

1. **Data Collection**:
   - User completes a cycling activity tracked by a mobile app
   - App retrieves activity data from Google Health API
   - Data includes: distance, duration, calories, timestamps, route

2. **Backend Processing**:
   - Data is sent to a secure backend service
   - Backend verifies data authenticity using Google Health API credentials
   - Additional anti-fraud checks are performed (e.g., speed consistency, GPS validation)

3. **Blockchain Submission**:
   - Backend (with Oracle role) submits activity data to the FixieRun contract
   - Smart contract records the activity pending validation
   - Oracle validates the activity after secondary verification

### Oracle Implementation

The Oracle should be implemented as a secure, automated system that:

1. Receives activity data from the Google Health API integration
2. Performs additional verification checks
3. Submits validation transactions to the blockchain

**Example Oracle Architecture:**

```javascript
// Pseudocode for Oracle implementation
async function processActivityValidation(activityData, userId) {
  // 1. Verify Google Health API signature
  const isSignatureValid = await verifyGoogleHealthSignature(activityData);
  if (!isSignatureValid) return false;
  
  // 2. Perform anti-fraud checks
  const fraudChecks = [
    checkSpeedConsistency(activityData),
    checkCalorieCalculation(activityData),
    checkLocationBoundaries(activityData),
    checkTimeConsistency(activityData)
  ];
  
  if (!fraudChecks.every(check => check === true)) return false;
  
  // 3. Submit validation transaction
  const userAddress = await getUserEthAddress(userId);
  const activityIndex = await getActivityIndex(userAddress, activityData.timestamp);
  
  return await submitValidation(userAddress, activityIndex);
}
```

### Activity Verification

To ensure data integrity, implement these verification methods:

1. **Speed Consistency**: Check that the reported speed is physiologically possible and consistent throughout the activity
2. **Calorie Calculation**: Verify calories burned align with distance, duration, and user metrics
3. **Location Verification**: Ensure GPS points form a realistic route without teleportation
4. **Timestamp Integrity**: Confirm timestamps progress logically and match the activity duration

Example validation function:

```javascript
function verifyActivityData(activity) {
  // Speed verification (realistic cycling speeds are 10-40 km/h)
  const avgSpeedKmh = (activity.distance / 1000) / (activity.duration / 3600);
  if (avgSpeedKmh < 5 || avgSpeedKmh > 50) {
    console.log("Suspicious speed detected:", avgSpeedKmh, "km/h");
    return false;
  }
  
  // Calorie reasonability check (rough estimate)
  const expectedCalories = activity.duration / 60 * 10; // ~10 calories per minute
  const calorieVariance = Math.abs(activity.calories - expectedCalories) / expectedCalories;
  if (calorieVariance > 0.5) { // More than 50% difference
    console.log("Suspicious calorie burn:", activity.calories);
    return false;
  }
  
  return true;
}
```

## Frontend Integration with Viem

[Viem](https://viem.sh/) is a TypeScript interface for Ethereum that provides a modern alternative to ethers.js and web3.js. Here's how to integrate the FixieRun contracts with a frontend application using Viem.

### Reading Contract Data

```typescript
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { fixieRunABI } from './abis/fixieRunABI';

// Create a client
const client = createPublicClient({
  chain: mainnet,
  transport: http()
});

// Get user bikes
async function getUserBikes(userAddress) {
  const bikeCount = await client.readContract({
    address: '0xFixieRunContractAddress',
    abi: fixieRunABI,
    functionName: 'getBikeCount',
    args: [userAddress]
  });
  
  const bikes = [];
  for (let i = 0; i < bikeCount; i++) {
    const bike = await client.readContract({
      address: '0xFixieRunContractAddress',
      abi: fixieRunABI,
      functionName: 'getBikeDetails',
      args: [userAddress, i]
    });
    bikes.push(bike);
  }
  
  return bikes;
}

// Get user activities
async function getUserActivities(userAddress) {
  const activityCount = await client.readContract({
    address: '0xFixieRunContractAddress',
    abi: fixieRunABI,
    functionName: 'getActivityCount',
    args: [userAddress]
  });
  
  const activities = [];
  for (let i = 0; i < activityCount; i++) {
    const activity = await client.readContract({
      address: '0xFixieRunContractAddress',
      abi: fixieRunABI,
      functionName: 'getActivityDetails',
      args: [userAddress, i]
    });
    activities.push(activity);
  }
  
  return activities;
}
```

### Writing to Contracts

```typescript
import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';

// Create a wallet client (using window.ethereum provider)
const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
});

// Record a new ride
async function recordRide(distance, duration, calories) {
  const [address] = await walletClient.getAddresses();
  
  const hash = await walletClient.writeContract({
    address: '0xFixieRunContractAddress',
    abi: fixieRunABI,
    functionName: 'recordRide',
    args: [distance, duration, calories],
    account: address
  });
  
  return hash;
}

// Register a new bike
async function registerBike(model, efficiency) {
  const [address] = await walletClient.getAddresses();
  
  const hash = await walletClient.writeContract({
    address: '0xFixieRunContractAddress',
    abi: fixieRunABI,
    functionName: 'registerBike',
    args: [model, efficiency],
    account: address
  });
  
  return hash;
}

// Claim rewards
async function claimRewards() {
  const [address] = await walletClient.getAddresses();
  
  const hash = await walletClient.writeContract({
    address: '0xFixieRunContractAddress',
    abi: fixieRunABI,
    functionName: 'claimRewards',
    args: [],
    account: address
  });
  
  return hash;
}
```

### Event Handling

```typescript
import { createPublicClient, http, parseAbiItem } from 'viem';
import { mainnet } from 'viem/chains';

// Create a client
const client = createPublicClient({
  chain: mainnet,
  transport: http()
});

// Listen for activity recording events
async function watchActivityRecorded(userAddress, callback) {
  const unwatch = client.watchContractEvent({
    address: '0xFixieRunContractAddress',
    abi: fixieRunABI,
    eventName: 'ActivityRecorded',
    args: {
      user: userAddress
    },
    onLogs: logs => {
      callback(logs);
    }
  });
  
  return unwatch;
}

// Get historical activities
async function getHistoricalActivities(userAddress) {
  const logs = await client.getLogs({
    address: '0xFixieRunContractAddress',
    event: parseAbiItem('event ActivityRecorded(address indexed user, uint256 indexed activityIndex, uint256 distance, uint256 duration, string activityType)'),
    args: {
      user: userAddress
    },
    fromBlock: 0n
  });
  
  return logs;
}
```

## Security Considerations

### Access Control

The FixieRun contract system implements a robust access control system using OpenZeppelin's AccessControl:

1. **Role-Based Access**:
   - `DEFAULT_ADMIN_ROLE`: Can manage all roles and perform emergency functions
   - `ADMIN_ROLE`: Can update system parameters
   - `PAUSER_ROLE`: Can pause/unpause contract functionality
   - `ORACLE_ROLE`: Can validate activities

2. **Best Practices**:
   - Use multi-signature wallets for admin roles
   - Implement a tiered admin structure with different permissions
   - Regularly audit active roles and permissions
   - Consider implementing a timelock for parameter changes

### Input Validation

The contracts implement comprehensive input validation:

1. **Activity Data Validation**:
   - Minimum distance and duration requirements
   - Positive calorie values
   - Duplicate activity detection
   - Timestamp consistency checks

2. **Bike Parameters**:
   - Validated efficiency range (1-200%)
   - Non-empty model names
   - Proper rarity calculation

3. **Reward Calculation**:
   - Prevent integer overflow in calculations
   - Reasonable reward limits
   - Supply cap adherence

### Oracle Security

The Oracle system is a critical security component:

1. **Decentralized Oracles**:
   - Consider using multiple independent oracles for validation
   - Implement a threshold system requiring consensus
   - Rotate oracle keys regularly

2. **Data Verification**:
   - Implement multiple validation layers
   - Use cryptographic proofs where possible
   - Keep an audit trail of validations

3. **Time Constraints**:
   - Enforce validation time limits
   - Prevent backdated activity submissions
   - Rate limit submissions per user

### Economic Security

Considerations for the token economy:

1. **Reward Balancing**:
   - Carefully tune reward parameters to prevent inflation
   - Monitor for exploitation patterns
   - Implement adjustable parameters that can be updated
   - Consider capped rewards per time period

2. **Anti-Gaming Measures**:
   - Detection of unrealistic activity patterns
   - Geographic consistency checks
   - Physiological plausibility verification
   - Progressive difficulty for continuous rewards

## Deployment Process

### Preparation

Before deployment, several preparatory steps should be completed:

1. **Smart Contract Auditing**:
   - Conduct a thorough audit of all three contracts (FixieRun, FixieNFT, FixieToken)
   - Address any identified vulnerabilities or optimizations
   - Consider hiring a professional audit firm for critical review

2. **Test Environment Setup**:
   - Deploy and test on local networks (Hardhat, Ganache)
   - Test on testnets (Goerli, Sepolia, Mumbai)
   - Conduct extensive integration testing with frontend and backend

3. **Oracle Infrastructure**:
   - Set up the Oracle service infrastructure
   - Establish secure key management for Oracle services
   - Test Oracle validation processes thoroughly

4. **Parameter Configuration**:
   - Determine appropriate initial values for all system parameters:
     - Base reward rate
     - Streak multiplier
     - Minimum activity requirements
     - Validation time limits

5. **Documentation**:
   - Prepare user documentation
   - Create technical documentation for developers
   - Document deployment steps and post-deployment procedures

### Deployment Steps

Follow these steps to deploy the FixieRun contract system:

1. **Deploy FixieToken Contract**:
   ```bash
   npx hardhat run scripts/deploy-token.js --network <network>
   ```
   
   Record the deployed token address for the next steps.

2. **Deploy FixieNFT Contract**:
   ```bash
   npx hardhat run scripts/deploy-nft.js --network <network>
   ```
   
   Pass the admin address as a constructor argument.
   Record the deployed NFT address for the next steps.

3. **Deploy FixieRun Contract**:
   ```bash
   npx hardhat run scripts/deploy-fixierun.js --network <network>
   ```
   
   This is a proxy contract that will be initialized in the next step.

4. **Initialize FixieRun Contract**:
   ```bash
   npx hardhat run scripts/initialize-fixierun.js --network <network>
   ```
   
   This script should call the `initialize` function with:
   - FixieNFT contract address
   - FixieToken contract address
   - Admin address
   - Oracle address

5. **Verify Contracts on Block Explorer**:
   ```bash
   npx hardhat verify --network <network> <contract-address> <constructor-arguments>
   ```
   
   Verify all three contracts on the respective block explorer (e.g., Etherscan).

6. **Test Deployed Contracts**:
   - Register a test bike
   - Record a test activity
   - Validate the activity (using Oracle account)
   - Claim rewards

Example deployment script (`deploy-fixierun.js`):

```javascript
const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Deploying FixieRun contract...");

  // Deploy as upgradeable proxy
  const FixieRun = await ethers.getContractFactory("FixieRun");
  const fixieRun = await upgrades.deployProxy(FixieRun, [], { initializer: false });
  await fixieRun.deployed();

  console.log("FixieRun deployed to:", fixieRun.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### Post-Deployment Setup

After deploying the contracts, complete these setup steps:

1. **Role Configuration**:
   - Grant MINTER_ROLE on FixieToken to the FixieRun contract:
     ```javascript
     await tokenContract.grantRole(await tokenContract.MINTER_ROLE(), fixieRunAddress);
     ```
   - Grant MINTER_ROLE on FixieNFT to the FixieRun contract:
     ```javascript
     await nftContract.grantRole(await nftContract.MINTER_ROLE(), fixieRunAddress);
     ```
   - Add additional oracles as needed:
     ```javascript
     await fixieRunContract.addOracle(oracleAddress);
     ```

2. **Parameter Adjustments**:
   - Fine-tune initial parameters based on testnet results:
     ```javascript
     await fixieRunContract.updateBaseRewardRate(10);
     await fixieRunContract.updateStreakMultiplier(110);
     await fixieRunContract.updateValidationTimeLimit(259200); // 3 days in seconds
     ```

3. **Oracle Service Deployment**:
   - Deploy the Oracle service to a secure, reliable server
   - Configure the Oracle service with:
     - Contract addresses
     - Oracle private key (securely stored)
     - Google Health API credentials
     - Monitoring and alerting systems

4. **Frontend Integration**:
   - Update frontend applications with new contract addresses
   - Test the full user flow from activity tracking to reward claiming
   - Set up event listeners for real-time updates

5. **Monitoring Setup**:
   - Implement contract monitoring for suspicious activities
   - Set up alerts for important events (large claims, parameter changes)
   - Monitor gas usage and optimize as needed

Example Oracle setup script:

```javascript
// Oracle service setup
require('dotenv').config();
const { ethers } = require('ethers');
const fixieRunABI = require('./abis/FixieRun.json');

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const oracleWallet = new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY, provider);
const fixieRunContract = new ethers.Contract(
  process.env.FIXIERUN_ADDRESS,
  fixieRunABI,
  oracleWallet
);

// Setup periodic validation process
async function validatePendingActivities() {
  // Query from database or API for pending activities
  const pendingActivities = await getPendingActivitiesFromDB();
  
  for (const activity of pendingActivities) {
    try {
      // Validate the activity on-chain
      const tx = await fixieRunContract.validateActivity(
        activity.userAddress,
        activity.activityIndex
      );
      await tx.wait();
      console.log(`Validated activity ${activity.activityIndex} for user ${activity.userAddress}`);
      
      // Update the database
      await markActivityAsValidated(activity.id);
    } catch (error) {
      console.error(`Error validating activity ${activity.id}:`, error);
    }
  }
}

// Run validation every 15 minutes
setInterval(validatePendingActivities, 15 * 60 * 1000);
```

## Future Improvements

### Technical Improvements

1. **Layer 2 Integration**:
   - Migrate to Polygon, Arbitrum, or Optimism for lower gas fees
   - Implement cross-chain functionality to support multiple networks
   - Use zero-knowledge proofs for privacy-preserving activity validation

2. **Contract Optimizations**:
   - Implement gas optimizations for frequent operations
   - Batch processing for multiple activities
   - Storage optimization for activity data

3. **Oracle Enhancement**:
   - Implement a decentralized oracle network (e.g., Chainlink)
   - Develop a reputation system for oracle validators
   - Implement cryptographic proofs for activity verification

4. **Security Enhancements**:
   - Implement formal verification for core contract logic
   - Add emergency recovery mechanisms
   - Develop automated security monitoring

5. **Scalability Solutions**:
   - Implement sharding for user data
   - Use off-chain storage solutions for detailed activity data
   - Optimize for high user loads

### Feature Enhancements

1. **Expanded Activity Types**:
   - Support for running, walking, and other fitness activities
   - Indoor training modes (stationary bikes, treadmills)
   - Structured workout programs with progressive rewards

2. **Social and Community Features**:
   - Group rides and challenges
   - Competitive leaderboards with token prizes
   - Achievement badges as NFTs
   - Social sharing of activities and rewards

3. **Enhanced NFT Functionality**:
   - Bike part upgrades (frames, wheels, components)
   - Bike customization and visual representation
   - NFT marketplaces for trading bikes and equipment
   - Bike rental and lending system

4. **Advanced Rewards Mechanics**:
   - Dynamic rewards based on demand and participation
   - Time-limited special reward events
   - Reward multipliers for specific routes or challenges
   - Staking mechanisms for enhanced rewards

5. **User Experience Improvements**:
   - Mobile app integration with GPS tracking
   - Real-time reward notifications
   - Gamification elements (quests, daily challenges)
   - Simplified onboarding for non-crypto users

### Business Model Evolution

1. **Tokenomics Refinement**:
   - Token utility expansion beyond rewards
   - Governance mechanisms for community-driven parameters
   - Token staking for enhanced rewards
   - Partnership incentives using token allocations

2. **Partnership Ecosystem**:
   - Integration with existing fitness platforms
   - Partnerships with cycling brands for physical rewards
   - City partnerships for promoting eco-friendly transportation
   - Health insurance collaborations for premium discounts

3. **Sustainable Revenue Streams**:
   - Premium subscription tiers
   - NFT sales and marketplace fees
   - Sponsored challenges and events
   - Data insights (anonymized and aggregated)

4. **Geographic Expansion**:
   - Localized versions with regional features
   - City-specific challenges and rewards
   - Cultural adaptations for different markets
   - Local cryptocurrency compliance

5. **Environmental and Social Impact**:
   - Carbon offset integration
   - Charity ride features
   - Community improvement initiatives
   - Health and wellness program partnerships

## Conclusion

The FixieRun smart contract system represents a comprehensive solution for integrating blockchain technology with fitness tracking, specifically targeting cycling activities. By combining NFT technology for bike ownership, oracle-validated activity tracking, and token rewards, the system creates a powerful incentive mechanism for physical activity.

Key strengths of the implementation include:

1. **Modular Design**: The separation of concerns across three specialized contracts (FixieRun, FixieNFT, FixieToken) allows for cleaner code, better maintainability, and the potential for component-wise upgrades.

2. **Security Focus**: The implementation includes robust access control, input validation, anti-fraud measures, and security best practices to protect user assets and system integrity.

3. **Data Validation**: The oracle-based validation system ensures that only legitimate activities are rewarded, maintaining the economic balance of the token ecosystem.

4. **Upgradability**: The use of proxy patterns allows for future improvements without disrupting the user experience or requiring migration of assets.

5. **Extensibility**: The contract architecture supports future feature additions and integrations with minimal changes to the core functionality.

When implementing and extending this system, developers should focus on thorough testing, security best practices, and careful parameter tuning to create a balanced reward economy. The integration with Google Health API provides a reliable data source for activity validation, but implementers should be mindful of privacy considerations and data security requirements.

By following the guidance in this documentation, development teams can successfully deploy, configure, and extend the FixieRun contract system to create engaging fitness applications that leverage blockchain technology for user incentivization and reward distribution.

