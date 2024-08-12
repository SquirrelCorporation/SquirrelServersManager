import { Schema, model } from 'mongoose';
import Device from './Device';

export const DOCUMENT_NAME = 'ContainerImage';
export const COLLECTION_NAME = 'containerimages';

export default interface ContainerImage {
  id: string;
  watcher: string;
  device: Device;
  parentId: string;
  repoTags: string[] | undefined;
  repoDigests?: string[] | undefined;
  created: number;
  size: number;
  virtualSize: number;
  sharedSize: number;
  labels: { [p: string]: string };
  containers: number;
}

const schema = new Schema<ContainerImage>({
  id: {
    type: Schema.Types.String,
    required: true,
  },
  parentId: {
    type: Schema.Types.String,
  },
  repoTags: {
    type: Schema.Types.Array,
  },
  repoDigests: {
    type: Schema.Types.Array,
  },
  created: {
    type: Schema.Types.Number,
  },
  size: {
    type: Schema.Types.Number,
  },
  virtualSize: {
    type: Schema.Types.Number,
  },
  sharedSize: {
    type: Schema.Types.Number,
  },
  containers: {
    type: Schema.Types.Number,
  },
  labels: {
    type: Object,
  },
  device: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
    select: true,
    index: true,
  },
});

export const ContainerImageModel = model<ContainerImage>(DOCUMENT_NAME, schema, COLLECTION_NAME);
