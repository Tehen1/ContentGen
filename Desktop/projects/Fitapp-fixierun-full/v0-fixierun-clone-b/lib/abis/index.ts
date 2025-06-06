// BikeNFT ABI
export const BikeNFTABI = [
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "getBikesByOwner",
    outputs: [{ internalType: "tuple[]", name: "", type: "tuple[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "evolveBike",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "string", name: "upgradeName", type: "string" }
    ],
    name: "installUpgrade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "distance", type: "uint256" },
      { internalType: "uint256", name: "duration", type: "uint256" },
      { internalType: "bytes", name: "proof", type: "bytes" }
    ],
    name: "recordRide",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }
] as const

// FIX Token ABI
export const FixTokenABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  }
] as const

// Staking ABI
export const StakingABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "getClaimableRewards",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "claimRewards",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "duration", type: "uint256" }
    ],
    name: "stake",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "unstake",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  }
] as const

// Activity Verifier ABI
export const ActivityVerifierABI = [
  {
    inputs: [
      { internalType: "uint256", name: "bikeId", type: "uint256" },
      { internalType: "uint256", name: "distance", type: "uint256" },
      { internalType: "uint256", name: "duration", type: "uint256" },
      { internalType: "bytes", name: "proof", type: "bytes" }
    ],
    name: "verifyActivity",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserActivityStats",
    outputs: [{ internalType: "tuple", name: "", type: "tuple" }],
    stateMutability: "view",
    type: "function",
  }
] as const

