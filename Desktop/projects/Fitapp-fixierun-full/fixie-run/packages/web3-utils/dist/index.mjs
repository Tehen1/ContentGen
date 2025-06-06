// src/constants/chains.ts
import { ChainId } from "@fixie-run/types";
import { defineChain } from "viem";
var polygonZkEvm = defineChain({
  id: ChainId.POLYGON_ZKEVM,
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
var polygonZkEvmTestnet = defineChain({
  id: ChainId.POLYGON_ZKEVM_TESTNET,
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
  [ChainId.POLYGON_ZKEVM]: polygonZkEvm,
  [ChainId.POLYGON_ZKEVM_TESTNET]: polygonZkEvmTestnet
};
var DEFAULT_CHAIN_ID = process.env.NODE_ENV === "production" ? ChainId.POLYGON_ZKEVM : ChainId.POLYGON_ZKEVM_TESTNET;
var DEFAULT_CHAIN = SUPPORTED_CHAINS[DEFAULT_CHAIN_ID];

// src/constants/contracts.ts
import { ChainId as ChainId2, ContractType } from "@fixie-run/types";
var CONTRACT_ADDRESSES = {
  [ContractType.BIKE_NFT]: {
    [ChainId2.POLYGON_ZKEVM]: "0x0000000000000000000000000000000000000000",
    // To be deployed
    [ChainId2.POLYGON_ZKEVM_TESTNET]: "0x0000000000000000000000000000000000000000"
    // To be deployed
  },
  [ContractType.REWARDS_TOKEN]: {
    [ChainId2.POLYGON_ZKEVM]: "0x0000000000000000000000000000000000000000",
    // To be deployed
    [ChainId2.POLYGON_ZKEVM_TESTNET]: "0x0000000000000000000000000000000000000000"
    // To be deployed
  },
  [ContractType.ACTIVITY_VERIFIER]: {
    [ChainId2.POLYGON_ZKEVM]: "0x0000000000000000000000000000000000000000",
    // To be deployed
    [ChainId2.POLYGON_ZKEVM_TESTNET]: "0x0000000000000000000000000000000000000000"
    // To be deployed
  },
  [ContractType.MARKETPLACE]: {
    [ChainId2.POLYGON_ZKEVM]: "0x0000000000000000000000000000000000000000",
    // To be deployed
    [ChainId2.POLYGON_ZKEVM_TESTNET]: "0x0000000000000000000000000000000000000000"
    // To be deployed
  },
  [ContractType.STAKING]: {
    [ChainId2.POLYGON_ZKEVM]: "0x0000000000000000000000000000000000000000",
    // To be deployed
    [ChainId2.POLYGON_ZKEVM_TESTNET]: "0x0000000000000000000000000000000000000000"
    // To be deployed
  },
  [ContractType.GOVERNANCE]: {
    [ChainId2.POLYGON_ZKEVM]: "0x0000000000000000000000000000000000000000",
    // To be deployed
    [ChainId2.POLYGON_ZKEVM_TESTNET]: "0x0000000000000000000000000000000000000000"
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
import { useCallback, useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from "wagmi";
import { ChainId as ChainId3 } from "@fixie-run/types";

// src/utils/formatters.ts
import { formatUnits, parseUnits } from "viem";
function formatEther(wei, decimals = 4) {
  if (wei === null || wei === void 0) return "0";
  try {
    const weiBigInt = typeof wei === "bigint" ? wei : BigInt(String(wei));
    const formatted = formatUnits(weiBigInt, 18);
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
    return parseUnits(String(ether), 18);
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
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending: isConnecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });
  const { switchChain, isPending: isSwitchingChain, error: switchChainError } = useSwitchChain();
  const [error, setError] = useState(null);
  const isConnectedToSupportedChain = isConnected && chainId && Object.values(ChainId3).includes(chainId);
  const networkName = isConnected && chainId ? SUPPORTED_CHAINS[chainId]?.name || "Unsupported Network" : "Not Connected";
  const connectWallet = useCallback(async ({
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
  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);
  const switchNetwork = useCallback(async (newChainId) => {
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
  useEffect(() => {
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
import { useState as useState2, useCallback as useCallback2 } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ChainId as ChainId4 } from "@fixie-run/types";
function useContractRead({
  contractType,
  chainId = ChainId4.POLYGON_ZKEVM,
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
  } = useReadContract({
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
  chainId = ChainId4.POLYGON_ZKEVM,
  functionName,
  args,
  value,
  onSuccess,
  onError
}) {
  const contractConfig = getContractConfig(contractType, chainId);
  const [hash, setHash] = useState2(null);
  const {
    writeContract,
    data: txHash,
    isLoading: isWritePending,
    isSuccess: isWriteSuccess,
    isError: isWriteError,
    error: writeError,
    reset: resetWrite
  } = useWriteContract({
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
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash
    }
  });
  const write = useCallback2(
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
  const reset = useCallback2(() => {
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
import { createContext, useContext, useEffect as useEffect2, useState as useState3 } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChainId as ChainId5 } from "@fixie-run/types";
import { jsx } from "react/jsx-runtime";
var projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";
var config = createConfig({
  chains: Object.values(SUPPORTED_CHAINS),
  transports: {
    [ChainId5.POLYGON_ZKEVM]: http(),
    [ChainId5.POLYGON_ZKEVM_TESTNET]: http()
  },
  connectors: [
    injected(),
    walletConnect({ projectId }),
    coinbaseWallet({ appName: "Fixie.Run" })
  ]
});
var queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});
var Web3Context = createContext(void 0);
var Web3Provider2 = ({
  children,
  defaultChainId = DEFAULT_CHAIN_ID,
  autoConnect = true
}) => {
  return /* @__PURE__ */ jsx(WagmiProvider, { config, children: /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(
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
  const [initialized, setInitialized] = useState3(false);
  useEffect2(() => {
    if (autoConnect && !initialized) {
      wallet.connectWallet({ chainId: defaultChainId, forceConnect: false });
      setInitialized(true);
    }
  }, [autoConnect, defaultChainId, initialized, wallet]);
  return /* @__PURE__ */ jsx(Web3Context.Provider, { value: wallet, children });
};
var useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
export {
  CONTRACT_ADDRESSES,
  DEFAULT_CHAIN,
  DEFAULT_CHAIN_ID,
  SUPPORTED_CHAINS,
  Web3Provider2 as Web3Provider,
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
};
