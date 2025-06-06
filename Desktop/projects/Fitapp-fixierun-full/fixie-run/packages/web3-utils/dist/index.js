"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CONTRACT_ADDRESSES: () => CONTRACT_ADDRESSES,
  DEFAULT_CHAIN: () => DEFAULT_CHAIN,
  DEFAULT_CHAIN_ID: () => DEFAULT_CHAIN_ID,
  SUPPORTED_CHAINS: () => SUPPORTED_CHAINS,
  Web3Provider: () => Web3Provider2,
  formatAddress: () => formatAddress,
  formatDate: () => formatDate,
  formatDuration: () => formatDuration,
  formatEther: () => formatEther,
  getContractAddress: () => getContractAddress,
  getContractConfig: () => getContractConfig,
  parseEther: () => parseEther,
  polygonZkEvm: () => polygonZkEvm,
  polygonZkEvmTestnet: () => polygonZkEvmTestnet,
  useContractRead: () => useContractRead,
  useContractWrite: () => useContractWrite,
  useWallet: () => useWallet,
  useWeb3: () => useWeb3
});
module.exports = __toCommonJS(index_exports);

// src/constants/chains.ts
var import_types = require("@fixie-run/types");
var import_viem = require("viem");
var polygonZkEvm = (0, import_viem.defineChain)({
  id: import_types.ChainId.POLYGON_ZKEVM,
  name: "Polygon zkEVM",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://zkevm-rpc.com"]
    },
    public: {
      http: ["https://zkevm-rpc.com"]
    },
    alchemy: {
      http: ["https://polygonzkevm-mainnet.g.alchemy.com/v2"]
    }
  },
  blockExplorers: {
    default: {
      name: "PolygonScan",
      url: "https://zkevm.polygonscan.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 57746
    }
  }
});
var polygonZkEvmTestnet = (0, import_viem.defineChain)({
  id: import_types.ChainId.POLYGON_ZKEVM_TESTNET,
  name: "Polygon zkEVM Testnet",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.public.zkevm-test.net"]
    },
    public: {
      http: ["https://rpc.public.zkevm-test.net"]
    }
  },
  blockExplorers: {
    default: {
      name: "PolygonScan",
      url: "https://testnet-zkevm.polygonscan.com"
    }
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 525686
    }
  }
});
var SUPPORTED_CHAINS = {
  [import_types.ChainId.POLYGON_ZKEVM]: polygonZkEvm,
  [import_types.ChainId.POLYGON_ZKEVM_TESTNET]: polygonZkEvmTestnet
};
var DEFAULT_CHAIN_ID = process.env.NODE_ENV === "production" ? import_types.ChainId.POLYGON_ZKEVM : import_types.ChainId.POLYGON_ZKEVM_TESTNET;
var DEFAULT_CHAIN = SUPPORTED_CHAINS[DEFAULT_CHAIN_ID];

