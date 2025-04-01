import { Schema } from 'mongoose';

/**
 * Mongoose schema for audit logs
 */
export const AuditLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      index: true,
    },
    userRole: {
      type: String,
      enum: ['admin', 'user'],
      index: true,
    },
    resourceType: {
      type: String,
      required: true,
      index: true,
    },
    resourceId: {
      type: String,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
    },
    success: {
      type: Boolean,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    // Enable virtual getters when converting to JSON
    toJSON: {
      virtuals: true,
      getters: true,
    },
    // Add timestamps (createdAt, updatedAt)
    timestamps: true,
  },
);