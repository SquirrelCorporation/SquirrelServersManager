import { Schema, model } from 'mongoose';
import { SsmGit } from 'ssm-shared-lib';

export const DOCUMENT_NAME = 'ContainerCustomStackRepository';
export const COLLECTION_NAME = 'containercustomstackssrepository';

export default interface ContainerCustomStackRepository {
  _id?: string;
  uuid: string;
  name: string;
  accessToken: string;
  branch: string;
  email: string;
  userName: string;
  remoteUrl: string;
  enabled: boolean;
  matchesList?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  onError?: boolean;
  onErrorMessage?: string;
  gitService: SsmGit.Services;
  ignoreSSLErrors?: boolean;
}

const schema = new Schema<ContainerCustomStackRepository>(
  {
    uuid: {
      type: Schema.Types.String,
      required: true,
      unique: true,
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
    enabled: {
      type: Schema.Types.Boolean,
      required: true,
      default: true,
    },
    matchesList: {
      type: Schema.Types.Array,
    },
    onError: {
      type: Schema.Types.Boolean,
      default: false,
    },
    onErrorMessage: {
      type: Schema.Types.String,
      required: false,
    },
    gitService: {
      type: Schema.Types.String,
      required: true,
    },
    ignoreSSLErrors: {
      type: Schema.Types.Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const ContainerCustomStacksRepositoryModel = model<ContainerCustomStackRepository>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);
