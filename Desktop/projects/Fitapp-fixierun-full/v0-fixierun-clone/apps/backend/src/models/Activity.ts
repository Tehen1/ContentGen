import mongoose, { Schema, Document } from 'mongoose';
import { Activity as IActivity, GeoPoint } from '@fixierun/types';

export interface ActivityDocument extends IActivity, Document {}

const GeoPointSchema = new Schema<GeoPoint>({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, required: true }
}, { _id: false });

const ActivitySchema = new Schema<ActivityDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  distance: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  averageSpeed: {
    type: Number,
    required: true,
    min: 0
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  route: [GeoPointSchema],
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  verified: {
    type: Boolean,
    default: false,
    index: true
  },
  rewardsClaimed: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
ActivitySchema.index({ userId: 1, timestamp: -1 });
ActivitySchema.index({ verified: 1, rewardsClaimed: 1 });
ActivitySchema.index({ timestamp: -1 });

// Virtual for calculating rewards
ActivitySchema.virtual('potentialReward').get(function() {
  const baseReward = this.distance * 10; // 10 FIXIE per km
  const speedBonus = this.averageSpeed > 20 ? this.distance * 2 : 0;
  return baseReward + speedBonus;
});

export const Activity = mongoose.model<ActivityDocument>('Activity', ActivitySchema);