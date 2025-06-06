const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FixieRun", function () {
  let FixieRun, fixieRun, FixieToken, fixieToken;
  let owner, user1, user2, oracle;

  beforeEach(async function () {
    [owner, user1, user2, oracle] = await ethers.getSigners();

    // Déployer le token
    FixieToken = await ethers.getContractFactory("FixieToken");
    fixieToken = await FixieToken.deploy();
    
    // Déployer le contrat principal
    FixieRun = await ethers.getContractFactory("FixieRun");
    fixieRun = await FixieRun.deploy(fixieToken.address);
    
    // Transférer des tokens au contrat
    const transferAmount = ethers.utils.parseUnits("1000000", 18);
    await fixieToken.transfer(fixieRun.address, transferAmount);
    
    // Déployer un oracle de test
    const TestOracle = await ethers.getContractFactory("TestOracle");
    oracle = await TestOracle.deploy();
  });

  it("devrait enregistrer une activité", async function () {
    // Enregistrer un vélo
    await fixieRun.connect(user1).registerBike(1, "VTT", 1000);
    
    // Enregistrer une activité
    await fixieRun.connect(user1).recordRide(10000, 3600, 500); // 10km, 1h, 500 calories
    
    // Vérifier que l'activité est enregistrée
    const activityCount = await fixieRun.getUserActivityCount(user1.address);
    expect(activityCount).to.equal(1);
  });

  it("devrait valider une activité avec l'oracle", async function () {
    // Enregistrer un vélo
    await fixieRun.connect(user1).registerBike(1, "VTT", 1000);
    
    // Enregistrer une activité
    await fixieRun.connect(user1).recordRide(10000, 3600, 500); // 10km, 1h, 500 calories
    
    // Mettre à jour l'oracle
    await fixieRun.connect(owner).setOracle(oracle.address);
    
    // Valider l'activité
    await oracle.validateActivity(user1.address, 0, "0x0", Math.floor(Date.now() / 1000));
    
    // Vérifier que l'activité est validée
    const activity = await fixieRun.getActivityInfo(user1.address, 0);
    expect(activity.validated).to.be.true;
    
    // Vérifier que les récompenses sont disponibles
    const rewards = await fixieRun.rewards(user1.address);
    expect(rewards).to.be.greaterThan(0);
  });

  it("devrait permettre de réclamer des récompenses", async function () {
    // Enregistrer un vélo
    await fixieRun.connect(user1).registerBike(1, "VTT", 1000);
    
    // Enregistrer une activité
    await fixieRun.connect(user1).recordRide(10000, 3600, 500);
    
    // Mettre à jour l'oracle
    await fixieRun.connect(owner).setOracle(oracle.address);
    
    // Valider l'activité
    await oracle.validateActivity(user1.address, 0, "0x0", Math.floor(Date.now() / 1000));
    
    // Vérifier le solde initial
    const initialBalance = await fixieToken.balanceOf(user1.address);
    
    // Réclamer les récompenses
    await fixieRun.connect(user1).claimRewards();
    
    // Vérifier le nouveau solde
    const finalBalance = await fixieToken.balanceOf(user1.address);
    expect(finalBalance).to.be.greaterThan(initialBalance);
  });

  it("devrait empêcher les utilisateurs blacklistés d'agir", async function () {
    // Blacklister l'utilisateur
    await fixieRun.connect(owner).blacklistUser(user1.address, true);
    
    // Tenter d'enregistrer un vélo - devrait échouer
    await expect(fixieRun.connect(user1).registerBike(1, "VTT", 1000))
      .to.be.revertedWith("Utilisateur blacklisté");
  });

  it("devrait avoir le bon taux de récompense", async function () {
    // Vérifier la valeur initiale
    expect(await fixieRun.rewardRate()).to.equal(100);
    
    // Mettre à jour le taux
    await fixieRun.connect(owner).setRewardRate(150);
    
    // Vérifier la nouvelle valeur
    expect(await fixieRun.rewardRate()).to.equal(150);
  });

  it("devrait vérifier les vélos actifs", async function () {
    // Enregistrer un vélo
    await fixieRun.connect(user1).registerBike(1, "VTT", 1000);
    
    // Vérifier qu'il y a un vélo actif
    expect(await fixieRun.hasActiveBike(user1.address)).to.be.true;
    
    // Désactiver le vélo
    await fixieRun.connect(user1).toggleBikeStatus(0);
    
    // Vérifier qu'il n'y a plus de vélo actif
    expect(await fixieRun.hasActiveBike(user1.address)).to.be.false;
  });
}); 