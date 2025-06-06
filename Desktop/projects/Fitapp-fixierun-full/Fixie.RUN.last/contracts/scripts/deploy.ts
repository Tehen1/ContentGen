import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Fixie.RUN contracts...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  // Initial values
  const initialSupply = 10_000_000; // 10 million tokens
  const maxSupply = 100_000_000; // 100 million tokens
  const baseURI = "https://api.fixierun.com/metadata/bikes/";
  const rewardRate = ethers.parseEther("10"); // 10 tokens per block

  // Deploy FixieToken
  console.log("Deploying FixieToken...");
  const FixieToken = await ethers.getContractFactory("FixieToken");
  const fixieToken = await FixieToken.deploy(
    initialSupply,
    maxSupply,
    deployer.address
  );
  await fixieToken.waitForDeployment();
  console.log(`FixieToken deployed to: ${await fixieToken.getAddress()}`);

  // Deploy BikeNFT
  console.log("Deploying BikeNFT...");
  const BikeNFT = await ethers.getContractFactory("BikeNFT");
  const bikeNFT = await BikeNFT.deploy(
    baseURI,
    deployer.address
  );
  await bikeNFT.waitForDeployment();
  console.log(`BikeNFT deployed to: ${await bikeNFT.getAddress()}`);

  // Deploy Staking contract
  console.log("Deploying Staking...");
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(
    await fixieToken.getAddress(),
    rewardRate,
    deployer.address
  );
  await staking.waitForDeployment();
  console.log(`Staking deployed to: ${await staking.getAddress()}`);

  // Deploy ActivityVerifier contract
  console.log("Deploying ActivityVerifier...");
  const ActivityVerifier = await ethers.getContractFactory("ActivityVerifier");
  const activityVerifier = await ActivityVerifier.deploy(
    await fixieToken.getAddress(),
    await bikeNFT.getAddress(),
    deployer.address
  );
  await activityVerifier.waitForDeployment();
  console.log(`ActivityVerifier deployed to: ${await activityVerifier.getAddress()}`);

  // Set up contract connections
  console.log("Setting up contract connections...");

  // Set reward distributor on token
  const setRewardDistributorTx = await fixieToken.setRewardDistributor(
    await activityVerifier.getAddress()
  );
  await setRewardDistributorTx.wait();
  console.log("Set ActivityVerifier as reward distributor for FixieToken");

  // Add updater to BikeNFT
  const addUpdaterTx = await bikeNFT.addUpdater(
    await activityVerifier.getAddress()
  );
  await addUpdaterTx.wait();
  console.log("Added ActivityVerifier as updater for BikeNFT");

  console.log("Deployment complete!");
  console.log({
    fixieToken: await fixieToken.getAddress(),
    bikeNFT: await bikeNFT.getAddress(),
    staking: await staking.getAddress(),
    activityVerifier: await activityVerifier.getAddress(),
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
