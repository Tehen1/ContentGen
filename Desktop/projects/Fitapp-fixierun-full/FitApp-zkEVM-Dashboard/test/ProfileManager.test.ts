import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("ProfileManager", function () {
  // Fixture to deploy all contracts and set up their relationships
  async function deployProfileManagerFixture() {
    // Get signers
    const [owner, dataProvider, user1, user2] = await hre.ethers.getSigners();

    // Deploy HealthCoin
    const HealthCoin = await hre.ethers.getContractFactory("HealthCoin");
    const healthCoin = await HealthCoin.deploy(owner.address);

    // Deploy AchievementTracker
    const AchievementTracker = await hre.ethers.getContractFactory("AchievementTracker");
    const achievementTracker = await AchievementTracker.deploy(owner.address);

    // Deploy ProfileManager
    const ProfileManager = await hre.ethers.getContractFactory("ProfileManager");
    const profileManager = await ProfileManager.deploy(
      owner.address,
      healthCoin.target,
      achievementTracker.target
    );

    // Set up relationships
    await healthCoin.setMinter(profileManager.target);
    await achievementTracker.setAchievementIssuer(profileManager.target);

    // Set up achievement types and rewards
    await achievementTracker.setAchievementTypeBaseURI("steps", "https://fitapp.example/achievements/steps/");
    await achievementTracker.setAchievementTypeBaseURI("calories", "https://fitapp.example/achievements/calories/");

    return { 
      profileManager,
      healthCoin,
      achievementTracker,
      owner, 
      dataProvider, 
      user1, 
      user2
    };
  }

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { profileManager, owner } = await loadFixture(deployProfileManagerFixture);

      expect(await profileManager.owner()).to.equal(owner.address);
    });

    it("Should set the correct token contract", async function () {
      const { profileManager, healthCoin } = await loadFixture(deployProfileManagerFixture);

      expect(await profileManager.healthCoinContract()).to.equal(healthCoin.target);
    });

    it("Should set the correct achievement contract", async function () {
      const { profileManager, achievementTracker } = await loadFixture(deployProfileManagerFixture);

      expect(await profileManager.achievementTrackerContract()).to.equal(achievementTracker.target);
    });
  });

  describe("Data Provider Management", function () {
    it("Should allow owner to authorize data provider", async function () {
      const { profileManager, owner, dataProvider } = await loadFixture(deployProfileManagerFixture);

      await profileManager.connect(owner).authorizeDataProvider(dataProvider.address);
      const isAuthorized = await profileManager.isAuthorizedDataProvider(dataProvider.address);
      expect(isAuthorized).to.be.true;
    });

    it("Should emit DataProviderAuthorized event", async function () {
      const { profileManager, owner, dataProvider } = await loadFixture(deployProfileManagerFixture);

      await expect(profileManager.connect(owner).authorizeDataProvider(dataProvider.address))
        .to.emit(profileManager, "DataProviderAuthorized")
        .withArgs(dataProvider.address);
    });

    it("Should allow owner to revoke data provider", async function () {
      const { profileManager, owner, dataProvider } = await loadFixture(deployProfileManagerFixture);

      await profileManager.connect(owner).authorizeDataProvider(dataProvider.address);
      await profileManager.connect(owner).revokeDataProvider(dataProvider.address);
      const isAuthorized = await profileManager.isAuthorizedDataProvider(dataProvider.address);
      expect(isAuthorized).to.be.false;
    });

    it("Should emit DataProviderRevoked event", async function () {
      const { profileManager, owner, dataProvider } = await loadFixture(deployProfileManagerFixture);

      await profileManager.connect(owner).authorizeDataProvider(dataProvider.address);
      await expect(profileManager.connect(owner).revokeDataProvider(dataProvider.address))
        .to.emit(profileManager, "DataProviderRevoked")
        .withArgs(dataProvider.address);
    });

    it("Should not allow non-owner to authorize data provider", async function () {
      const { profileManager, dataProvider, user1 } = await loadFixture(deployProfileManagerFixture);

      await expect(profileManager.connect(user1).authorizeDataProvider(dataProvider.address))
        .to.be.revertedWithCustomError(profileManager, "OwnableUnauthorizedAccount")
        .withArgs(user1.address);
    });
  });

  describe("Profile Management", function () {
    it("Should allow user to create profile", async function () {
      const { profileManager, user1 } = await loadFixture(deployProfileManagerFixture);

      const displayName = "FitUser1";
      await profileManager.connect(user1).createProfile(displayName);

      const profile = await profileManager.getUserProfile(user1.address);
      expect(profile.displayName).to.equal(displayName);
      expect(profile.exists).to.be.true;
    });

    it("Should emit ProfileCreated event", async function () {
      const { profileManager, user1 } = await loadFixture(deployProfileManagerFixture);

      const displayName = "FitUser1";
      await expect(profileManager.connect(user1).createProfile(displayName))
        .to.emit(profileManager, "ProfileCreated")
        .withArgs(user1.address, displayName);
    });

    it("Should allow user to update profile", async function () {
      const { profileManager, user1 } = await loadFixture(deployProfileManagerFixture);

      // Create profile
      await profileManager.connect(user1).createProfile("FitUser1");

      // Update profile
      const newDisplayName = "SuperFitUser1";
      await profileManager.connect(user1).updateProfile(newDisplayName);

      // Verify update
      const profile = await profileManager.getUserProfile(user1.address);
      expect(profile.displayName).to.equal(newDisplayName);
    });

    it("Should emit ProfileUpdated event", async function () {
      const { profileManager, user1 } = await loadFixture(deployProfileManagerFixture);

      // Create profile
      await profileManager.connect(user1).createProfile("FitUser1");

      // Update profile and check event
      const newDisplayName = "SuperFitUser1";
      await expect(profileManager.connect(user1).updateProfile(newDisplayName))
        .to.emit(profileManager, "ProfileUpdated")
        .withArgs(user1.address, newDisplayName);
    });

    it("Should not allow user to update non-existent profile", async function () {
      const { profileManager, user1 } = await loadFixture(deployProfileManagerFixture);

      // Try to update non-existent profile
      await expect(profileManager.connect(user1).updateProfile("NewName"))
        .to.be.revertedWith("Profile does not exist");
    });
  });

  describe("Achievement Definition", function () {
    it("Should allow owner to define achievement", async function () {
      const { profileManager, owner } = await loadFixture(deployProfileManagerFixture);

      const achievementType = "steps";
      const achievementId = "10000_steps";
      const threshold = 10000;
      const reward = hre.ethers.parseEther("50");

      await profileManager.connect(owner).defineAchievement(
        achievementType,
        achievementId,
        threshold,
        reward
      );

      const achievement = await profileManager.getAchievementDefinition(achievementType, achievementId);
      expect(achievement.threshold).to.equal(threshold);
      expect(achievement.reward).to.equal(reward);
      expect(achievement.exists).to.be.true;
    });

    it("Should emit AchievementDefined event", async function () {
      const { profileManager, owner } = await loadFixture(deployProfileManagerFixture);

      const achievementType = "steps";
      const achievementId = "10000_steps";
      const threshold = 10000;
      const reward = hre.ethers.parseEther("50");

      await expect(profileManager.connect(owner).defineAchievement(
        achievementType,
        achievementId,
        threshold,
        reward
      ))
        .to.emit(profileManager, "AchievementDefined")
        .withArgs(achievementType, achievementId, threshold, reward);
    });

    it("Should not allow non-owner to define achievement", async function () {
      const { profileManager, user1 } = await loadFixture(deployProfileManagerFixture);

      const achievementType = "steps";
      const achievementId = "10000_steps";
      const threshold = 10000;
      const reward = hre.ethers.parseEther("50");

      await expect(profileManager.connect(user1).defineAchievement(
        achievementType,
        achievementId,
        threshold,
        reward
      ))
        .to.be.revertedWithCustomError(profileManager, "OwnableUnauthorizedAccount")
        .withArgs(user1.address);
    });
  });

  describe("Fitness Data Synchronization", function () {
    it("Should allow data provider to sync fitness data", async function () {
      const { profileManager, owner, dataProvider, user1 } = await loadFixture(deployProfileManagerFixture);

      // Create profile first
      await profileManager.connect(user1).createProfile("FitUser1");

      // Authorize data provider
      await profileManager.connect(owner).authorizeDataProvider(dataProvider.address);

      // Sync steps data
      const dataType = "steps";
      const value = 5000;
      const timestamp = await time.latest();

      await profileManager.connect(dataProvider).syncFitnessData(
        user1.address,
        dataType,
        value,
        timestamp
      );

      // Verify data was stored
      const userData = await profileManager.getUserFitnessData(user1.address, dataType);
      expect(userData.value).to.equal(value);
      expect(userData.timestamp).to.equal(timestamp);
    });

    it("Should emit FitnessDataSynced event", async function () {
      const { profileManager, owner, dataProvider, user1 } = await loadFixture(deployProfileManagerFixture);

      // Create profile first
      await profileManager.connect(user1).createProfile("FitUser1");

      // Authorize data provider
      await profileManager.connect(owner).authorizeDataProvider(dataProvider.address);

      // Sync steps data
      const dataType = "steps";
      const value = 5000;
      const timestamp = await time.latest();

      await expect(profileManager.connect(dataProvider).syncFitnessData(
        user1.address,
        dataType,
        value,
        timestamp
      ))
        .to.emit(profileManager, "FitnessDataSynced")
        .withArgs(user1.address, dataType, value, timestamp);
    });

    it("Should not allow unauthorized provider to sync fitness data", async function () {
      const { profileManager, user1, user2 } = await loadFixture(deployProfileManagerFixture);

      // Create profile first
      await profileManager.connect(user1).createProfile("FitUser1");

      // Try to sync data from unauthorized provider
      const dataType = "steps";
      const value = 5000;
      const timestamp = await time.latest();

      await expect(profileManager.connect(user2).syncFitnessData(
        user1.address,
        dataType,
        value,
        timestamp
      ))
        .to.be.revertedWith("Not an authorized data provider");
    });

    it("Should not sync data for non-existent profile", async function () {
      const { profileManager, owner, dataProvider, user1 } = await loadFixture(deployProfileManagerFixture);

      // Authorize data provider
      await profileManager.connect(owner).authorizeDataProvider(dataProvider.address);

      // Try to sync data for non-existent profile
      const dataType = "steps";
      const value = 5000;
      const timestamp = await time.latest();

      await expect(profileManager.connect(dataProvider).syncFitnessData(
        user1.address,
        dataType,
        value,
        timestamp
      ))
        .to.be.revertedWith("Profile does not exist");
    });
  });

  describe("Achievement Detection and Rewards", function () {
    it("Should detect achievements and issue rewards when data is synced", async function () {
      const { profileManager, healthCoin, achievementTracker, owner, dataProvider, user1 } = await loadFixture(deployProfileManagerFixture);

      // Create profile
      await profileManager.connect(user1).createProfile("FitUser1");

      // Define achievement
      const achievementType = "steps";
      const achievementId = "10000_steps";
      const threshold = 10000;
      const reward = hre.ethers.parseEther("50");
      await profileManager.connect(owner).defineAchievement(
        achievementType,
        achievementId,
        threshold,
        reward
      );

      // Authorize data provider
      await profileManager.connect(owner).authorizeDataProvider(dataProvider.address);

      // Sync data that exceeds threshold
      const value = 15000; // > threshold
      const timestamp = await time.latest();
      await profileManager.connect(dataProvider).syncFitnessData(
        user1.address,
        achievementType,
        value,
        timestamp
      );

      // Verify achievement was issued
      const achievementIds = await achievementTracker.getUserAchievements(user1.address);
      expect(achievementIds.length).to.equal(1);

      // Verify reward tokens were minted
      const balance = await healthCoin.balanceOf(user1.address);
      expect(balance).to.equal(reward);
    });

    it("Should emit AchievementUnlocked event", async function () {
      const { profileManager, owner, dataProvider, user1 } = await loadFixture(deployProfileManagerFixture);

      // Create profile
      await profileManager.connect(user1).createProfile("FitUser1");

      // Define achievement
      const achievementType = "steps";
      const achievementId = "10000_steps";
      const threshold = 10000;
      const reward = hre.ethers.parseEther("50");
      await profileManager.connect(owner).defineAchievement(
        achievementType,
        achievementId,
        threshold,
        reward
      );

      // Authorize data provider
      await profileManager.connect(owner).authorizeDataProvider(dataProvider.address);

      // Sync data that exceeds threshold and check event
      const value = 15000; // > threshold
      const timestamp = await time.latest();
      await expect(profileManager.connect(dataProvider).syncFitnessData(
        user1.address,
        achievementType,
        value,
        timestamp
      ))
        .to.emit(profileManager, "AchievementUnlocked")
        .withArgs(user1.address, achievementType, achievementId);
    });

    it("Should not issue the same achievement twice", async function () {
      const { profileManager, healthCoin, owner, dataProvider, user1 } = await loadFixture(deployProfileManagerFixture);

      // Create profile
      await profileManager.connect(user1).createProfile("FitUser1");

      // Define achievement
      const achievementType = "steps";
      const achievementId = "10000_steps";
      const threshold = 10000;
      const reward = hre.ethers.parseEther("50");
      await profileManager.connect(owner).defineAchievement(
        achievementType,
        achievementId,
        threshold,
        reward
      );

      // Authorize data provider
      await profileManager.connect(owner).authorizeDataProvider(dataProvider.address);

      // Sync data that exceeds threshold
      const value = 15000; // > threshold
      const timestamp = await time.latest();
      await profileManager.connect(dataProvider).syncFitnessData(
        user1.address,
        achievementType,
        value,
        timestamp
      );

      // Initial balance after first achievement
      const initialBalance = await healthCoin.balanceOf(user1.address);
      expect(initialBalance).to.equal(reward);

      // Sync data again with higher value
      const newValue = 20000;
      const newTimestamp = await time.latest();
      await profileManager.connect(dataProvider).syncFitnessData(
        user1.address,
        achievementType,
        newValue,
        newTimestamp
      );

      // Balance should not change as achievement was already unlocked
      const newBalance = await healthCoin.balanceOf(user1.address);
      expect(newBalance).to.equal(initialBalance);
    });

    it("Should unlock multiple different achievements", async function () {
      const { profileManager, healthCoin, achievementTracker, owner, dataProvider, user1 } = await loadFixture(deployProfileManagerFixture);

      // Create profile
      await profileManager.connect(user1).createProfile("FitUser1");

      // Define achievements
      const stepsType = "steps";
      const stepsId = "10000_steps";
      const stepsThreshold = 10000;
      const stepsReward = hre.ethers.parseEther("50");

      const caloriesType = "calories";
      const caloriesId = "5000_calories";
      const caloriesThreshold = 5000;
      const caloriesReward = hre.ethers.parseEther("30");

      await profileManager.connect(owner).defineAchievement(
        stepsType,
        stepsId,
        stepsThreshold,
        stepsReward
      );

      await profileManager.connect(owner).defineAchievement(
        caloriesType,
        caloriesId,
        caloriesThreshold,
        caloriesReward
      );

      // Authorize data provider
      await profileManager.connect(owner).authorizeDataProvider(dataProvider.address);

      // Sync steps data
      const stepsValue = 15000;
      const stepsTimestamp = await time.latest();
      await profileManager.connect(dataProvider).syncFitnessData(
        user1.address,
        stepsType,
        stepsValue,
        stepsTimestamp
      );

      // Sync calories data
      const caloriesValue = 6000;
      const caloriesTimestamp = await time.latest();
      await profileManager.connect(dataProvider).syncFitnessData(
        user1.address,
        caloriesType,
        caloriesValue,
        caloriesTimestamp
      );

      // Verify achievements were issued
      const achievementIds = await achievementTracker.getUserAchievements(user1.address);
      expect(achievementIds.length).to.equal(2);

      // Verify reward tokens were minted
      const balance = await healthCoin.balanceOf(user1.address);
      expect(balance).to.equal(stepsReward + caloriesReward);
    });
  });

  describe("Token Claiming", function () {
    it("Should allow users to claim rewards for specific activities", async function () {
      const { profileManager, healthCoin, owner, dataProvider, user1 } = await loadFixture(deployProfileManagerFixture);

      // Create profile
      await profileManager.connect(user1).createProfile("FitUser1");

      // Set up a claimable reward
      const activityType = "workout";
      const reward = hre.ethers.parseEther("10");
      await profileManager.connect(owner).setActivityReward(activityType, reward);

      // Authorize data provider
      await profileManager.connect(owner).authorizeDataProvider(dataProvider.address);

      // Provider verifies activity completion
      const activityId = "workout_session_123";
      const timestamp = await time.latest();
      await profileManager.connect(dataProvider).verifyActivity(
        user1.address,
        activityType,
        activityId,
        timestamp
      );

      // User claims reward
      await profileManager.connect(user1).claimActivityReward(activityType, activityId);

      // Verify tokens were received
      const balance = await healthCoin.balanceOf(user1.address);
      expect(balance).to.equal(reward);
    });

    it("Should emit RewardClaimed event", async function () {
      const { profileManager, owner, dataProvider, user1 } = await loadFixture(deployProfileManagerFixture);

      // Create profile
      await profileManager.connect(user1).createProfile("FitUser1");

      // Set up a claimable reward
      const activityType = "workout";
      const reward = hre.ethers.parseEther("10");
      await profileManager.connect(owner).setActivityReward(activityType, reward);

      // Authorize data provider
      await profileManager.connect(owner).authorizeDataProvider(dataProvider.address);

      // Provider verifies activity completion
      const activityId = "workout_session_123";
      const timestamp = await time.latest();
      await profileManager.connect(dataProvider).verifyActivity(
        user1.address,
        activityType,
        activityId,
        timestamp
      );

      // User claims reward and check event
      await expect(profileManager.connect(user1).claimActivityReward(activityType, activityId))
        .to.emit(profileManager, "RewardClaimed")
        .withArgs(user1.address, activityType, activityId, reward);
    });

    it("Should not allow claiming the same reward twice", async function () {
      const { profileManager, owner, dataProvider, user1 } = await loadFixture(deployProfileManagerFixture);

      // Create profile
      await profileManager.connect(user1).createProfile("FitUser1");

      // Set up a claimable reward
      const activityType = "workout";
      const reward = hre.ethers.parseEther("10");
      await profileManager.connect(owner).setActivityReward(activityType, reward);

      // Authorize data provider
      await profileManager.connect(owner).authorizeDataProvider(dataProvider.address);

      // Provider verifies activity completion
      const activityId = "workout_session_123";
      const timestamp = await time.latest();
      await profileManager.connect(dataProvider).verifyActivity(
        user1.address,
        activityType,
        activityId,
        timestamp
      );

      // User claims reward
      await profileManager.connect(user1).claimActivityReward(activityType, activityId);

      // Try to claim again
      await expect(profileManager.connect(user1).claimActivityReward(activityType, activityId))
        .to.be.revertedWith("Reward already claimed");
    });
  });

  describe("User Achievement Queries", function () {
    it("Should allow querying achievements by user", async function () {
      const { profileManager, owner, dataProvider, user1 } = await loadFixture(deployProfileManagerFixture);

      // Create profile
      await profileManager.connect(user1).createProfile("FitUser1");

      // Define multiple achievements
      const stepsType = "steps";
      const steps10kId = "10000_steps";
      const steps10kThreshold = 10000;
      const steps10kReward = hre.ethers.parseEther("50");

      const steps20kId = "20000_steps";
      const steps20kThreshold = 20000;
      const steps20kReward = hre.ethers.parseEther("100");

      await profileManager.connect(owner).defineAchievement(stepsType, steps10kId, steps10kThreshold, steps10kReward);
      await profileManager.connect(owner).defineAchievement(stepsType, steps20kId, steps20kThreshold, steps20kReward);

      // Authorize data provider
      await profileManager.connect(owner).authorizeDataProvider(dataProvider.address);

      // Sync data to unlock one achievement
      const stepsValue = 15000;
      const timestamp = await time.latest();
      await profileManager.connect(dataProvider).syncFitnessData(
        user1.address,
        stepsType,
        stepsValue,
        timestamp
      );

      // Query user's unlocked achievements
      const unlockedAchievements = await profileManager.getUserUnlockedAchievements(user1.address);

      // Verify unlocked achievements
      expect(unlockedAchievements.length).to.equal(1);
      expect(unlockedAchievements[0].achievementType).to.equal(stepsType);
      expect(unlockedAchievements[0].achievementId).to.equal(steps10kId);

      // Query user's progress on all achievements
      const achievementProgress = await profileManager.getUserAchievementProgress(user1.address);

      // Verify progress data
      expect(achievementProgress.length).to.equal(2);
      
      // First achievement should be unlocked
      expect(achievementProgress[0].achievementType).to.equal(stepsType);
      expect(achievementProgress[0].achievementId).to.equal(steps10kId);
      expect(achievementProgress[0].unlocked).to.be.true;

      // Second achievement should be in progress
      expect(achievementProgress[1].achievementType).to.equal(stepsType);
      expect(achievementProgress[1].achievementId).to.equal(steps20kId);
      expect(achievementProgress[1].unlocked).to.be.false;
      expect(achievementProgress[1].progress).to.equal(stepsValue);
      expect(achievementProgress[1].threshold).to.equal(steps20kThreshold);
    });

    it("Should correctly track user stats over time", async function () {
      const { profileManager, owner, dataProvider, user1 } = await loadFixture(deployProfileManagerFixture);

      // Create profile
      await profileManager.connect(user1).createProfile("FitUser1");

      // Authorize data provider
      await profileManager.connect(owner).authorizeDataProvider(dataProvider.address);

      // Sync data multiple times to simulate activity over time
      const dataType = "steps";
      
      // Day 1: 5000 steps
      let value = 5000;
      let timestamp = await time.latest();
      await profileManager.connect(dataProvider).syncFitnessData(
        user1.address,
        dataType,
        value,
        timestamp
      );

      // Day 2: 7000 steps
      value = 7000;
      timestamp = await time.increase(86400); // Advance 1 day
      await profileManager.connect(dataProvider).syncFitnessData(
        user1.address,
        dataType,
        value,
        timestamp
      );

      // Day 3: 10000 steps
      value = 10000;
      timestamp = await time.increase(86400); // Advance 1 day
      await profileManager.connect(dataProvider).syncFitnessData(
        user1.address,
        dataType,
        value,
        timestamp
      );

      // Query user's stats history
      const stats = await profileManager.getUserStatsHistory(user1.address, dataType);
      
      // Verify stats history
      expect(stats.length).to.equal(3);
      expect(stats[0].value).to.equal(5000);
      expect(stats[1].value).to.equal(7000);
      expect(stats[2].value).to.equal(10000);
    });
  });
});
