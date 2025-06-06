import { ActivityVerifier } from "../services/activity-verifier"
import { ActivityAnalyzerService } from "../services/activity-analyzer"
import { prisma } from "../lib/prisma"

// Mock dependencies
jest.mock("../services/activity-analyzer")
jest.mock("../lib/prisma", () => ({
  prisma: {
    activity: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}))
jest.mock("../lib/blockchain", () => ({
  getContractInstance: jest.fn(() => ({
    verifyActivity: jest.fn(() => ({
      wait: jest.fn(),
      hash: "0x123",
    })),
  })),
}))

describe("ActivityVerifier", () => {
  let verifier: ActivityVerifier

  beforeEach(() => {
    verifier = new ActivityVerifier()
    jest.clearAllMocks()
  })

  describe("verifyActivity", () => {
    const mockUserId = "user123"
    const mockActivityData = {
      userId: mockUserId,
      startTime: "2023-01-01T10:00:00Z",
      endTime: "2023-01-01T11:00:00Z",
      locationData: [{ lat: 1, lng: 1 }],
      bikeId: 1,
    }

    it("should reject already verified activities", async () => {
      // Mock existing activity
      ;(prisma.activity.findFirst as jest.Mock).mockResolvedValue({
        id: "activity123",
      })

      const result = await verifier.verifyActivity(mockUserId, mockActivityData)

      expect(result.verified).toBe(false)
      expect(result.reason).toBe("Activity already recorded")
    })

    it("should verify valid activities", async () => {
      // Mock no existing activity
      ;(prisma.activity.findFirst as jest.Mock)
        .mockResolvedValue(null)(
          // Mock analyzer result
          ActivityAnalyzerService.prototype.analyzeActivity as jest.Mock,
        )
        .mockResolvedValue({
          metrics: {
            totalDistance: 10,
            totalDuration: 60,
            averageSpeed: 10,
          },
        })(
          // Mock user
          prisma.user.findUnique as jest.Mock,
        )
        .mockResolvedValue({
          walletAddress: "0x123",
        })(
          // Mock activity creation
          prisma.activity.create as jest.Mock,
        )
        .mockResolvedValue({
          id: "newActivity123",
          distance: 10,
          duration: 60,
          averageSpeed: 10,
          activityHash: "0xabc",
        })

      const result = await verifier.verifyActivity(mockUserId, mockActivityData)

      expect(result.verified).toBe(true)
      expect(result.activity).toBeDefined()
      expect(result.activity?.distance).toBe(10)
    })

    it("should reject invalid activities", async () => {
      // Mock no existing activity
      ;(prisma.activity.findFirst as jest.Mock)
        .mockResolvedValue(null)(
          // Mock analyzer result with unrealistic speed
          ActivityAnalyzerService.prototype.analyzeActivity as jest.Mock,
        )
        .mockResolvedValue({
          metrics: {
            totalDistance: 100,
            totalDuration: 60,
            averageSpeed: 100, // Unrealistic speed
          },
        })

      const result = await verifier.verifyActivity(mockUserId, mockActivityData)

      expect(result.verified).toBe(false)
    })
  })
})
