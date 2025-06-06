"use client"

import { useEffect, useState } from "react"
import { useWeb3 } from "@/lib/web3/web3-provider"
import { getUserProfile, getUserNFTs, getUserActivities, getUserChallenges } from "@/app/actions/user-actions"

export function useDashboardData() {
  const { account, isConnected } = useWeb3()
  const [userData, setUserData] = useState<any>(null)
  const [userNFTs, setUserNFTs] = useState<any[]>([])
  const [userActivities, setUserActivities] = useState<any[]>([])
  const [userChallenges, setUserChallenges] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected || !account) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // For demo purposes, we'll use a hardcoded user ID
        // In a real app, you would map the wallet address to a user ID
        const userId = "00000000-0000-0000-0000-000000000001"

        const [profileResult, nftsResult, activitiesResult, challengesResult] = await Promise.all([
          getUserProfile(userId),
          getUserNFTs(userId),
          getUserActivities(userId),
          getUserChallenges(userId),
        ])

        if (profileResult.success) {
          setUserData(profileResult.data)
        } else {
          setError(profileResult.error || "Failed to fetch user profile")
        }

        if (nftsResult.success) {
          setUserNFTs(nftsResult.data)
        }

        if (activitiesResult.success) {
          setUserActivities(activitiesResult.data)
        }

        if (challengesResult.success) {
          setUserChallenges(challengesResult.data)
        }
      } catch (err) {
        setError("An error occurred while fetching dashboard data")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [account, isConnected])

  return {
    userData,
    userNFTs,
    userActivities,
    userChallenges,
    isLoading,
    error,
  }
}
