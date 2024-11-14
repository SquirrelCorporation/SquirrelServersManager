import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Repositories } from 'ssm-shared-lib';
import ContainerCustomStackRepository from './ContainerCustomStackRepository';

export const DOCUMENT_NAME = 'ContainerCustomStack';
export const COLLECTION_NAME = 'containercustomstacks';

export default interface ContainerCustomStack {
  uuid?: string;
  icon?: string;
  iconColor?: string;
  iconBackgroundColor?: string;
  name: string;
  json?: any;
  yaml: string;
  rawStackValue?: any;
  lockJson: boolean;
  type: Repositories.RepositoryType;
  path?: string;
  containerCustomStackRepository?: ContainerCustomStackRepository;
}

const schema = new Schema<ContainerCustomStack>(
  {
    uuid: {
      type: Schema.Types.String,
      required: true,
      unique: true,
      default: uuidv4,
    },
    name: {
      type: Schema.Types.String,
    },
    json: {
      type: Object,
    },
    yaml: {
      type: Schema.Types.String,
    },
    rawStackValue: {
      type: Object,
    },
    lockJson: {
      type: Schema.Types.Boolean,
      default: false,
    },
    icon: {
      type: Schema.Types.String,
    },
    iconColor: {
      type: Schema.Types.String,
    },
    iconBackgroundColor: {
      type: Schema.Types.String,
    },
    path: {
      type: Schema.Types.String,
    },
    type: {
      type: Schema.Types.String,
      required: true,
      default: Repositories.RepositoryType.LOCAL,
    },
    containerCustomStackRepository: {
      type: Schema.Types.ObjectId,
      ref: 'ContainerCustomStackRepository',
      required: false,
      select: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const ContainerCustomStackModel = model<ContainerCustomStack>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);