// src/constants/contracts.ts
var import_types2 = require("@fixie-run/types");
var CONTRACT_ADDRESSES = {
  [import_types2.ContractType.BIKE_NFT]: {
    [import_types2.ChainId.POLYGON_ZKEVM]: "0x0000000000000000000000000000000000000000",
    // To be deployed
    [import_types2.ChainId.POLYGON_ZKEVM_TESTNET]: "0x0000000000000000000000000000000000000000"
    // To be deployed
  },
  [import_types2.ContractType.REWARDS_TOKEN]: {
    [import_types2.ChainId.POLYGON_ZKEVM]: "0x0000000000000000000000000000000000000000",
    // To be deployed
    [import_types2.ChainId.POLYGON_ZKEVM_TESTNET]: "0x0000000000000000000000000000000000000000"
    // To be deployed
  },
  [import_types2.ContractType.ACTIVITY_VERIFIER]: {
    [import_types2.ChainId.POLYGON_ZKEVM]: "0x0000000000000000000000000000000000000000",
    // To be deployed
    [import_types2.ChainId.POLYGON_ZKEVM_TESTNET]: "0x0000000000000000000000000000000000000000"
    // To be deployed
  },
  [import_types2.ContractType.MARKETPLACE]: {
    [import_types2.ChainId.POLYGON_ZKEVM]: "0x0000000000000000000000000000000000000000",
    // To be deployed
    [import_types2.ChainId.POLYGON_ZKEVM_TESTNET]: "0x0000000000000000000000000000000000000000"
    // To be deployed
  },
  [import_types2.ContractType.STAKING]: {
    [import_types2.ChainId.POLYGON_ZKEVM]: "0x0000000000000000000000000000000000000000",
    // To be deployed
    [import_types2.ChainId.POLYGON_ZKEVM_TESTNET]: "0x0000000000000000000000000000000000000000"
    // To be deployed
  },
  [import_types2.ContractType.GOVERNANCE]: {
    [import_types2.ChainId.POLYGON_ZKEVM]: "0x0000000000000000000000000000000000000000",
    // To be deployed
    [import_types2.ChainId.POLYGON_ZKEVM_TESTNET]: "0x0000000000000000000000000000000000000000"
    // To be deployed
  }
};
function getContractAddress(contractType, chainId) {
  return CONTRACT_ADDRESSES[contractType][chainId] || "0x0000000000000000000000000000000000000000";
}
function getContractConfig(contractType, chainId) {
  return {
    address: getContractAddress(contractType, chainId),
    abi: []
    // Will be populated with actual ABI when contracts are implemented
  };
}

// src/hooks/useWallet.ts
var import_react = require("react");
var import_wagmi = require("wagmi");
var import_types3 = require("@fixie-run/types");

// src/utils/formatters.ts
var import_viem2 = require("viem");
function formatEther(wei, decimals = 4) {
  if (wei === null || wei === void 0) return "0";
  try {
    const weiBigInt = typeof wei === "bigint" ? wei : BigInt(String(wei));
    const formatted = (0, import_viem2.formatUnits)(weiBigInt, 18);
    if (decimals === 0) {
      return formatted.split(".")[0];
    }
    const parts = formatted.split(".");
    return `${parts[0]}.${(parts[1] || "").padEnd(decimals, "0").slice(0, decimals)}`;
  } catch (error) {
    console.error("Error formatting ether:", error);
    return "0";
  }
}
function parseEther(ether) {
  try {
    return (0, import_viem2.parseUnits)(String(ether), 18);
  } catch (error) {
    console.error("Error parsing ether:", error);
    return BigInt(0);
  }
}
function formatAddress(address, start = 6, end = 4) {
  if (!address) return "";
  if (address.length < start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}
function formatDate(timestamp, options = {}) {
  if (!timestamp) return "";
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric"
  };
  return new Date(timestamp).toLocaleDateString(void 0, { ...defaultOptions, ...options });
}
function formatDuration(seconds) {
  if (!seconds) return "00:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const pad = (num) => num.toString().padStart(2, "0");
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
  }
  return `${pad(minutes)}:${pad(remainingSeconds)}`;
}

