import express from "express"
import { ActivityAnalyzerService } from "../services/activity-analyzer"
import { authenticateUser } from "../middleware/auth"
import { ActivityVerifier } from "../services/activity-verifier"
import { RewardService } from "../services/reward-service"

const router = express.Router()
const analyzerService = new ActivityAnalyzerService()
const activityVerifier = new ActivityVerifier()
const rewardService = new RewardService()

// Get activity analysis
router.post("/analyze", authenticateUser, async (req, res) => {
  try {
    const { locationData, options } = req.body
    const userId = req.user.id

    const result = await analyzerService.analyzeActivity(userId, locationData, options)
    res.json(result)
  } catch (error) {
    console.error("Error analyzing activity:", error)
    res.status(500).json({ error: "Failed to analyze activity data" })
  }
})

// Verify and reward activity
router.post("/verify", authenticateUser, async (req, res) => {
  try {
    const { activityData, metrics } = req.body
    const userId = req.user.id

    // Verify the activity data using zero-knowledge proofs
    const verificationResult = await activityVerifier.verifyActivity(userId, activityData, metrics)

    if (verificationResult.verified) {
      // Calculate and issue rewards
      const rewardResult = await rewardService.issueRewards(userId, verificationResult.activity)
      res.json({
        verified: true,
        rewards: rewardResult,
      })
    } else {
      res.json({
        verified: false,
        reason: verificationResult.reason,
      })
    }
  } catch (error) {
    console.error("Error verifying activity:", error)
    res.status(500).json({ error: "Failed to verify activity" })
  }
})

export default router
