import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Device from './Device';

export const DOCUMENT_NAME = 'ContainerVolume';
export const COLLECTION_NAME = 'containervolumes';

export default interface ContainerVolume {
  uuid: string;
  name: string;
  device: Device;
  watcher: string;
  driver: string;
  mountPoint: string;
  status?: { [p: string]: string } | undefined;
  labels: { [p: string]: string };
  scope: 'local' | 'global';
  options: { [p: string]: string } | null;
  usageData?: { Size: number; RefCount: number } | null | undefined;
}

const schema = new Schema<ContainerVolume>({
  uuid: {
    type: Schema.Types.String,
    default: uuidv4,
    required: true,
    unique: true,
  },
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
  device: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
    select: true,
    index: true,
  },
  mountPoint: {
    type: Schema.Types.String,
  },
  scope: {
    type: Schema.Types.String,
  },
  driver: {
    type: Schema.Types.String,
  },
  options: {
    type: Object,
  },
  labels: {
    type: Object,
  },
  usageData: {
    type: Object,
  },
});

export const ContainerVolumeModel = model<ContainerVolume>(DOCUMENT_NAME, schema, COLLECTION_NAME);