// src/hooks/useWallet.ts
function useWallet() {
  const { address, isConnected, chainId } = (0, import_wagmi.useAccount)();
  const { connect, connectors, isPending: isConnecting, error: connectError } = (0, import_wagmi.useConnect)();
  const { disconnect } = (0, import_wagmi.useDisconnect)();
  const { data: balanceData } = (0, import_wagmi.useBalance)({ address });
  const { switchChain, isPending: isSwitchingChain, error: switchChainError } = (0, import_wagmi.useSwitchChain)();
  const [error, setError] = (0, import_react.useState)(null);
  const isConnectedToSupportedChain = isConnected && chainId && Object.values(import_types3.ChainId).includes(chainId);
  const networkName = isConnected && chainId ? SUPPORTED_CHAINS[chainId]?.name || "Unsupported Network" : "Not Connected";
  const connectWallet = (0, import_react.useCallback)(async ({
    chainId: chainId2 = DEFAULT_CHAIN_ID,
    forceConnect = false,
    onSuccess,
    onError
  } = {}) => {
    try {
      setError(null);
      if (isConnected && !forceConnect) {
        if (chainId2 && chainId2 !== chainId2) {
          await switchChain({ chainId: chainId2 });
        }
        return;
      }
      const injectedConnector = connectors.find((c) => c.id === "injected");
      const coinbaseConnector = connectors.find((c) => c.id === "coinbaseWallet");
      const walletConnectConnector = connectors.find((c) => c.id === "walletConnect");
      const connector = injectedConnector || coinbaseConnector || walletConnectConnector || connectors[0];
      if (!connector) {
        throw new Error("No wallet connectors available");
      }
      connect({ connector, chainId: chainId2 });
      if (onSuccess && address) {
        onSuccess(address);
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err instanceof Error ? err : new Error("Failed to connect wallet"));
      if (onError) {
        onError(err instanceof Error ? err : new Error("Failed to connect wallet"));
      }
    }
  }, [address, chainId, connect, connectors, isConnected, switchChain]);
  const disconnectWallet = (0, import_react.useCallback)(() => {
    disconnect();
  }, [disconnect]);
  const switchNetwork = (0, import_react.useCallback)(async (newChainId) => {
    try {
      if (!SUPPORTED_CHAINS[newChainId]) {
        throw new Error("Unsupported network");
      }
      await switchChain({ chainId: newChainId });
    } catch (err) {
      console.error("Error switching network:", err);
      setError(err instanceof Error ? err : new Error("Failed to switch network"));
    }
  }, [switchChain]);
  (0, import_react.useEffect)(() => {
    if (connectError) {
      setError(connectError);
    } else if (switchChainError) {
      setError(switchChainError);
    }
  }, [connectError, switchChainError]);
  const web3Provider = {
    name: "Ethereum",
    chainId: chainId || DEFAULT_CHAIN_ID,
    isConnected,
    address: address || void 0,
    isCorrectNetwork: isConnectedToSupportedChain,
    networkName,
    balance: {
      eth: balanceData ? formatEther(balanceData.value) : "0"
    }
  };
  return {
    ...web3Provider,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    isConnecting,
    isSwitchingChain,
    error,
    supportedChains: SUPPORTED_CHAINS,
    defaultChain: DEFAULT_CHAIN
  };
}

// src/hooks/useContract.ts
var import_react2 = require("react");
var import_wagmi2 = require("wagmi");
var import_types4 = require("@fixie-run/types");
function useContractRead({
  contractType,
  chainId = import_types4.ChainId.POLYGON_ZKEVM,
  functionName,
  args = [],
  enabled = true
}) {
  const contractConfig = getContractConfig(contractType, chainId);
  const {
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    refetch
  } = (0, import_wagmi2.useReadContract)({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName,
    args,
    query: {
      enabled
    }
  });
  return {
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    refetch
  };
}
function useContractWrite({
  contractType,
  chainId = import_types4.ChainId.POLYGON_ZKEVM,
  functionName,
  args,
  value,
  onSuccess,
  onError
}) {
  const contractConfig = getContractConfig(contractType, chainId);
  const [hash, setHash] = (0, import_react2.useState)(null);
  const {
    writeContract,
    data: txHash,
    isLoading: isWritePending,
    isSuccess: isWriteSuccess,
    isError: isWriteError,
    error: writeError,
    reset: resetWrite
  } = (0, import_wagmi2.useWriteContract)({
    mutation: {
      onSuccess,
      onError
    }
  });
  if (txHash && !hash) {
    setHash(txHash);
  }
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isConfirmError,
    error: confirmError
  } = (0, import_wagmi2.useWaitForTransactionReceipt)({
    hash,
    query: {
      enabled: !!hash
    }
  });
  const write = (0, import_react2.useCallback)(
    (overrideArgs, overrideValue) => {
      const finalArgs = overrideArgs || args || [];
      const finalValue = overrideValue || value;
      try {
        const config2 = {
          address: contractConfig.address,
          abi: contractConfig.abi,
          functionName,
          args: finalArgs
        };
        if (finalValue) {
          config2.value = typeof finalValue === "string" ? parseEther(finalValue) : parseEther(String(finalValue));
        }
        writeContract(config2);
      } catch (error) {
        console.error("Error writing to contract:", error);
        if (onError) {
          onError(
            error instanceof Error ? error : new Error("Failed to write to contract"),
            { functionName, args: finalArgs }
          );
        }
      }
    },
    [contractConfig, functionName, args, value, writeContract, onError]
  );
  const reset = (0, import_react2.useCallback)(() => {
    setHash(null);
    resetWrite();
  }, [resetWrite]);
  const transaction = receipt ? {
    hash: receipt.transactionHash,
    from: receipt.from,
    to: receipt.to || "",
    value: "0",
    // Would need to extract from receipt
    gasLimit: receipt.gasUsed.toString(),
    gasPrice: "0",
    // Would need to extract from receipt
    nonce: 0,
    // Would need to extract from receipt
    data: "0x",
    // Would need to extract from receipt
    chainId,
    status: isConfirmed ? "confirmed" : "pending",
    blockNumber: receipt.blockNumber,
    blockHash: receipt.blockHash,
    timestamp: Date.now(),
    confirmations: 1,
    // Would need to calculate
    receipt: {
      status: receipt.status === "success",
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: "0",
      // Would need to extract from receipt
      logs: receipt.logs
    }
  } : void 0;
  return {
    write,
    reset,
    hash,
    receipt,
    transaction,
    isWritePending,
    isWriteSuccess,
    isWriteError,
    writeError,
    isConfirming,
    isConfirmed,
    isConfirmError,
    confirmError,
    isLoading: isWritePending || isConfirming,
    isSuccess: isWriteSuccess && isConfirmed,
    isError: isWriteError || isConfirmError,
    error: writeError || confirmError
  };
}

