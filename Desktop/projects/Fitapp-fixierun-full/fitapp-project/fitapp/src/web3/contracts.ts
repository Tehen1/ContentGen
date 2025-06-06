import { ethers } from 'ethers';

// ABI definitions
export const TOKEN_ABI = [
  // ERC20 standard functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

export const NFT_ABI = [
  // ERC721 standard functions
  'function balanceOf(address owner) view returns (uint256 balance)',
  'function ownerOf(uint256 tokenId) view returns (address owner)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function approve(address to, uint256 tokenId)',
  'function getApproved(uint256 tokenId) view returns (address operator)',
  'function setApprovalForAll(address operator, bool _approved)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function name() view returns (string memory)',
  'function symbol() view returns (string memory)',
  'function tokenURI(uint256 tokenId) view returns (string memory)',
  // Custom functions for fitness NFTs
  'function mintFitnessNFT(address to, string memory tokenURI) returns (uint256)',
  'function getTokensOfOwner(address owner) view returns (uint256[] memory)',
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
  'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
];

/**
 * Get token contract instance
 */
export const getTokenContract = (
  contractAddress: string,
  signer: ethers.Signer | ethers.providers.Provider
): ethers.Contract => {
  return new ethers.Contract(contractAddress, TOKEN_ABI, signer);
};

/**
 * Get NFT contract instance
 */
export const getNFTContract = (
  contractAddress: string,
  signer: ethers.Signer | ethers.providers.Provider
): ethers.Contract => {
  return new ethers.Contract(contractAddress, NFT_ABI, signer);
};

/**
 * Get token balance
 */
export const getTokenBalance = async (
  tokenContract: ethers.Contract,
  address: string
): Promise<string> => {
  try {
    const balance = await tokenContract.balanceOf(address);
    const decimals = await tokenContract.decimals();
    return ethers.utils.formatUnits(balance, decimals);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return '0';
  }
};

/**
 * Transfer tokens
 */
export const transferTokens = async (
  tokenContract: ethers.Contract,
  toAddress: string,
  amount: string
): Promise<ethers.providers.TransactionReceipt> => {
  try {
    const decimals = await tokenContract.decimals();
    const amountInWei = ethers.utils.parseUnits(amount, decimals);
    const tx = await tokenContract.transfer(toAddress, amountInWei);
    return await tx.wait();
  } catch (error) {
    console.error('Error transferring tokens:', error);
    throw error;
  }
};

/**
 * Mint fitness NFT
 */
export const mintFitnessNFT = async (
  nftContract: ethers.Contract,
  toAddress: string,
  tokenURI: string
): Promise<{ tokenId: number, txReceipt: ethers.providers.TransactionReceipt }> => {
  try {
    const tx = await nftContract.mintFitnessNFT(toAddress, tokenURI);
    const receipt = await tx.wait();
    
    // Parse the event to get the tokenId
    const event = receipt.events?.find(event => event.event === 'Transfer');
    const tokenId = event?.args?.tokenId.toNumber();
    
    return { tokenId, txReceipt: receipt };
  } catch (error) {
    console.error('Error minting fitness NFT:', error);
    throw error;
  }
};

/**
 * Get all NFTs owned by an address
 */
export const getOwnedNFTs = async (
  nftContract: ethers.Contract,
  ownerAddress: string
): Promise<number[]> => {
  try {
    const tokenIds = await nftContract.getTokensOfOwner(ownerAddress);
    return tokenIds.map((id: ethers.BigNumber) => id.toNumber());
  } catch (error) {
    console.error('Error getting owned NFTs:', error);
    return [];
  }
};

/**
 * Get NFT metadata from tokenURI
 */
export const getNFTMetadata = async (
  nftContract: ethers.Contract,
  tokenId: number
): Promise<any> => {
  try {
    const tokenURI = await nftContract.tokenURI(tokenId);
    // If the tokenURI is an IPFS URI, convert it to a gateway URL
    const url = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error getting NFT metadata:', error);
    return null;
  }
};

