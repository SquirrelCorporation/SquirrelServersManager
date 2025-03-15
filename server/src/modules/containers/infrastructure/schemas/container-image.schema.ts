import { Schema } from 'mongoose';

/**
 * Schema name constant for DI
 */
export const CONTAINER_IMAGE = 'ContainerImage';

/**
 * Mongoose schema for container images
 */
export const ContainerImageSchema = new Schema(
  {
    id: { type: String, required: true },
    uuid: { type: String, required: true, unique: true },
    deviceUuid: { type: String, required: true },
    name: { type: String, required: true },
    tag: { type: String, required: true },
    registry: { type: String },
    size: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    parentId: { type: String },
    repoDigests: { type: [String], default: [] },
    labels: { type: Object, default: {} },
    containers: { type: [String], default: [] },
    virtualSize: { type: Number },
    shared: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);