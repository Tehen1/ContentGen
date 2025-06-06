import { useContract as useWagmiContract, usePublicClient } from 'wagmi';
import { getContract } from 'viem';
import { SCROLL_TESTNET_CONFIG } from '../utils/network';

export const useContract = (address: string, abi: any) => {
  const publicClient = usePublicClient();

  const contract = getContract({
    address: address as `0x${string}`,
    abi,
    client: publicClient,
  });

  return contract;
};

export const useFixieTokenContract = () => {
  const { contracts } = SCROLL_TESTNET_CONFIG;
  // Import ABI when available
  const abi = []; // TODO: Import from generated types
  
  return useContract(contracts.fixieToken, abi);
};

export const useBikeNFTContract = () => {
  const { contracts } = SCROLL_TESTNET_CONFIG;
  // Import ABI when available
  const abi = []; // TODO: Import from generated types
  
  return useContract(contracts.bikeNFT, abi);
};