// src/providers/Web3Provider.tsx
var import_react3 = require("react");
var import_wagmi3 = require("wagmi");
var import_connectors = require("wagmi/connectors");
var import_react_query = require("@tanstack/react-query");
var import_types5 = require("@fixie-run/types");
var import_jsx_runtime = require("react/jsx-runtime");
var projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";
var config = (0, import_wagmi3.createConfig)({
  chains: Object.values(SUPPORTED_CHAINS),
  transports: {
    [import_types5.ChainId.POLYGON_ZKEVM]: (0, import_wagmi3.http)(),
    [import_types5.ChainId.POLYGON_ZKEVM_TESTNET]: (0, import_wagmi3.http)()
  },
  connectors: [
    (0, import_connectors.injected)(),
    (0, import_connectors.walletConnect)({ projectId }),
    (0, import_connectors.coinbaseWallet)({ appName: "Fixie.Run" })
  ]
});
var queryClient = new import_react_query.QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});
var Web3Context = (0, import_react3.createContext)(void 0);
var Web3Provider2 = ({
  children,
  defaultChainId = DEFAULT_CHAIN_ID,
  autoConnect = true
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_wagmi3.WagmiProvider, { config, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react_query.QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    Web3ProviderInner,
    {
      defaultChainId,
      autoConnect,
      children
    }
  ) }) });
};
var Web3ProviderInner = ({
  children,
  defaultChainId,
  autoConnect
}) => {
  const wallet = useWallet();
  const [initialized, setInitialized] = (0, import_react3.useState)(false);
  (0, import_react3.useEffect)(() => {
    if (autoConnect && !initialized) {
      wallet.connectWallet({ chainId: defaultChainId, forceConnect: false });
      setInitialized(true);
    }
  }, [autoConnect, defaultChainId, initialized, wallet]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Web3Context.Provider, { value: wallet, children });
};
var useWeb3 = () => {
  const context = (0, import_react3.useContext)(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CONTRACT_ADDRESSES,
  DEFAULT_CHAIN,
  DEFAULT_CHAIN_ID,
  SUPPORTED_CHAINS,
  Web3Provider,
  formatAddress,
  formatDate,
  formatDuration,
  formatEther,
  getContractAddress,
  getContractConfig,
  parseEther,
  polygonZkEvm,
  polygonZkEvmTestnet,
  useContractRead,
  useContractWrite,
  useWallet,
  useWeb3
});
