import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

// Import required plugins
import "@nomicfoundation/hardhat-verify";
import "hardhat-gas-reporter";

// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ALCHEMY_ZKEVM_API_KEY = process.env.ALCHEMY_ZKEVM_API_KEY || "";
const ALCHEMY_ZKEVM_TESTNET_API_KEY = process.env.ALCHEMY_ZKEVM_TESTNET_API_KEY || "";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";
const REPORT_GAS = process.env.REPORT_GAS === "true";

// Ensure private key is available for deployment networks
if (!PRIVATE_KEY && process.env.NODE_ENV === "production") {
  throw new Error("Missing PRIVATE_KEY environment variable");
}

/**
 * Hardhat configuration
 * @dev See https://hardhat.org/config/ for complete configuration options
 */
const config: HardhatUserConfig = {
  // Default network when running Hardhat commands
  defaultNetwork: "hardhat",
  
  // Network configuration
  networks: {
    // Local development network
    hardhat: {
      chainId: 31337,
    },
    
    // Local network for testing
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    
    // Polygon zkEVM Testnet
    polygon_zkevm_testnet: {
      url: `https://polygonzkevm-testnet.g.alchemy.com/v2/${ALCHEMY_ZKEVM_TESTNET_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 1442,
      gasPrice: 'auto',
      verify: {
        etherscan: {
          apiUrl: "https://api-testnet-zkevm.polygonscan.com",
          apiKey: POLYGONSCAN_API_KEY,
        },
      },
    },
    
    // Polygon zkEVM Mainnet
    polygon_zkevm: {
      url: `https://polygonzkevm-mainnet.g.alchemy.com/v2/${ALCHEMY_ZKEVM_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 1101,
      gasPrice: 'auto',
      verify: {
        etherscan: {
          apiUrl: "https://api-zkevm.polygonscan.com",
          apiKey: POLYGONSCAN_API_KEY,
        },
      },
    }
  },
  
  // Solidity compiler configuration
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable the IR-based optimizer
      evmVersion: "paris", // Set EVM version
    },
  },
  
  // Path configuration
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  
  // Gas reporter configuration
  gasReporter: {
    enabled: REPORT_GAS,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: "ETH", // Use ETH as zkEVM is ETH-based
  },
  
  // Etherscan verification configuration
  etherscan: {
    apiKey: {
      // Polygon zkEVM
      polygon_zkevm: POLYGONSCAN_API_KEY,
      polygon_zkevm_testnet: POLYGONSCAN_API_KEY,
    },
    customChains: [
      {
        network: "polygon_zkevm",
        chainId: 1101,
        urls: {
          apiURL: "https://api-zkevm.polygonscan.com/api",
          browserURL: "https://zkevm.polygonscan.com",
        },
      },
      {
        network: "polygon_zkevm_testnet",
        chainId: 1442,
        urls: {
          apiURL: "https://api-testnet-zkevm.polygonscan.com/api",
          browserURL: "https://testnet-zkevm.polygonscan.com",
        },
      },
    ],
  },
  
  // TypeScript configuration
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  
  // Mocha configuration for tests
  mocha: {
    timeout: 60000, // Increase timeout for tests
  },
};

export default config;
