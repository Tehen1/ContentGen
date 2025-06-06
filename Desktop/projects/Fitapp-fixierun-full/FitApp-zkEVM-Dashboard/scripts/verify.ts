import { run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Starting contract verification on Polygonscan...");

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
    profileManager,
    deployer
  } = deployedContracts;

  console.log("Network:", deployedContracts.network);
  console.log("Deployed on:", deployedContracts.deploymentDate);

  try {
    // Verify HealthCoin
    console.log("\nVerifying HealthCoin at", healthCoin);
    await run("verify:verify", {
      address: healthCoin,
      constructorArguments: [deployer],
      contract: "contracts/HealthCoin.sol:HealthCoin"
    });
    console.log("HealthCoin verification complete ✅");
  } catch (error) {
    console.error("Error verifying HealthCoin:", error);
  }

  try {
    // Verify AchievementTracker
    console.log("\nVerifying AchievementTracker at", achievementTracker);
    await run("verify:verify", {
      address: achievementTracker,
      constructorArguments: [deployer],
      contract: "contracts/AchievementTracker.sol:AchievementTracker"
    });
    console.log("AchievementTracker verification complete ✅");
  } catch (error) {
    console.error("Error verifying AchievementTracker:", error);
  }

  try {
    // Verify ProfileManager
    console.log("\nVerifying ProfileManager at", profileManager);
    await run("verify:verify", {
      address: profileManager,
      constructorArguments: [
        healthCoin,
        achievementTracker,
        deployer
      ],
      contract: "contracts/ProfileManager.sol:ProfileManager"
    });
    console.log("ProfileManager verification complete ✅");
  } catch (error) {
    console.error("Error verifying ProfileManager:", error);
  }

  console.log("\nContract verification process completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

