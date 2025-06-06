const hre = require("hardhat");

async function main() {
  // Déploiement du token
  const FixieToken = await hre.ethers.getContractFactory("FixieToken");
  const fixieToken = await FixieToken.deploy();
  await fixieToken.deployed();
  console.log("FixieToken déployé à:", fixieToken.address);

  // Déploiement du contrat principal
  const FixieRun = await hre.ethers.getContractFactory("FixieRun");
  const fixieRun = await FixieRun.deploy(fixieToken.address);
  await fixieRun.deployed();
  console.log("FixieRun déployé à:", fixieRun.address);

  // Transfère des tokens au contrat pour les récompenses
  const transferAmount = hre.ethers.utils.parseUnits("1000000", 18); // 1 million de tokens
  await fixieToken.transfer(fixieRun.address, transferAmount);
  console.log("Transféré", hre.ethers.utils.formatUnits(transferAmount, 18), "tokens au contrat");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 