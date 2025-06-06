import express from "express";
import { body, param, validationResult } from "express-validator";
import Activity from "../models/Activity";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all activities for user
router.get("/", async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user.id })
      .sort({ startTime: -1 })
      .limit(50);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

// Start new activity
router.post("/",
  [
    body("type").isIn(["biking", "running", "walking"]),
    body("startTime").isISO8601().toDate(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const activity = new Activity({
        ...req.body,
        userId: req.user.id,
        status: "active"
      });
      await activity.save();
      res.status(201).json(activity);
    } catch (error) {
      res.status(500).json({ error: "Failed to create activity" });
    }
  }
);

// Update activity
router.patch("/:id",
  [
    param("id").isMongoId(),
    body("distance").optional().isNumeric(),
    body("duration").optional().isNumeric(),
    body("status").optional().isIn(["active", "paused", "completed"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const activity = await Activity.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { $set: req.body },
        { new: true }
      );

      if (!activity) {
        return res.status(404).json({ error: "Activity not found" });
      }

      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: "Failed to update activity" });
    }
  }
);

export default router;
