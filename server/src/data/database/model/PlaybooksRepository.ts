import { Schema, model } from 'mongoose';
import { Repositories, SsmGit } from 'ssm-shared-lib';

export const DOCUMENT_NAME = 'PlaybooksRepository';
export const COLLECTION_NAME = 'playbooksrepository';

export interface CustomVault {
  vaultId: string;
  password: string;
}

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
  tree?: any;
  directoryExclusionList?: string[];
  onError?: boolean;
  onErrorMessage?: string;
  gitService?: SsmGit.Services;
  vaults?: CustomVault[];
  createdAt?: Date;
  updatedAt?: Date;
}

const vaultSchema = new Schema(
  {
    vaultId: {
      type: Schema.Types.String,
      required: true,
    },
    password: {
      type: Schema.Types.String,
      required: true,
    },
  },
  { _id: false },
);

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
    vaults: {
      type: [vaultSchema], // Array of vault schemas
      required: false,
      default: undefined,
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
