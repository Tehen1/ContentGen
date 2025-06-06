import { ethers } from "hardhat";
import { Contract } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Starting deployment to Polygon zkEVM Testnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy HealthCoin
  console.log("\nDeploying HealthCoin token...");
  const HealthCoin = await ethers.getContractFactory("HealthCoin");
  const healthCoin = await HealthCoin.deploy(deployer.address);
  await healthCoin.waitForDeployment();
  const healthCoinAddress = await healthCoin.getAddress();
  console.log("HealthCoin deployed to:", healthCoinAddress);

  // Deploy AchievementTracker
  console.log("\nDeploying AchievementTracker NFT...");
  const AchievementTracker = await ethers.getContractFactory("AchievementTracker");
  const achievementTracker = await AchievementTracker.deploy(deployer.address);
  await achievementTracker.waitForDeployment();
  const achievementTrackerAddress = await achievementTracker.getAddress();
  console.log("AchievementTracker deployed to:", achievementTrackerAddress);

  // Deploy ProfileManager with references to other contracts
  console.log("\nDeploying ProfileManager...");
  const ProfileManager = await ethers.getContractFactory("ProfileManager");
  const profileManager = await ProfileManager.deploy(
    healthCoinAddress,
    achievementTrackerAddress,
    deployer.address
  );
  await profileManager.waitForDeployment();
  const profileManagerAddress = await profileManager.getAddress();
  console.log("ProfileManager deployed to:", profileManagerAddress);

  // Set up contract permissions
  console.log("\nSetting up contract permissions...");

  // Set ProfileManager as the minter for HealthCoin
  const setMinterTx = await healthCoin.setMinter(profileManagerAddress);
  await setMinterTx.wait();
  console.log("ProfileManager set as minter for HealthCoin");

  // Set ProfileManager as the achievement issuer for AchievementTracker
  const setIssuerTx = await achievementTracker.setAchievementIssuer(profileManagerAddress);
  await setIssuerTx.wait();
  console.log("ProfileManager set as achievement issuer for AchievementTracker");

  // Display summary of all deployments
  console.log("\n--- Deployment Summary ---");
  console.log("HealthCoin (HLTH):", healthCoinAddress);
  console.log("AchievementTracker (FIT NFT):", achievementTrackerAddress);
  console.log("ProfileManager:", profileManagerAddress);
  console.log("Deployment Successful! ✅");

  // Save the contract addresses to a file for future reference
  const fs = require("fs");
  const contractAddresses = {
    healthCoin: healthCoinAddress,
    achievementTracker: achievementTrackerAddress,
    profileManager: profileManagerAddress,
    network: process.env.HARDHAT_NETWORK || "zkEVMTestnet",
    deployer: deployer.address,
    deploymentDate: new Date().toISOString()
  };

  fs.writeFileSync(
    "deployed-contracts.json",
    JSON.stringify(contractAddresses, null, 2)
  );
  console.log("Contract addresses saved to deployed-contracts.json");
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

