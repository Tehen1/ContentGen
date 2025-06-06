import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  type: "biking" | "running" | "walking";
  startTime: Date;
  endTime?: Date;
  distance: number;
  duration: number;
  calories?: number;
  averageSpeed?: number;
  maxSpeed?: number;
  elevation?: number;
  heartRate?: number;
  steps?: number;
  path: Array<{
    latitude: number;
    longitude: number;
    timestamp: Date;
    elevation?: number;
  }>;
  status: "active" | "paused" | "completed";
}

const ActivitySchema = new Schema<IActivity>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["biking", "running", "walking"],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  distance: {
    type: Number,
    required: true,
    default: 0
  },
  duration: {
    type: Number,
    required: true,
    default: 0
  },
  calories: {
    type: Number
  },
  averageSpeed: {
    type: Number
  },
  maxSpeed: {
    type: Number
  },
  elevation: {
    type: Number
  },
  heartRate: {
    type: Number
  },
  steps: {
    type: Number
  },
  path: [{
    latitude: Number,
    longitude: Number,
    timestamp: Date,
    elevation: Number
  }],
  status: {
    type: String,
    enum: ["active", "paused", "completed"],
    default: "active"
  }
}, {
  timestamps: true
});

ActivitySchema.index({ userId: 1, type: 1 });
ActivitySchema.index({ startTime: -1 });
ActivitySchema.index({ status: 1 });

export default mongoose.model<IActivity>("Activity", ActivitySchema);
