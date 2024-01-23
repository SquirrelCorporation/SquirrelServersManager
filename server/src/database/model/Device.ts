import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export const DOCUMENT_NAME = 'Device';
export const COLLECTION_NAME = 'devices';
export default interface Device {
  _id: string;
  uuid: string;
  disabled?: boolean;
  hostname?: string;
  fqdn?: string;
  ip?: string;
  status: number;
  uptime?: number;
  osArch?: string;
  osPlatform?: string;
  osDistro?: string;
  osCodeName?: string;
  osKernel?: string;
  osLogoFile?: string;
  systemManufacturer?: string;
  systemModel?: string;
  systemVersion?: string;
  systemUuid?: string;
  systemSku?: string;
  systemVirtual?: boolean;
  cpuBrand?: string;
  cpuManufacturer?: string;
  cpuFamily?: string;
  agentVersion?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum DeviceStatus {
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
    fqdn: {
      type: Schema.Types.String,
      required: false,
    },
    ip: {
      type: Schema.Types.String,
      required: false,
      unique: true,
    },
    status: {
      type: Schema.Types.Number,
      default: DeviceStatus.REGISTERING,
      required: true,
    },
    osArch: {
      type: Schema.Types.String,
      required: false,
    },
    osDistro: {
      type: Schema.Types.String,
      required: false,
    },
    osPlatform: {
      type: Schema.Types.String,
      required: false,
    },
    osCodeName: {
      type: Schema.Types.String,
      required: false,
    },
    osKernel: {
      type: Schema.Types.String,
      required: false,
    },
    osLogoFile: {
      type: Schema.Types.String,
      required: false,
    },
    systemManufacturer: {
      type: Schema.Types.String,
      required: false,
    },
    systemModel: {
      type: Schema.Types.String,
      required: false,
    },
    systemVersion: {
      type: Schema.Types.String,
      required: false,
    },
    systemUuid: {
      type: Schema.Types.String,
      required: false,
    },
    systemSku: {
      type: Schema.Types.String,
      required: false,
    },
    systemVirtual: {
      type: Schema.Types.Boolean,
      required: false,
    },
    cpuBrand: {
      type: Schema.Types.String,
      required: false,
    },
    cpuManufacturer: {
      type: Schema.Types.String,
      required: false,
    },
    cpuFamily: {
      type: Schema.Types.String,
      required: false,
    },
    agentVersion: {
      type: Schema.Types.String,
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const DeviceModel = model<Device>(DOCUMENT_NAME, schema, COLLECTION_NAME);
