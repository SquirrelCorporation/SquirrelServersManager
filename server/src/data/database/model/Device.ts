import { Schema, model } from 'mongoose';
import { API, SsmStatus } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';

export const DOCUMENT_NAME = 'Device';
export const COLLECTION_NAME = 'devices';

export default interface Device {
  _id: string;
  uuid: string;
  disabled?: boolean;
  dockerWatcher?: boolean;
  dockerWatcherCron?: string;
  dockerStatsWatcher?: boolean;
  dockerStatsCron?: string;
  dockerEventsWatcher?: boolean;
  dockerVersion?: string;
  dockerId?: string;
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
  cpuSpeed?: number;
  mem?: number;
  agentVersion?: string;
  versions?: API.VersionData;
  raspberry?: API.RaspberryRevisionData;
  createdAt?: Date;
  updatedAt?: Date;
  agentLogPath?: string;
  agentType?: 'node' | 'docker';
}

const schema = new Schema<Device>(
  {
    uuid: {
      type: Schema.Types.String,
      required: true,
      unique: true,
      default: uuidv4,
    },
    disabled: {
      type: Schema.Types.Boolean,
      required: true,
      default: false,
    },
    dockerWatcher: {
      type: Schema.Types.Boolean,
      required: true,
      default: true,
    },
    dockerWatcherCron: {
      type: Schema.Types.String,
      required: true,
      default: '0 * * * *',
    },
    dockerStatsCron: {
      type: Schema.Types.String,
      required: true,
      default: '0 * * * *',
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
      default: SsmStatus.DeviceStatus.REGISTERING,
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
    cpuSpeed: {
      type: Schema.Types.Number,
      required: false,
    },
    mem: {
      type: Schema.Types.Number,
      required: false,
    },
    agentVersion: {
      type: Schema.Types.String,
      required: false,
    },
    versions: {
      type: Object,
      required: false,
    },
    raspberry: {
      type: Object,
      required: false,
    },
    dockerVersion: {
      type: Schema.Types.String,
      required: false,
    },
    dockerId: {
      type: Schema.Types.String,
      required: false,
    },
    dockerStatsWatcher: {
      type: Schema.Types.Boolean,
      required: true,
      default: true,
    },
    dockerEventsWatcher: {
      type: Schema.Types.Boolean,
      required: true,
      default: true,
    },
    agentLogPath: {
      type: Schema.Types.String,
      required: false,
    },
    agentType: {
      type: Schema.Types.String,
      required: false,
      default: 'node',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const DeviceModel = model<Device>(DOCUMENT_NAME, schema, COLLECTION_NAME);
