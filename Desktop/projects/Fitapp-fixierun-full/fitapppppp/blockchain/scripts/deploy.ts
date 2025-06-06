import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Déploiement des contrats FixieRun...");

  // Récupérer les comptes
  const [deployer] = await ethers.getSigners();
  console.log(`Déploiement avec le compte: ${deployer.address}`);
  console.log(`Solde du compte: ${ethers.utils.formatEther(await deployer.getBalance())} ETH\n`);

  // Déployer le contrat FixieToken
  console.log("Déploiement du contrat FixieToken...");
  const initialSupply = ethers.utils.parseEther("10000000"); // 10 millions de tokens
  const FixieToken = await ethers.getContractFactory("FixieToken");
  const token = await FixieToken.deploy(initialSupply, deployer.address);
  await token.deployed();
  console.log(`FixieToken déployé à l'adresse: ${token.address}`);

  // Déployer le contrat FixieNFT
  console.log("Déploiement du contrat FixieNFT...");
  const FixieNFT = await ethers.getContractFactory("FixieNFT");
  const nft = await FixieNFT.deploy(deployer.address);
  await nft.deployed();
  console.log(`FixieNFT déployé à l'adresse: ${nft.address}`);

  // Sauvegarder les ABI et adresses pour le frontend
  saveContractData("FixieToken", token.address, JSON.parse(JSON.stringify(FixieToken.interface.format())));
  saveContractData("FixieNFT", nft.address, JSON.parse(JSON.stringify(FixieNFT.interface.format())));

  // Vérifier les détails du token
  const tokenName = await token.name();
  const tokenSymbol = await token.symbol();
  const tokenTotalSupply = await token.totalSupply();
  console.log(`\nDétails du token:`);
  console.log(`Nom: ${tokenName}`);
  console.log(`Symbole: ${tokenSymbol}`);
  console.log(`Offre totale: ${ethers.utils.formatEther(tokenTotalSupply)} ${tokenSymbol}`);

  // Vérifier les détails du NFT
  const nftName = await nft.name();
  const nftSymbol = await nft.symbol();
  console.log(`\nDétails du NFT:`);
  console.log(`Nom: ${nftName}`);
  console.log(`Symbole: ${nftSymbol}`);

  console.log("\nDéploiement terminé avec succès!\n");

  // Afficher les étapes suivantes
  console.log("Étapes suivantes:");
  console.log("1. Vérifier les contrats sur l'explorateur de blocs");
  console.log("2. Mettre à jour les variables d'environnement (.env) avec les nouvelles adresses");
  console.log("3. Exécuter le script de setup pour configurer les rôles et les permissions");
}

function saveContractData(contractName: string, address: string, abi: any) {
  // Créer le dossier 'deployments' s'il n'existe pas
  const deploymentsDir = path.join(__dirname, "../deployments");
  const frontendAbiDir = path.join(__dirname, "../../frontend/abi");
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  if (!fs.existsSync(frontendAbiDir)) {
    fs.mkdirSync(frontendAbiDir, { recursive: true });
  }

  // Sauvegarder les informations du contrat
  const network = process.env.HARDHAT_NETWORK || "localhost";
  const deploymentData = {
    network,
    address,
    abi,
    deployedAt: new Date().toISOString(),
  };

  // Sauvegarder dans le dossier deployments
  fs.writeFileSync(
    path.join(deploymentsDir, `${contractName}_${network}.json`),
    JSON.stringify(deploymentData, null, 2)
  );

  // Sauvegarder l'ABI pour le frontend
  fs.writeFileSync(
    path.join(frontendAbiDir, `${contractName}.json`),
    JSON.stringify(abi, null, 2)
  );

  console.log(`Données du contrat ${contractName} sauvegardées dans deployments/${contractName}_${network}.json`);
  console.log(`ABI du contrat ${contractName} sauvegardé dans frontend/abi/${contractName}.json`);
}

// Exécuter le script de déploiement
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });