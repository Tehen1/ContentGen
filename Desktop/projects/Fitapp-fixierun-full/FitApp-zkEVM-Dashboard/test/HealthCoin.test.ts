import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("HealthCoin", function () {
  // Fixture to deploy the HealthCoin contract
  async function deployHealthCoinFixture() {
    // Get signers
    const [owner, minter, user1, user2] = await hre.ethers.getSigners();

    // Deploy HealthCoin contract
    const HealthCoin = await hre.ethers.getContractFactory("HealthCoin");
    const healthCoin = await HealthCoin.deploy(owner.address);

    return { healthCoin, owner, minter, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set the correct token name and symbol", async function () {
      const { healthCoin } = await loadFixture(deployHealthCoinFixture);

      expect(await healthCoin.name()).to.equal("HealthCoin");
      expect(await healthCoin.symbol()).to.equal("HLTH");
    });

    it("Should set the correct owner", async function () {
      const { healthCoin, owner } = await loadFixture(deployHealthCoinFixture);

      expect(await healthCoin.owner()).to.equal(owner.address);
    });

    it("Should have 18 decimals", async function () {
      const { healthCoin } = await loadFixture(deployHealthCoinFixture);

      expect(await healthCoin.decimals()).to.equal(18);
    });

    it("Should start with no minter set", async function () {
      const { healthCoin } = await loadFixture(deployHealthCoinFixture);

      expect(await healthCoin.minter()).to.equal("0x0000000000000000000000000000000000000000");
    });
  });

  describe("Minter Management", function () {
    it("Should allow owner to set minter", async function () {
      const { healthCoin, owner, minter } = await loadFixture(deployHealthCoinFixture);

      await healthCoin.connect(owner).setMinter(minter.address);
      expect(await healthCoin.minter()).to.equal(minter.address);
    });

    it("Should emit MinterUpdated event when minter is set", async function () {
      const { healthCoin, owner, minter } = await loadFixture(deployHealthCoinFixture);

      const oldMinter = await healthCoin.minter();
      await expect(healthCoin.connect(owner).setMinter(minter.address))
        .to.emit(healthCoin, "MinterUpdated")
        .withArgs(oldMinter, minter.address);
    });

    it("Should not allow non-owner to set minter", async function () {
      const { healthCoin, minter, user1 } = await loadFixture(deployHealthCoinFixture);

      await expect(healthCoin.connect(user1).setMinter(minter.address))
        .to.be.revertedWithCustomError(healthCoin, "OwnableUnauthorizedAccount")
        .withArgs(user1.address);
    });
  });

  describe("Token Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      const { healthCoin, owner, minter, user1 } = await loadFixture(deployHealthCoinFixture);

      // Set minter
      await healthCoin.connect(owner).setMinter(minter.address);

      // Mint tokens
      const mintAmount = hre.ethers.parseEther("100");
      await healthCoin.connect(minter).mintReward(user1.address, mintAmount, "Steps");

      // Check user balance
      expect(await healthCoin.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should emit RewardMinted event when tokens are minted", async function () {
      const { healthCoin, owner, minter, user1 } = await loadFixture(deployHealthCoinFixture);

      // Set minter
      await healthCoin.connect(owner).setMinter(minter.address);

      // Mint tokens and check event
      const mintAmount = hre.ethers.parseEther("100");
      await expect(healthCoin.connect(minter).mintReward(user1.address, mintAmount, "Steps"))
        .to.emit(healthCoin, "RewardMinted")
        .withArgs(user1.address, mintAmount, "Steps");
    });

    it("Should not allow non-minter to mint tokens", async function () {
      const { healthCoin, owner, minter, user1 } = await loadFixture(deployHealthCoinFixture);

      // Set minter
      await healthCoin.connect(owner).setMinter(minter.address);

      // Try to mint tokens from non-minter account
      const mintAmount = hre.ethers.parseEther("100");
      await expect(healthCoin.connect(user1).mintReward(user1.address, mintAmount, "Steps"))
        .to.be.revertedWith("Only minter can mint rewards");
    });
  });

  describe("Token Burning", function () {
    it("Should allow token holder to burn their tokens", async function () {
      const { healthCoin, owner, minter, user1 } = await loadFixture(deployHealthCoinFixture);

      // Set minter and mint tokens to user
      await healthCoin.connect(owner).setMinter(minter.address);
      const mintAmount = hre.ethers.parseEther("100");
      await healthCoin.connect(minter).mintReward(user1.address, mintAmount, "Steps");

      // Burn tokens
      const burnAmount = hre.ethers.parseEther("50");
      await healthCoin.connect(user1).burn(burnAmount);

      // Check user balance after burning
      expect(await healthCoin.balanceOf(user1.address)).to.equal(mintAmount - burnAmount);
    });

    it("Should not allow burning more tokens than balance", async function () {
      const { healthCoin, owner, minter, user1 } = await loadFixture(deployHealthCoinFixture);

      // Set minter and mint tokens to user
      await healthCoin.connect(owner).setMinter(minter.address);
      const mintAmount = hre.ethers.parseEther("100");
      await healthCoin.connect(minter).mintReward(user1.address, mintAmount, "Steps");

      // Try to burn more tokens than balance
      const burnAmount = hre.ethers.parseEther("150");
      await expect(healthCoin.connect(user1).burn(burnAmount))
        .to.be.revertedWithCustomError(healthCoin, "ERC20InsufficientBalance");
    });
  });

  describe("Token Transfers", function () {
    it("Should allow token holders to transfer tokens", async function () {
      const { healthCoin, owner, minter, user1, user2 } = await loadFixture(deployHealthCoinFixture);

      // Set minter and mint tokens to user1
      await healthCoin.connect(owner).setMinter(minter.address);
      const mintAmount = hre.ethers.parseEther("100");
      await healthCoin.connect(minter).mintReward(user1.address, mintAmount, "Steps");

      // Transfer tokens from user1 to user2
      const transferAmount = hre.ethers.parseEther("30");
      await healthCoin.connect(user1).transfer(user2.address, transferAmount);

      // Check balances
      expect(await healthCoin.balanceOf(user1.address)).to.equal(mintAmount - transferAmount);
      expect(await healthCoin.balanceOf(user2.address)).to.equal(transferAmount);
    });

    it("Should not allow transferring more tokens than balance", async function () {
      const { healthCoin, owner, minter, user1, user2 } = await loadFixture(deployHealthCoinFixture);

      // Set minter and mint tokens to user1
      await healthCoin.connect(owner).setMinter(minter.address);
      const mintAmount = hre.ethers.parseEther("100");
      await healthCoin.connect(minter).mintReward(user1.address, mintAmount, "Steps");

      // Try to transfer more tokens than balance
      const transferAmount = hre.ethers.parseEther("150");
      await expect(healthCoin.connect(user1).transfer(user2.address, transferAmount))
        .to.be.revertedWithCustomError(healthCoin, "ERC20InsufficientBalance");
    });
  });
});

