import { Schema, model, Types } from 'mongoose';
import Device from "./Device";

export const DOCUMENT_NAME = 'DeviceStat';
export const COLLECTION_NAME = 'devicestats';

export default interface DeviceStat {
  device: Device;
  storage_total_gb?: string;
  storage_used_gb?: string;
  storage_free_gb?: string;
  storage_used_percentage?: string;
  storage_free_percentage?: string;
  cpu_usage?: number;
  mem_total_mb?: number;
  mem_total_used_mb?: number;
  mem_total_free_mb?: number;
  mem_used_percentage?: number;
  mem_free_percentage?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<DeviceStat>(
  {
    device: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
      select: false,
      index: true,
    },
    storage_total_gb: {
      type: Schema.Types.String,
      required: false,
    },
    storage_used_gb: {
      type: Schema.Types.String,
      required: false,
    },
    storage_free_gb: {
      type: Schema.Types.String,
      required: false,
    },
    storage_used_percentage: {
      type: Schema.Types.String,
      required: false,
    },
    storage_free_percentage: {
      type: Schema.Types.String,
      required: false,
    },
    cpu_usage: {
      type: Schema.Types.Number,
      required: false,
    },
    mem_total_mb: {
      type: Schema.Types.Number,
      required: false,
    },
    mem_total_used_mb: {
      type: Schema.Types.Number,
      required: false,
    },
    mem_total_free_mb: {
      type: Schema.Types.Number,
      required: false,
    },
    mem_used_percentage: {
      type: Schema.Types.Number,
      required: false,
    },
    mem_free_percentage: {
      type: Schema.Types.Number,
      required: false,
    },
    createdAt: {
      type: Date,
      required: true,
      default: new Date()
    },
    updatedAt: {
      type: Date,
      required: true,
      default: new Date()
    }
  },
  {
    versionKey: false,
  },
);

export const DeviceStatModel = model<DeviceStat>(DOCUMENT_NAME, schema, COLLECTION_NAME);
