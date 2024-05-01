import { Schema, model } from 'mongoose';

export const DOCUMENT_NAME = 'ContainerRegistry';
export const COLLECTION_NAME = 'containerregistries';

export default interface ContainerRegistry {
  name: string;
  auth?: any;
  authScheme: any;
  provider: string;
  authSet: boolean;
  canAuth: boolean;
}

const schema = new Schema<ContainerRegistry>({
  name: {
    type: Schema.Types.String,
  },
  authScheme: {
    type: Object,
  },
  auth: {
    type: Object,
  },
  provider: {
    type: Schema.Types.String,
  },
  authSet: {
    type: Schema.Types.Boolean,
    default: false,
  },
  canAuth: {
    type: Schema.Types.Boolean,
    default: false,
  },
});

export const ContainerRegistryModel = model<ContainerRegistry>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);
