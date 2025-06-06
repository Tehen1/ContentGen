import { ethers } from "ethers"
import { prisma } from "../lib/prisma"
import { ActivityAnalyzerService } from "./activity-analyzer"
import { getContractInstance } from "../lib/blockchain"

interface ActivityData {
  userId: string
  startTime: string
  endTime: string
  locationData: any[]
  bikeId?: number
}

interface VerificationResult {
  verified: boolean
  reason?: string
  activity?: {
    id: string
    distance: number
    duration: number
    averageSpeed: number
    activityHash: string
  }
}

export class ActivityVerifier {
  private analyzer: ActivityAnalyzerService

  constructor() {
    this.analyzer = new ActivityAnalyzerService()
  }

  async verifyActivity(userId: string, activityData: ActivityData): Promise<VerificationResult> {
    try {
      // Check if activity already exists
      const existingActivity = await prisma.activity.findFirst({
        where: {
          userId,
          startTime: new Date(activityData.startTime),
          endTime: new Date(activityData.endTime),
        },
      })

      if (existingActivity) {
        return {
          verified: false,
          reason: "Activity already recorded",
        }
      }

      // Analyze activity data
      const { metrics } = await this.analyzer.analyzeActivity(userId, activityData.locationData, {
        timePeriod: "all",
        activities: ["cycling"],
      })

      // Basic validation checks
      if (!this.validateActivityData(activityData, metrics)) {
        return {
          verified: false,
          reason: "Activity data validation failed",
        }
      }

      // Generate activity hash
      const activityHash = this.generateActivityHash(userId, activityData, metrics)

      // Create activity record
      const activity = await prisma.activity.create({
        data: {
          userId,
          startTime: new Date(activityData.startTime),
          endTime: new Date(activityData.endTime),
          distance: metrics.totalDistance,
          duration: metrics.totalDuration,
          averageSpeed: metrics.averageSpeed,
          activityHash,
          bikeId: activityData.bikeId,
          verified: true,
        },
      })

      // Generate zero-knowledge proof (simplified for demo)
      const proof = await this.generateProof(userId, activityHash, metrics.totalDistance)

      // Submit to blockchain for verification and rewards
      await this.submitToBlockchain(userId, activityHash, metrics.totalDistance, proof, activityData.bikeId)

      return {
        verified: true,
        activity: {
          id: activity.id,
          distance: activity.distance,
          duration: activity.duration,
          averageSpeed: activity.averageSpeed,
          activityHash: activity.activityHash,
        },
      }
    } catch (error) {
      console.error("Activity verification error:", error)
      return {
        verified: false,
        reason: "Verification process failed",
      }
    }
  }

  private validateActivityData(activityData: ActivityData, metrics: any): boolean {
    // Check if activity duration is reasonable
    const startTime = new Date(activityData.startTime).getTime()
    const endTime = new Date(activityData.endTime).getTime()
    const duration = (endTime - startTime) / 1000 / 60 // in minutes

    if (duration <= 0 || duration > 300) {
      // More than 5 hours is suspicious
      return false
    }

    // Check if speed is reasonable (between 5 and 50 km/h for cycling)
    if (metrics.averageSpeed < 5 || metrics.averageSpeed > 50) {
      return false
    }

    // Check if distance is reasonable based on duration
    const maxPossibleDistance = (duration / 60) * 50 // Max 50km/h
    if (metrics.totalDistance > maxPossibleDistance) {
      return false
    }

    return true
  }

  private generateActivityHash(userId: string, activityData: ActivityData, metrics: any): string {
    const data = ethers.utils.defaultAbiCoder.encode(
      ["address", "uint256", "uint256", "uint256", "uint256"],
      [
        userId,
        Math.floor(new Date(activityData.startTime).getTime() / 1000),
        Math.floor(new Date(activityData.endTime).getTime() / 1000),
        Math.floor(metrics.totalDistance * 100), // Convert to integer with 2 decimal precision
        activityData.bikeId || 0,
      ],
    )

    return ethers.utils.keccak256(data)
  }

  private async generateProof(userId: string, activityHash: string, distance: number): Promise<string> {
    // In a real implementation, this would generate a ZK proof
    // For demo purposes, we're just returning a dummy value
    return "0x0000000000000000000000000000000000000000000000000000000000000000"
  }

  private async submitToBlockchain(
    userId: string,
    activityHash: string,
    distance: number,
    proof: string,
    bikeId?: number,
  ): Promise<void> {
    try {
      // Get user's wallet address
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { walletAddress: true },
      })

      if (!user?.walletAddress) {
        throw new Error("User has no wallet address")
      }

      // Get contract instance
      const verifierContract = await getContractInstance("ActivityVerifier")

      // Convert distance to contract format (with 2 decimal precision)
      const distanceForContract = Math.floor(distance * 100)

      // Call contract method
      const tx = await verifierContract.verifyActivity(
        user.walletAddress,
        activityHash,
        distanceForContract,
        proof,
        bikeId || 0,
      )

      // Wait for transaction to be mined
      await tx.wait()

      console.log(`Activity verified on blockchain: ${tx.hash}`)
    } catch (error) {
      console.error("Blockchain submission error:", error)
      throw error
    }
  }
}
