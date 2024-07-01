import { Schema, model } from 'mongoose';
import { Playbooks } from 'ssm-shared-lib';

export const DOCUMENT_NAME = 'PlaybooksRepository';
export const COLLECTION_NAME = 'playbooksrepository';

export default interface PlaybooksRepository {
  _id?: string;
  uuid: string;
  type: Playbooks.PlaybooksRepositoryType;
  name: string;
  accessToken?: string;
  branch?: string;
  email?: string;
  userName?: string;
  remoteUrl?: string;
  directory?: string;
  enabled: boolean;
  default?: boolean;
  tree?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<PlaybooksRepository>(
  {
    uuid: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    type: {
      type: Schema.Types.String,
      required: true,
    },
    default: {
      type: Schema.Types.Boolean,
      required: true,
      default: false,
    },
    name: {
      type: Schema.Types.String,
      required: true,
    },
    accessToken: {
      type: Schema.Types.String,
      required: false,
    },
    branch: {
      type: Schema.Types.String,
      required: false,
    },
    email: {
      type: Schema.Types.String,
      required: false,
    },
    userName: {
      type: Schema.Types.String,
      required: false,
    },
    remoteUrl: {
      type: Schema.Types.String,
      required: false,
    },
    directory: {
      type: Schema.Types.String,
      required: true,
    },
    enabled: {
      type: Schema.Types.Boolean,
      required: true,
      default: true,
    },
    tree: {
      type: Object,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const PlaybooksRepositoryModel = model<PlaybooksRepository>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);
