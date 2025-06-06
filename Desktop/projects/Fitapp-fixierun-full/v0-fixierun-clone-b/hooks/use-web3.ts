"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
  useAccount, 
  useConnect, 
  useDisconnect,
  useBalance, 
  useReadContract,
  useWriteContract,
  useChainId,
  useSwitchChain
} from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { polygonZkEvmTestnet } from 'wagmi/chains'
import { formatEther, parseEther } from 'viem'

import { 
  BIKE_NFT_ADDRESS,
  FIX_TOKEN_ADDRESS,
  STAKING_ADDRESS,
  POLYGON_ZKEVM_TESTNET_ID
} from '@/lib/constants'
import { BikeNFTABI, FixTokenABI, StakingABI } from '@/lib/abis'
import type { BikeNFT } from '@/types/nft'

"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
  useAccount, 
  useConnect, 
  useDisconnect,
  useBalance, 
  useReadContract,
  useWriteContract,
  useChainId,
  useSwitchChain
} from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { polygonZkEvmTestnet } from 'wagmi/chains'
import { formatEther, parseEther } from 'viem'

import { 
  BIKE_NFT_ADDRESS,
  FIX_TOKEN_ADDRESS,
  STAKING_ADDRESS,
  POLYGON_ZKEVM_TESTNET_ID
} from '@/lib/constants'
import { BikeNFTABI, FixTokenABI, StakingABI } from '@/lib/abis'
import type { BikeNFT } from '@/types/nft'

