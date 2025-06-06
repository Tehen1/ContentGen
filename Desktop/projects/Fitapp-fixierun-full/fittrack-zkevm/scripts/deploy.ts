import { ethers } from "hardhat";
import { Contract } from "ethers";
import fs from "fs";
import path from "path";

async function main() {
  try {
    console.log("Deploying FitTrackerStorage contract to Polygon zkEVM network...");
    
    // Get the network from Hardhat config
    const network = await ethers.provider.getNetwork();
    console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Check if we're on the Polygon zkEVM network
    if (network.chainId !== 1442n && process.env.FORCE_DEPLOY !== "true") {
      console.error("This script is intended to run on Polygon zkEVM Testnet (Chain ID: 1442)");
      console.error("Set FORCE_DEPLOY=true to override this check");
      return;
    }
    
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying with account: ${deployer.address}`);
    
    // Check deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Account balance: ${ethers.formatEther(balance)} MATIC`);
    
    if (balance === 0n) {
      console.error("Deployer account has no funds. Please fund the account before deployment.");
      return;
    }
    
    // Deploy the contract
    const FitTrackerStorage = await ethers.getContractFactory("FitTrackerStorage");
    const fitTrackerStorage = await FitTrackerStorage.deploy();
    
    // Wait for the contract to be deployed
    await fitTrackerStorage.waitForDeployment();
    const deployedAddress = await fitTrackerStorage.getAddress();
    
    console.log(`FitTrackerStorage deployed to: ${deployedAddress}`);
    
    // Save deployment info to a file
    const deploymentInfo = {
      network: network.name,
      chainId: Number(network.chainId),
      contractAddress: deployedAddress,
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
    };
    
    const deploymentDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(deploymentDir, `${network.name}.json`),
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("Deployment information saved to deployments directory");
    
    // Instructions for contract verification
    console.log("\nTo verify the contract on the Polygon zkEVM Explorer:");
    console.log(`npx hardhat verify --network zkevmTestnet ${deployedAddress}`);
    
    return deployedAddress;
  } catch (error) {
    console.error("Deployment failed");
    console.error(error);
    process.exit(1);
  }
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

