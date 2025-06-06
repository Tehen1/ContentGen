import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";

dotenv.config();

// Get environment variables or use defaults
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xYOUR_PRIVATE_KEY";
const POLYGONZKEVM_RPC_URL = process.env.POLYGONZKEVM_RPC_URL || "https://rpc.public.zkevm-test.net";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1442, // Match the zkEVM testnet chainId for local testing
    },
    polygonZkEVMTestnet: {
      url: POLYGONZKEVM_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 1442,
      gasPrice: 'auto',
      verify: {
        etherscan: {
          apiUrl: "https://api-testnet-zkevm.polygonscan.com",
          apiKey: ETHERSCAN_API_KEY,
          browserURL: "https://testnet-zkevm.polygonscan.com",
        },
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  etherscan: {
    apiKey: {
      polygonZkEVMTestnet: ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "polygonZkEVMTestnet",
        chainId: 1442,
        urls: {
          apiURL: "https://api-testnet-zkevm.polygonscan.com/api",
          browserURL: "https://testnet-zkevm.polygonscan.com",
        },
      },
    ],
  },
  mocha: {
    timeout: 40000,
  },
};

export default config;

