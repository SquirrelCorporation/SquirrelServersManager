import { Schema, model, Types } from 'mongoose';
import {v4 as uuidv4} from "uuid";
export const DOCUMENT_NAME = 'Device';
export const COLLECTION_NAME = 'devices';
export default interface Device {
  uuid: string;
  disabled?: boolean;
  hostname?: string;
  ip?: string;
  status: number;
  type?: string;
  uptime?: number;
  os_type?: string;
  os_arch?: string;
  os_platform?: string;
  os_original_name?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum Status {
  REGISTERING = 0,
  ONLINE = 1,
  OFFLINE = 2,
}


const schema = new Schema<Device>(
  {
    uuid: {
      type: Schema.Types.String,
      required: true,
      unique: true,
      default: uuidv4(),
    },
    disabled: {
      type: Schema.Types.Boolean,
      required: true,
      default: false,
    },
    hostname: {
      type: Schema.Types.String,
      required: false,
    },
    ip: {
      type: Schema.Types.String,
      required: false,
    },
    status: {
        type: Schema.Types.Number,
        default: Status.REGISTERING,
        required: true
      },
    type: {
      type: Schema.Types.String,
      required: false
    },
    os_type: {
      type: Schema.Types.String,
      required: false
    },
    os_arch: {
      type: Schema.Types.String,
      required: false
    },
    os_platform: {
      type: Schema.Types.String,
      required: false
    },
    os_original_name: {
      type: Schema.Types.String,
      required: false
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
    },
  },
  {
    versionKey: false,
  },
);

export const DeviceModel = model<Device>(DOCUMENT_NAME, schema, COLLECTION_NAME);
