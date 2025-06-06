import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("AchievementTracker", function () {
  // Fixture to deploy the AchievementTracker contract
  async function deployAchievementTrackerFixture() {
    // Get signers
    const [owner, issuer, user1, user2] = await hre.ethers.getSigners();

    // Deploy AchievementTracker contract
    const AchievementTracker = await hre.ethers.getContractFactory("AchievementTracker");
    const achievementTracker = await AchievementTracker.deploy(owner.address);

    // Set some base achievement URIs for testing
    const stepsAchievementBaseURI = "https://fitapp.example/achievements/steps/";
    const caloriesAchievementBaseURI = "https://fitapp.example/achievements/calories/";

    return { 
      achievementTracker, 
      owner, 
      issuer, 
      user1, 
      user2, 
      stepsAchievementBaseURI, 
      caloriesAchievementBaseURI 
    };
  }

  describe("Deployment", function () {
    it("Should set the correct token name and symbol", async function () {
      const { achievementTracker } = await loadFixture(deployAchievementTrackerFixture);

      expect(await achievementTracker.name()).to.equal("HealthAchievements");
      expect(await achievementTracker.symbol()).to.equal("HLTHA");
    });

    it("Should set the correct owner", async function () {
      const { achievementTracker, owner } = await loadFixture(deployAchievementTrackerFixture);

      expect(await achievementTracker.owner()).to.equal(owner.address);
    });

    it("Should start with no achievement issuer set", async function () {
      const { achievementTracker } = await loadFixture(deployAchievementTrackerFixture);

      expect(await achievementTracker.achievementIssuer()).to.equal("0x0000000000000000000000000000000000000000");
    });
  });

  describe("Issuer Management", function () {
    it("Should allow owner to set achievement issuer", async function () {
      const { achievementTracker, owner, issuer } = await loadFixture(deployAchievementTrackerFixture);

      await achievementTracker.connect(owner).setAchievementIssuer(issuer.address);
      expect(await achievementTracker.achievementIssuer()).to.equal(issuer.address);
    });

    it("Should emit IssuerUpdated event when issuer is set", async function () {
      const { achievementTracker, owner, issuer } = await loadFixture(deployAchievementTrackerFixture);

      const oldIssuer = await achievementTracker.achievementIssuer();
      await expect(achievementTracker.connect(owner).setAchievementIssuer(issuer.address))
        .to.emit(achievementTracker, "IssuerUpdated")
        .withArgs(oldIssuer, issuer.address);
    });

    it("Should not allow non-owner to set achievement issuer", async function () {
      const { achievementTracker, issuer, user1 } = await loadFixture(deployAchievementTrackerFixture);

      await expect(achievementTracker.connect(user1).setAchievementIssuer(issuer.address))
        .to.be.revertedWithCustomError(achievementTracker, "OwnableUnauthorizedAccount")
        .withArgs(user1.address);
    });
  });

  describe("Achievement Type URI Management", function () {
    it("Should allow owner to set base URI for achievement type", async function () {
      const { achievementTracker, owner, stepsAchievementBaseURI } = await loadFixture(deployAchievementTrackerFixture);

      await achievementTracker.connect(owner).setAchievementTypeBaseURI("steps", stepsAchievementBaseURI);
      expect(await achievementTracker.getAchievementTypeBaseURI("steps")).to.equal(stepsAchievementBaseURI);
    });

    it("Should emit AchievementTypeBaseURIUpdated event when base URI is set", async function () {
      const { achievementTracker, owner, stepsAchievementBaseURI } = await loadFixture(deployAchievementTrackerFixture);

      await expect(achievementTracker.connect(owner).setAchievementTypeBaseURI("steps", stepsAchievementBaseURI))
        .to.emit(achievementTracker, "AchievementTypeBaseURIUpdated")
        .withArgs("steps", stepsAchievementBaseURI);
    });

    it("Should not allow non-owner to set achievement type base URI", async function () {
      const { achievementTracker, user1, stepsAchievementBaseURI } = await loadFixture(deployAchievementTrackerFixture);

      await expect(achievementTracker.connect(user1).setAchievementTypeBaseURI("steps", stepsAchievementBaseURI))
        .to.be.revertedWithCustomError(achievementTracker, "OwnableUnauthorizedAccount")
        .withArgs(user1.address);
    });
  });

  describe("Issuing Achievements", function () {
    it("Should allow issuer to issue achievements", async function () {
      const { achievementTracker, owner, issuer, user1, stepsAchievementBaseURI } = await loadFixture(deployAchievementTrackerFixture);

      // Set issuer and achievement type base URI
      await achievementTracker.connect(owner).setAchievementIssuer(issuer.address);
      await achievementTracker.connect(owner).setAchievementTypeBaseURI("steps", stepsAchievementBaseURI);

      // Issue achievement
      await achievementTracker.connect(issuer).issueAchievement(user1.address, "steps", "10000_steps");

      // Check that user has the achievement
      expect(await achievementTracker.balanceOf(user1.address)).to.equal(1);
      
      // Check achievement details (assuming getAchievementDetails returns achievementType)
      const tokenId = 1; // First token
      const achievementDetails = await achievementTracker.getAchievementDetails(tokenId);
      expect(achievementDetails.achievementType).to.equal("steps");
      expect(achievementDetails.metadata).to.equal("10000_steps");
    });

    it("Should emit AchievementIssued event when achievement is issued", async function () {
      const { achievementTracker, owner, issuer, user1, stepsAchievementBaseURI } = await loadFixture(deployAchievementTrackerFixture);

      // Set issuer and achievement type base URI
      await achievementTracker.connect(owner).setAchievementIssuer(issuer.address);
      await achievementTracker.connect(owner).setAchievementTypeBaseURI("steps", stepsAchievementBaseURI);

      // Check event emission
      await expect(achievementTracker.connect(issuer).issueAchievement(user1.address, "steps", "10000_steps"))
        .to.emit(achievementTracker, "AchievementIssued")
        .withArgs(user1.address, 1, "steps", "10000_steps"); // tokenId 1 is first token
    });

    it("Should not allow non-issuer to issue achievements", async function () {
      const { achievementTracker, owner, issuer, user1, user2, stepsAchievementBaseURI } = await loadFixture(deployAchievementTrackerFixture);

      // Set issuer and achievement type base URI
      await achievementTracker.connect(owner).setAchievementIssuer(issuer.address);
      await achievementTracker.connect(owner).setAchievementTypeBaseURI("steps", stepsAchievementBaseURI);

      // Try to issue achievement from non-issuer account
      await expect(achievementTracker.connect(user2).issueAchievement(user1.address, "steps", "10000_steps"))
        .to.be.revertedWith("Only issuer can create achievements");
    });
  });

  describe("Token URI Functionality", function () {
    it("Should return correct token URI", async function () {
      const { achievementTracker, owner, issuer, user1, stepsAchievementBaseURI } = await loadFixture(deployAchievementTrackerFixture);

      // Set issuer and achievement type base URI
      await achievementTracker.connect(owner).setAchievementIssuer(issuer.address);
      await achievementTracker.connect(owner).setAchievementTypeBaseURI("steps", stepsAchievementBaseURI);

      // Issue achievement
      await achievementTracker.connect(issuer).issueAchievement(user1.address, "steps", "10000_steps");

      // Check token URI
      const tokenId = 1; // First token
      const expectedURI = `${stepsAchievementBaseURI}10000_steps`;
      expect(await achievementTracker.tokenURI(tokenId)).to.equal(expectedURI);
    });

    it("Should revert when querying URI for non-existent token", async function () {
      const { achievementTracker } = await loadFixture(deployAchievementTrackerFixture);

      // Try to get URI for non-existent token
      const nonExistentTokenId = 999;
      await expect(achievementTracker.tokenURI(nonExistentTokenId))
        .to.be.revertedWithCustomError(achievementTracker, "ERC721NonexistentToken")
        .withArgs(nonExistentTokenId);
    });
  });

  describe("Achievement Enumeration", function () {
    it("Should correctly enumerate achievements for a user", async function () {
      const { achievementTracker, owner, issuer, user1, stepsAchievementBaseURI, caloriesAchievementBaseURI } = 
        await loadFixture(deployAchievementTrackerFixture);

      // Set issuer and achievement type base URIs
      await achievementTracker.connect(owner).setAchievementIssuer(issuer.address);
      await achievementTracker.connect(owner).setAchievementTypeBaseURI("steps", stepsAchievementBaseURI);
      await achievementTracker.connect(owner).setAchievementTypeBaseURI("calories", caloriesAchievementBaseURI);

      // Issue multiple achievements
      await achievementTracker.connect(issuer).issueAchievement(user1.address, "steps", "10000_steps");
      await achievementTracker.connect(issuer).issueAchievement(user1.address, "calories", "5000_calories");

      // Check user's balance
      expect(await achievementTracker.balanceOf(user1.address)).to.equal(2);

      // Check token IDs
      expect(await achievementTracker.tokenOfOwnerByIndex(user1.address, 0)).to.equal(1);
      expect(await achievementTracker.tokenOfOwnerByIndex(user1.address, 1)).to.equal(2);

      // Check total supply
      expect(await achievementTracker.totalSupply()).to.equal(2);
    });

    it("Should revert when index is out of bounds", async function () {
      const { achievementTracker, owner, issuer, user1, stepsAchievementBaseURI } = 
        await loadFixture(deployAchievementTrackerFixture);

      // Set issuer and achievement type base URI
      await achievementTracker.connect(owner).setAchievementIssuer(issuer.address);
      await achievementTracker.connect(owner).setAchievementTypeBaseURI("steps", stepsAchievementBaseURI);

      // Issue one achievement
      await achievementTracker.connect(issuer).issueAchievement(user1.address, "steps", "10000_steps");

      // Try to access out of bounds index
      await expect(achievementTracker.tokenOfOwnerByIndex(user1.address, 1))
        .to.be.revertedWithCustomError(achievementTracker, "ERC721OutOfBoundsIndex");
    });
  });

  describe("User Achievement Query", function () {
    it("Should return all achievement IDs for a user", async function () {
      const { achievementTracker, owner, issuer, user1, stepsAchievementBaseURI, caloriesAchievementBaseURI } = 
        await loadFixture(deployAchievementTrackerFixture);

      // Set issuer and achievement type base URIs
      await achievementTracker.connect(owner).setAchievementIssuer(issuer.address);
      await achievementTracker.connect(owner).setAchievementTypeBaseURI("steps", stepsAchievementBaseURI);
      await achievementTracker.connect(owner).setAchievementTypeBaseURI("calories", caloriesAchievementBaseURI);

      // Issue multiple achievements
      await achievementTracker.connect(issuer).issueAchievement(user1.address, "steps", "10000_steps");
      await achievementTracker.connect(issuer).issueAchievement(user1.address, "calories", "5000_calories");

      // Get all user's achievement IDs
      const achievementIds = await achievementTracker.getUserAchievements(user1.address);
      
      // Verify result
      expect(achievementIds.length).to.equal(2);
      expect(achievementIds[0]).to.equal(1);
      expect(achievementIds[1]).to.equal(2);
    });

    it("Should return empty array for user with no achievements", async function () {
      const { achievementTracker, user2 } = await loadFixture(deployAchievementTrackerFixture);

      // Get achievements for user with none
      const achievementIds = await achievementTracker.getUserAchievements(user2.address);
      
      // Verify empty result
      expect(achievementIds.length).to.equal(0);
    });
  });
});

