import { IPAM, NetworkContainer } from 'dockerode';
import { Schema, model } from 'mongoose';
import Device from './Device';

export const DOCUMENT_NAME = 'ContainerNetwork';
export const COLLECTION_NAME = 'containernetworks';

export default interface ContainerNetwork {
  name: string;
  status: string;
  watcher: string;
  id: string;
  device?: Device;
  created: string;
  scope: string;
  driver: string;
  enableIPv6: boolean;
  ipam?: IPAM | undefined;
  internal: boolean;
  attachable: boolean;
  ingress: boolean;
  configFrom?: { Network: string } | undefined;
  configOnly: boolean;
  containers?: { [id: string]: NetworkContainer } | undefined;
  options?: { [key: string]: string } | undefined;
  labels?: { [key: string]: string } | undefined;
}

const schema = new Schema<ContainerNetwork>({
  name: {
    type: Schema.Types.String,
  },
  status: {
    type: Schema.Types.String,
    required: true,
    default: 'unknown',
  },
  watcher: {
    type: Schema.Types.String,
    required: true,
  },
  id: {
    type: Schema.Types.String,
    required: true,
  },
  device: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
    select: true,
    index: true,
  },
  created: {
    type: Schema.Types.String,
  },
  scope: {
    type: Schema.Types.String,
  },
  driver: {
    type: Schema.Types.String,
  },
  enableIPv6: {
    type: Schema.Types.Boolean,
  },
  ipam: {
    type: Object,
    required: false,
  },
  internal: {
    type: Schema.Types.Boolean,
  },
  attachable: {
    type: Schema.Types.Boolean,
  },
  ingress: {
    type: Schema.Types.Boolean,
  },
  configFrom: {
    type: Object,
    required: false,
  },
  configOnly: {
    type: Schema.Types.Boolean,
  },
  containers: {
    type: Object,
  },
  options: {
    type: Object,
  },
  labels: {
    type: Object,
  },
});

export const ContainerNetworkModel = model<ContainerNetwork>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);
