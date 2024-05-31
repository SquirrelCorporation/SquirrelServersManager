import { Schema, model } from 'mongoose';
import Device from './Device';

export const DOCUMENT_NAME = 'DeviceDownTimeEvent';
export const COLLECTION_NAME = 'devicedowntimeevent';

export default interface DeviceDownTimeEvent {
  device: Device;
  finishedAt?: Date;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<DeviceDownTimeEvent>(
  {
    device: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
      select: true,
      index: true,
    },
    finishedAt: {
      type: Schema.Types.Date,
      required: false,
    },
    duration: {
      type: Schema.Types.Number,
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const DeviceDownTimeEventModel = model<DeviceDownTimeEvent>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);
