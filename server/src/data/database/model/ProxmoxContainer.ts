import { Schema, model } from 'mongoose';
import { ProxmoxModel, SsmProxmox } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import Device from './Device';

export const DOCUMENT_NAME = 'ProxmoxContainer';
export const COLLECTION_NAME = 'proxmox-containers';

export default interface ProxmoxContainer {
  uuid?: string;
  device?: Device;
  id: string;
  name: string;
  customName?: string;
  displayName?: string;
  displayIcon?: string;
  status: string;
  watcher: string;
  node: string;
  hostname?: string;
  type: SsmProxmox.ContainerType;
  config: ProxmoxModel.nodesLxcConfigVmConfig | ProxmoxModel.nodesQemuConfigVmConfig;
  interfaces?: ProxmoxModel.nodesLxcInterfacesIp[];
}

const schema = new Schema<ProxmoxContainer>(
  {
    device: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
      select: true,
      index: true,
    },
    uuid: {
      type: Schema.Types.String,
      unique: true,
      required: true,
      default: uuidv4,
    },
    customName: {
      type: Schema.Types.String,
    },
    node: {
      type: Schema.Types.String,
    },
    id: {
      type: Schema.Types.String,
    },
    name: {
      type: Schema.Types.String,
    },
    hostname: {
      type: Schema.Types.String,
    },
    displayIcon: {
      type: Schema.Types.String,
    },
    displayName: {
      type: Schema.Types.String,
    },
    status: {
      type: Schema.Types.String,
      default: 'unknown',
    },
    watcher: {
      type: Schema.Types.String,
    },
    type: {
      type: Schema.Types.String,
      enum: SsmProxmox.ContainerType,
    },
    config: {
      type: Object,
    },
    interfaces: {
      type: Object,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const ProxmoxContainerModel = model<ProxmoxContainer>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);