export function useWeb3() {
  // State management
  const [bikes, setBikes] = useState<BikeNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [claimableRewards, setClaimableRewards] = useState<bigint>(0n)

  // Wagmi hooks
  const { address, isConnected } = useAccount()
  const { connectAsync, connectors } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const chainId = useChainId()
  const { switchChainAsync } = useSwitchChain()
  const { open } = useWeb3Modal()

  // Token balance
  const { data: nativeBalance, refetch: refetchNativeBalance } = useBalance({
    address,
    query: {
      enabled: !!address && isConnected
    }
  })

  const { data: fixBalanceData, refetch: refetchFixBalance } = useReadContract({
    address: FIX_TOKEN_ADDRESS,
    abi: FixTokenABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected
    }
  })

  // Format $FIX balance for display
  const fixBalance = fixBalanceData !== undefined ? {
    value: fixBalanceData,
    formatted: formatEther(fixBalanceData),
    symbol: 'FIX'
  } : null

  // Claimable rewards
  const { data: claimableRewardsData, refetch: refetchClaimableRewards } = useReadContract({
    address: STAKING_ADDRESS,
    abi: StakingABI,
    functionName: 'getClaimableRewards',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected
    }
  })

  // NFT data
  const { data: userBikesData, refetch: refetchUserBikes } = useReadContract({
    address: BIKE_NFT_ADDRESS,
    abi: BikeNFTABI,
    functionName: 'getBikesByOwner',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isConnected
    }
  })

  // Contract write operations
  const { writeContractAsync } = useWriteContract()

  // Check if on correct network
  const isCorrectNetwork = chainId === POLYGON_ZKEVM_TESTNET_ID

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    if (isConnected) return true
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Open Web3Modal for wallet selection
      open()
      return true
    } catch (err) {
      console.error("Failed to connect wallet:", err)
      setError("Failed to connect wallet. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, open])

  // Disconnect wallet function
  const disconnectWallet = useCallback(async () => {
    if (!isConnected) return true
    
    setIsLoading(true)
    setError(null)
    
    try {
      await disconnectAsync()
      return true
    } catch (err) {
      console.error("Failed to disconnect wallet:", err)
      setError("Failed to disconnect wallet. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, disconnectAsync])

  // Ensure correct network
  const ensureCorrectNetwork = useCallback(async () => {
    if (chainId !== POLYGON_ZKEVM_TESTNET_ID) {
      try {
        await switchChainAsync({ chainId: POLYGON_ZKEVM_TESTNET_ID })
        return true
      } catch (err) {
        console.error("Failed to switch network:", err)
        setError("Please switch to Polygon zkEVM network.")
        return false
      }
    }
    return true
  }, [chainId, switchChainAsync])

  // Claim rewards function
  const claimRewards = useCallback(async () => {
    if (!address || !isConnected) return false
    
    // Ensure we're on the correct network
    const networkOk = await ensureCorrectNetwork()
    if (!networkOk) return false
    
    setIsLoading(true)
    setError(null)
    
    try {
      // In a production environment, this would call the actual contract
      // For development/demo purposes, we'll simulate success for now
      if (process.env.NODE_ENV === 'development') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Refetch balances to update the UI
        await Promise.all([
          refetchFixBalance(),
          refetchClaimableRewards()
        ])
        
        setClaimableRewards(0n)
        return true
      } else {
        // Real implementation for production
        await writeContractAsync({
          address: STAKING_ADDRESS,
          abi: StakingABI,
          functionName: 'claimRewards'
        })
        
        // Refetch balances after claiming
        await Promise.all([
          refetchFixBalance(),
          refetchClaimableRewards()
        ])
        
        return true
      }
    } catch (err) {
      console.error("Failed to claim rewards:", err)
      setError("Failed to claim rewards. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [
    address, 
    isConnected, 
    ensureCorrectNetwork, 
    writeContractAsync,
    refetchFixBalance, 
    refetchClaimableRewards
  ])

  // Evolve bike function
  const evolveBike = useCallback(async (tokenId: number) => {
    if (!address || !isConnected) return false
    
    // Ensure we're on the correct network
    const networkOk = await ensureCorrectNetwork()
    if (!networkOk) return false
    
    setIsLoading(true)
    setError(null)
    
    try {
      // In a production environment, this would call the actual contract
      // For development/demo purposes, we'll simulate success for now
      if (process.env.NODE_ENV === 'development') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Update bike data manually in development
        setBikes(prevBikes => 
          prevBikes.map(bike => 
            bike.tokenId === tokenId 
              ? {
                  ...bike,
                  level: bike.level + 1,
                  evolvedAt: Date.now(),
                  stats: {
                    speed: bike.stats.speed + 5,
                    endurance: bike.stats.endurance + 5,
                    strength: bike.stats.strength + 5,
                    style: bike.stats.style + 5
                  }
                }
              : bike
          )
        )
        
        return true
      } else {
        // Real implementation for production
        await writeContractAsync({
          address: BIKE_NFT_ADDRESS,
          abi: BikeNFTABI,
          functionName: 'evolveBike',
          args: [BigInt(tokenId)]
        })
        
        // Refetch bike data
        await refetchUserBikes()
        
        return true
      }
    } catch (err) {
      console.error("Failed to evolve bike:", err)
      setError("Failed to evolve bike. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [
    address,
    isConnected,
    ensureCorrectNetwork,
    writeContractAsync,
    refetchUserBikes
  ])

  // Install upgrade function
  const installUpgrade = useCallback(async (tokenId: number, upgradeName: string) => {
    if (!address || !isConnected) return false
    
    // Ensure we're on the correct network
    const networkOk = await ensureCorrectNetwork()
    if (!networkOk) return false
    
    setIsLoading(true)
    setError(null)
    
    try {
      // In a production environment, this would call the actual contract
      // For development/demo purposes, we'll simulate success for now
      if (process.env.NODE_ENV === 'development') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Update bike data manually in development
        setBikes(prevBikes => 
          prevBikes.map(bike => 
            bike.tokenId === tokenId 
              ? {
                  ...bike,
                  upgrades: bike.upgrades.map(upgrade => 
                    upgrade.name === upgradeName 
                      ? { ...upgrade, installed: true }
                      : upgrade
                  )
                }
              : bike
          )
        )
        
        return true
      } else {
        // Real implementation for production
        await writeContractAsync({
          address: BIKE_NFT_ADDRESS,
          abi: BikeNFTABI,
          functionName: 'installUpgrade',
          args: [BigInt(tokenId), upgradeName]
        })
        
        // Refetch bike data
        await refetchUserBikes()
        
        return true
      }
    } catch (err) {
      console.error("Failed to install upgrade:", err)
      setError("Failed to install upgrade. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [
    address,
    isConnected,
    ensureCorrectNetwork,
    writeContractAsync,
    refetchUserBikes
  ])

  // Record ride function
  const recordRide = useCallback(async (tokenId: number, distance: number, duration: number) => {
    if (!address || !isConnected) return false
    
    // Ensure we're on the correct network
    const networkOk = await ensureCorrectNetwork()
    if (!networkOk) return false
    
    setIsLoading(true)
    setError(null)
    
    try {
      // In a production environment, this would call the actual contract with proof
      // For development/demo purposes, we'll simulate success for now
      if (process.env.NODE_ENV === 'development') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Update bike data manually in development
        setBikes(prevBikes => 
          prevBikes.map(bike => 
            bike.tokenId === tokenId 
              ? {
                  ...bike,
                  lastRideAt: Date.now(),
                  xp: Math.min(bike.xp + Math.floor(distance * 10), bike.xpToNextLevel),
                  durability: Math.max(bike.durability - Math.floor(distance / 10), 0)
                }
              : bike
          )
        )
        
        // Update claimable rewards
        const earnedRewards = BigInt(Math.floor(distance * 5)) * parseEther("1")
        setClaimableRewards(prevRewards => prevRewards + earnedRewards)
        
        return true
      } else {
        // Real implementation for production would include a zero-knowledge proof
        const emptyProof = '0x' as `0x${string}`
        
        await writeContractAsync({
          address: BIKE_NFT_ADDRESS,
          abi: BikeNFTABI,
          functionName: 'recordRide',
          args: [BigInt(tokenId), BigInt(distance), BigInt(duration), emptyProof]
        })
        
        // Refetch data
        await Promise.all([
          refetchUserBikes(),
          refetchClaimableRewards()
        ])
        
        return true
      }
    } catch (err) {
      console.error("Failed to record ride:", err)
      setError("Failed to record ride. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [
    address,
    isConnected,
    ensureCorrectNetwork,
    writeContractAsync,
    refetchUserBikes,
    refetchClaimableRewards
  ])

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!address || !isConnected) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      await Promise.all([
        refetchNativeBalance(),
        refetchFixBalance(),
        refetchClaimableRewards(),
        refetchUserBikes()
      ])
    } catch (err) {
      console.error("Error refreshing data:", err)
      setError("Failed to refresh data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [
    address,
    isConnected,
    refetchNativeBalance,
    refetchFixBalance,
    refetchClaimableRewards,
    refetchUserBikes
  ])

  // Update claimable rewards from contract data
  useEffect(() => {
    if (claimableRewardsData !== undefined) {
      setClaimableRewards(claimableRewardsData)
    }
  }, [claimableRewardsData])

  // Update bikes from contract data
  useEffect(() => {
    if (userBikesData) {
      // In a real implementation, this would parse the returned data
      // For now, we'll use mock data to simulate the BikeNFT structure
      
      if (process.env.NODE_ENV === 'development') {
        const mockBikes: BikeNFT[] = [
          {
            tokenId: 1,
            name: "Neon Velocity X9",
            image: "/bikes/neon-velocity.png",
            level: 42,
            stats: {
              speed: 97,
              endurance

