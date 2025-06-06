import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// Achievement definitions
const stepAchievements = [
  {
    id: "step_1",
    type: "steps",
    threshold: 10000,  // 10K steps
    tokenReward: ethers.parseEther("5"),
    metadataURI: "ipfs://bafybeihd6kefjsdfs39d9f9a8sd0f9asd0f9a8sd0f/10k-steps.json",
    name: "10K Steps Badge"
  },
  {
    id: "step_2",
    type: "steps",
    threshold: 50000,  // 50K steps
    tokenReward: ethers.parseEther("25"),
    metadataURI: "ipfs://bafybeihd6kefjsdfs39d9f9a8sd0f9asd0f9a8sd0f/50k-steps.json",
    name: "50K Steps Badge"
  },
  {
    id: "step_3",
    type: "steps",
    threshold: 100000,  // 100K steps
    tokenReward: ethers.parseEther("50"),
    metadataURI: "ipfs://bafybeihd6kefjsdfs39d9f9a8sd0f9asd0f9a8sd0f/100k-steps.json",
    name: "100K Steps Badge"
  },
  {
    id: "step_4",
    type: "steps",
    threshold: 1000000,  // 1M steps
    tokenReward: ethers.parseEther("500"),
    metadataURI: "ipfs://bafybeihd6kefjsdfs39d9f9a8sd0f9asd0f9a8sd0f/1m-steps.json",
    name: "Million Stepper Badge"
  }
];

const calorieAchievements = [
  {
    id: "calorie_1",
    type: "calories",
    threshold: 5000,  // 5K calories
    tokenReward: ethers.parseEther("10"),
    metadataURI: "ipfs://bafybeihd6kefjsdfs39d9f9a8sd0f9asd0f9a8sd0f/5k-calories.json",
    name: "5K Calories Badge"
  },
  {
    id: "calorie_2",
    type: "calories",
    threshold: 20000,  // 20K calories
    tokenReward: ethers.parseEther("40"),
    metadataURI: "ipfs://bafybeihd6kefjsdfs39d9f9a8sd0f9asd0f9a8sd0f/20k-calories.json",
    name: "20K Calories Badge"
  },
  {
    id: "calorie_3",
    type: "calories",
    threshold: 50000,  // 50K calories
    tokenReward: ethers.parseEther("100"),
    metadataURI: "ipfs://bafybeihd6kefjsdfs39d9f9a8sd0f9asd0f9a8sd0f/50k-calories.json",
    name: "50K Calories Badge"
  }
];

// Achievement base URIs
const achievementBaseURIs = [
  {
    type: "steps",
    baseURI: "ipfs://bafybeihd6kefjsdfs39d9f9a8sd0f9asd0f9a8sd0f/steps/"
  },
  {
    type: "calories",
    baseURI: "ipfs://bafybeihd6kefjsdfs39d9f9a8sd0f9asd0f9a8sd0f/calories/"
  }
];

async function main() {
  console.log("Starting system initialization with sample achievement definitions...");

  // Read deployed contract addresses
  let deployedContracts;
  try {
    const filePath = path.join(process.cwd(), "deployed-contracts.json");
    const fileData = fs.readFileSync(filePath, "utf8");
    deployedContracts = JSON.parse(fileData);
  } catch (error) {
    console.error("Error reading deployed-contracts.json file:", error);
    process.exit(1);
  }

  const {
    healthCoin,
    achievementTracker,
    profileManager
  } = deployedContracts;

  console.log("Network:", deployedContracts.network);

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);

  // Connect to the contracts
  const profileManagerContract = await ethers.getContractAt("ProfileManager", profileManager, signer);
  const achievementTrackerContract = await ethers.getContractAt("AchievementTracker", achievementTracker, signer);

  // Set achievement base URIs
  console.log("\nSetting achievement base URIs...");
  for (const uri of achievementBaseURIs) {
    const tx = await achievementTrackerContract.setAchievementBaseURI(uri.type, uri.baseURI);
    await tx.wait();
    console.log(`Set base URI for ${uri.type}: ${uri.baseURI}`);
  }

  // Define step achievements
  console.log("\nDefining step achievements...");
  for (const achievement of stepAchievements) {
    const tx = await profileManagerContract.defineAchievement(
      achievement.id,
      achievement.type,
      achievement.threshold,
      achievement.tokenReward,
      achievement.metadataURI,
      true // isActive
    );
    await tx.wait();
    console.log(`Defined ${achievement.name} (${achievement.id}): ${achievement.threshold} steps = ${ethers.formatEther(achievement.tokenReward)} HLTH`);
  }

  // Define calorie achievements
  console.log("\nDefining calorie achievements...");
  for (const achievement of calorieAchievements) {
    const tx = await profileManagerContract.defineAchievement(
      achievement.id,
      achievement.type,
      achievement.threshold,
      achievement.tokenReward,
      achievement.metadataURI,
      true // isActive
    );
    await tx.wait();
    console.log(`Defined ${achievement.name} (${achievement.id}): ${achievement.threshold} calories = ${ethers.formatEther(achievement.tokenReward)} HLTH`);
  }

  // Set up a sample data provider for testing
  console.log("\nAuthorizing sample data provider...");
  const dataProviderTx = await profileManagerContract.setDataProviderAuthorization(
    signer.address, // For demo purposes, authorize the deployer as a data provider
    true
  );
  await dataProviderTx.wait();
  console.log(`Authorized ${signer.address} as a data provider`);

  console.log("\nSystem initialization completed successfully! ✅");
  console.log("\nSummary:");
  console.log(`- Set up ${stepAchievements.length} step achievements`);
  console.log(`- Set up ${calorieAchievements.length} calorie achievements`);
  console.log(`- Total achievement types: ${achievementBaseURIs.length}`);
  console.log(`- Authorized data providers: 1`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

