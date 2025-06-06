import mongoose, { Schema, Document } from 'mongoose';
import { User as IUser } from '@fixierun/types';

export interface UserDocument extends IUser, Document {}

const UserSchema = new Schema<UserDocument>({
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
UserSchema.index({ address: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ createdAt: -1 });

// Pre-save middleware
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const User = mongoose.model<UserDocument>('User', UserSchema);