import { Schema, model } from 'mongoose';
import mongooseAutopopulate from 'mongoose-autopopulate';
import { Repositories, SsmGit } from 'ssm-shared-lib';
import { AnsibleVault } from './AnsibleVault';

export const DOCUMENT_NAME = 'PlaybooksRepository';
export const COLLECTION_NAME = 'playbooksrepository';

export default interface PlaybooksRepository {
  _id?: string;
  uuid: string;
  type: Repositories.RepositoryType;
  name: string;
  accessToken?: string;
  branch?: string;
  email?: string;
  userName?: string;
  remoteUrl?: string;
  directory?: string;
  enabled: boolean;
  default?: boolean;
  ignoreSSLErrors?: boolean;
  tree?: any;
  directoryExclusionList?: string[];
  onError?: boolean;
  onErrorMessage?: string;
  gitService?: SsmGit.Services;
  vaults?: AnsibleVault[] | string[];
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
    directoryExclusionList: {
      type: Schema.Types.Array,
      default: [
        'production',
        'staging',
        'group_vars',
        'host_vars',
        'library',
        'module_utils',
        'filters_plugin',
        'roles',
        'inventories',
      ],
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
      required: false,
    },
    ignoreSSLErrors: {
      type: Schema.Types.Boolean,
      default: false,
    },
    vaults: [
      {
        type: Schema.Types.ObjectId,
        ref: 'AnsibleVault', // References the AnsibleVault model
        required: false,
        autopopulate: true, // This is the key part
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

schema.plugin(mongooseAutopopulate);

export const PlaybooksRepositoryModel = model<PlaybooksRepository>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);
