import { ethers, network } from "hardhat"
import fs from "fs"
import path from "path"

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log("Deploying contracts with the account:", deployer.address)

  // Deploy FixieToken
  const FixieToken = await ethers.getContractFactory("FixieToken")
  const fixieToken = await FixieToken.deploy()
  await fixieToken.deployed()
  console.log("FixieToken deployed to:", fixieToken.address)

  // Deploy PedalToken
  const PedalToken = await ethers.getContractFactory("PedalToken")
  const pedalToken = await PedalToken.deploy()
  await pedalToken.deployed()
  console.log("PedalToken deployed to:", pedalToken.address)

  // Deploy BikeNFT
  const BikeNFT = await ethers.getContractFactory("BikeNFT")
  const bikeNFT = await BikeNFT.deploy()
  await bikeNFT.deployed()
  console.log("BikeNFT deployed to:", bikeNFT.address)

  // Deploy Staking
  const Staking = await ethers.getContractFactory("Staking")
  const staking = await Staking.deploy(fixieToken.address, pedalToken.address)
  await staking.deployed()
  console.log("Staking deployed to:", staking.address)

  // Deploy ActivityVerifier
  const ActivityVerifier = await ethers.getContractFactory("ActivityVerifier")
  const activityVerifier = await ActivityVerifier.deploy(fixieToken.address, bikeNFT.address)
  await activityVerifier.deployed()
  console.log("ActivityVerifier deployed to:", activityVerifier.address)

  // Grant roles
  const minterRole = await fixieToken.MINTER_ROLE()
  await fixieToken.addMinter(activityVerifier.address)
  await fixieToken.addMinter(staking.address)
  console.log("Granted minter role to ActivityVerifier and Staking")

  // Save deployment addresses
  const deploymentData = {
    network: network.name,
    fixieToken: fixieToken.address,
    pedalToken: pedalToken.address,
    bikeNFT: bikeNFT.address,
    staking: staking.address,
    activityVerifier: activityVerifier.address,
    timestamp: new Date().toISOString(),
  }

  const deploymentsDir = path.join(__dirname, "../deployments")
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir)
  }

  fs.writeFileSync(path.join(deploymentsDir, `${network.name}.json`), JSON.stringify(deploymentData, null, 2))
  console.log("Deployment addresses saved to:", path.join(deploymentsDir, `${network.name}.json`))

  // Also save to frontend and backend env files
  const frontendEnvPath = path.join(__dirname, "../../frontend/.env.local")
  const backendEnvPath = path.join(__dirname, "../../backend/.env")

  const frontendEnv = `
NEXT_PUBLIC_FIXIE_TOKEN_ADDRESS=${fixieToken.address}
NEXT_PUBLIC_PEDAL_TOKEN_ADDRESS=${pedalToken.address}
NEXT_PUBLIC_BIKE_NFT_ADDRESS=${bikeNFT.address}
NEXT_PUBLIC_STAKING_ADDRESS=${staking.address}
NEXT_PUBLIC_ACTIVITY_VERIFIER_ADDRESS=${activityVerifier.address}
NEXT_PUBLIC_NETWORK_NAME=${network.name}
`

  const backendEnv = `
FIXIE_TOKEN_ADDRESS=${fixieToken.address}
PEDAL_TOKEN_ADDRESS=${pedalToken.address}
BIKE_NFT_ADDRESS=${bikeNFT.address}
STAKING_ADDRESS=${staking.address}
ACTIVITY_VERIFIER_ADDRESS=${activityVerifier.address}
NETWORK_NAME=${network.name}
`

  fs.appendFileSync(frontendEnvPath, frontendEnv)
  fs.appendFileSync(backendEnvPath, backendEnv)
  console.log("Environment variables updated")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
