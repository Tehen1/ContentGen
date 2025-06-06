import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import * as dotenv from "dotenv";

dotenv.config();

// Ensure required environment variables are set
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";
const POLYGON_ZKEVM_RPC_URL = process.env.POLYGON_ZKEVM_RPC_URL || "https://rpc.public.zkevm-test.net";

if (!PRIVATE_KEY) {
  console.warn("Warning: PRIVATE_KEY not set in .env file");
}

if (!POLYGONSCAN_API_KEY) {
  console.warn("Warning: POLYGONSCAN_API_KEY not set in .env file. Contract verification will not work.");
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      zksync: false,
    },
    polygonZkEvm: {
      url: POLYGON_ZKEVM_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      zksync: true,
      verifyURL: "https://testnet-explorer.public.zkevm-test.net/api/contract/verify",
      chainId: 2442, // Polygon zkEVM Testnet
    },
    polygonZkEvmMainnet: {
      url: process.env.POLYGON_ZKEVM_MAINNET_RPC_URL || "https://zkevm-rpc.com",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      zksync: true,
      verifyURL: "https://explorer.zkevm-rpc.com/api/contract/verify",
      chainId: 1101, // Polygon zkEVM Mainnet
    },
  },
  etherscan: {
    apiKey: {
      polygonZkEvm: POLYGONSCAN_API_KEY,
      polygonZkEvmMainnet: POLYGONSCAN_API_KEY,
    },
    customChains: [
      {
        network: "polygonZkEvm",
        chainId: 2442,
        urls: {
          apiURL: "https://api-testnet-zkevm.polygonscan.com/api",
          browserURL: "https://testnet-zkevm.polygonscan.com/",
        },
      },
      {
        network: "polygonZkEvmMainnet",
        chainId: 1101,
        urls: {
          apiURL: "https://api-zkevm.polygonscan.com/api",
          browserURL: "https://zkevm.polygonscan.com/",
        },
      },
    ],
  },
  zksolc: {
    version: "latest",
    settings: {
      // zkSync specific settings
      compilerPath: "zksolc",
      libraries: {},
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  // Specify the custom tasks for deployment and verification
  mocha: {
    timeout: 60000, // Set higher for zkEVM deployments which can take longer
  },
};

export default config;
