import { Schema } from 'mongoose';

/**
 * Schema name constant for DI
 */
export const CONTAINER_VOLUME = 'ContainerVolume';

/**
 * Mongoose schema for container volumes
 */
export const ContainerVolumeSchema = new Schema(
  {
    id: { type: String, required: true },
    uuid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    deviceUuid: { type: String, required: true },
    driver: { type: String, required: true },
    scope: { type: String, required: true },
    mountpoint: { type: String, required: true },
    driver_opts: { type: Object, default: {} },
    options: { type: Object, default: {} },
    labels: { type: Object, default: {} },
    usage: {
      size: { type: Number, default: 0 },
      refCount: { type: Number, default: 0 },
    },
    containers: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);