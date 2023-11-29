import { Schema, model, Types } from 'mongoose';
import Device from "./Device";

export const DOCUMENT_NAME = 'DeviceStat';
export const COLLECTION_NAME = 'devicestats';

export default interface DeviceStat {
  device: Device;
  storageTotalGb?: string;
  storageUsedGb?: string;
  storageFreeGb?: string;
  storageUsedPercentage?: string;
  storageFreePercentage?: string;
  cpuUsage?: number;
  memTotalMb?: number;
  memTotalUsedMb?: number;
  memTotalFreeMb?: number;
  memUsedPercentage?: number;
  memFreePercentage?: number;
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
    storageTotalGb: {
      type: Schema.Types.String,
      required: false,
    },
    storageUsedGb: {
      type: Schema.Types.String,
      required: false,
    },
    storageFreeGb: {
      type: Schema.Types.String,
      required: false,
    },
    storageUsedPercentage: {
      type: Schema.Types.String,
      required: false,
    },
    storageFreePercentage: {
      type: Schema.Types.String,
      required: false,
    },
    cpuUsage: {
      type: Schema.Types.Number,
      required: false,
    },
    memTotalMb: {
      type: Schema.Types.Number,
      required: false,
    },
    memTotalUsedMb: {
      type: Schema.Types.Number,
      required: false,
    },
    memTotalFreeMb: {
      type: Schema.Types.Number,
      required: false,
    },
    memUsedPercentage: {
      type: Schema.Types.Number,
      required: false,
    },
    memFreePercentage: {
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
