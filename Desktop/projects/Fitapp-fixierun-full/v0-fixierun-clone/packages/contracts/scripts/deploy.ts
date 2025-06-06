import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

async function main() {
  console.log("🚀 Starting FixieRun deployment on Scroll...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deployment configuration
  const config = {
    userRewardsWallet: process.env.USER_REWARDS_WALLET || deployer.address,
    developmentWallet: process.env.DEVELOPMENT_WALLET || deployer.address,
    marketingWallet: process.env.MARKETING_WALLET || deployer.address,
    teamWallet: process.env.TEAM_WALLET || deployer.address,
    communityWallet: process.env.COMMUNITY_WALLET || deployer.address,
  };

  console.log("📋 Deployment Configuration:");
  console.log("- User Rewards Wallet:", config.userRewardsWallet);
  console.log("- Development Wallet:", config.developmentWallet);
  console.log("- Marketing Wallet:", config.marketingWallet);
  console.log("- Team Wallet:", config.teamWallet);
  console.log("- Community Wallet:", config.communityWallet);

  // Deploy FixieToken
  console.log("\n🪙 Deploying FixieToken...");
  const FixieToken = await ethers.getContractFactory("FixieToken");
  const fixieToken = await FixieToken.deploy(
    config.userRewardsWallet,
    config.developmentWallet,
    config.marketingWallet,
    config.teamWallet,
    config.communityWallet
  );
  await fixieToken.waitForDeployment();
  const fixieTokenAddress = await fixieToken.getAddress();
  console.log("✅ FixieToken deployed to:", fixieTokenAddress);

  // Deploy BikeNFT
  console.log("\n🚴 Deploying BikeNFT...");
  const BikeNFT = await ethers.getContractFactory("BikeNFT");
  const bikeNFT = await BikeNFT.deploy(fixieTokenAddress);
  await bikeNFT.waitForDeployment();
  const bikeNFTAddress = await bikeNFT.getAddress();
  console.log("✅ BikeNFT deployed to:", bikeNFTAddress);

  // Set up permissions
  console.log("\n🔐 Setting up permissions...");
  
  // Add BikeNFT contract as minter for FixieToken (for rewards)
  const addMinterTx = await fixieToken.addMinter(bikeNFTAddress);
  await addMinterTx.wait();
  console.log("✅ BikeNFT added as FixieToken minter");

  // Verify initial token distribution
  console.log("\n📊 Verifying token distribution...");
  const totalSupply = await fixieToken.totalSupply();
  const userRewardsBalance = await fixieToken.balanceOf(config.userRewardsWallet);
  const developmentBalance = await fixieToken.balanceOf(config.developmentWallet);
  
  console.log("- Total Supply:", ethers.formatEther(totalSupply), "FIXIE");
  console.log("- User Rewards Balance:", ethers.formatEther(userRewardsBalance), "FIXIE");
  console.log("- Development Balance:", ethers.formatEther(developmentBalance), "FIXIE");

  // Save deployment addresses
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      FixieToken: {
        address: fixieTokenAddress,
        constructorArgs: [
          config.userRewardsWallet,
          config.developmentWallet,
          config.marketingWallet,
          config.teamWallet,
          config.communityWallet,
        ],
      },
      BikeNFT: {
        address: bikeNFTAddress,
        constructorArgs: [fixieTokenAddress],
      },
    },
    wallets: config,
  };

  const deploymentPath = join(__dirname, "../deployments.json");
  writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", deploymentPath);

  // Update network configuration
  const networkConfigPath = join(__dirname, "../../web3-utils/src/utils/network.ts");
  const networkConfig = `import { NetworkConfig } from '@fixierun/types';

export const SCROLL_TESTNET_CONFIG: NetworkConfig = {
  chainId: 534351, // Scroll Sepolia Testnet
  name: 'Scroll Sepolia Testnet',
  rpcUrl: 'https://sepolia-rpc.scroll.io/',
  blockExplorer: 'https://sepolia.scrollscan.com',
  contracts: {
    fixieToken: '${fixieTokenAddress}',
    bikeNFT: '${bikeNFTAddress}',
    marketplace: '0x0000000000000000000000000000000000000000',
    staking: '0x0000000000000000000000000000000000000000',
    governance: '0x0000000000000000000000000000000000000000',
  },
};

export const SCROLL_MAINNET_CONFIG: NetworkConfig = {
  chainId: 534352, // Scroll Mainnet
  name: 'Scroll',
  rpcUrl: 'https://rpc.scroll.io/',
  blockExplorer: 'https://scrollscan.com',
  contracts: {
    fixieToken: '0x0000000000000000000000000000000000000000',
    bikeNFT: '0x0000000000000000000000000000000000000000',
    marketplace: '0x0000000000000000000000000000000000000000',
    staking: '0x0000000000000000000000000000000000000000',
    governance: '0x0000000000000000000000000000000000000000',
  },
};

export const getNetworkConfig = (chainId: number): NetworkConfig => {
  switch (chainId) {
    case 534351:
      return SCROLL_TESTNET_CONFIG;
    case 534352:
      return SCROLL_MAINNET_CONFIG;
    default:
      throw new Error(\`Unsupported network: \${chainId}\`);
  }
};

export const isScrollNetwork = (chainId: number): boolean => {
  return chainId === 534351 || chainId === 534352;
};`;

  writeFileSync(networkConfigPath, networkConfig);
  console.log("✅ Network configuration updated");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. Verify contracts on Scrollscan");
  console.log("2. Update frontend configuration");
  console.log("3. Test contract interactions");
  console.log("4. Set up monitoring and alerts");
  
  console.log("\n🔍 Verification commands:");
  console.log(`npx hardhat verify --network scrollTestnet ${fixieTokenAddress} "${config.userRewardsWallet}" "${config.developmentWallet}" "${config.marketingWallet}" "${config.teamWallet}" "${config.communityWallet}"`);
  console.log(`npx hardhat verify --network scrollTestnet ${bikeNFTAddress} "${fixieTokenAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });