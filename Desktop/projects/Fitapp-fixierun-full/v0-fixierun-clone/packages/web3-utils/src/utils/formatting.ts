import { formatEther, parseEther } from 'viem';

export const formatTokenAmount = (amount: bigint, decimals: number = 18): string => {
  return formatEther(amount);
};

export const parseTokenAmount = (amount: string): bigint => {
  return parseEther(amount);
};

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatCurrency = (amount: number, currency: string = 'FIXIE'): string => {
  return `${formatNumber(amount)} ${currency}`;
};