// Re-export types from the types package
export * from '@fixierun/types';

// Additional Web3-specific types
export interface WalletState {
  address?: string;
  isConnected: boolean;
  isConnecting: boolean;
  chainId?: number;
}

export interface ContractCallResult<T = any> {
  data?: T;
  error?: Error;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface TransactionResult {
  hash?: string;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: Error;
}