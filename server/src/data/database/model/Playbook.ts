import { model, Schema } from 'mongoose';
import { SsmAnsible } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import PlaybooksRepository from './PlaybooksRepository';

export const DOCUMENT_NAME = 'Playbook';
export const COLLECTION_NAME = 'playbooks';

export default interface Playbook {
  custom: boolean;
  uuid?: string;
  name: string;
  path: string;
  extraVars?: [{ extraVar: string; required: boolean; type: SsmAnsible.ExtraVarsType }];
  playableInBatch?: boolean;
  playbooksRepository?: PlaybooksRepository;
  uniqueQuickRef?: string;
}

const schema = new Schema<Playbook>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
    },
    uuid: {
      type: Schema.Types.String,
      default: uuidv4,
      required: true,
      unique: true,
    },
    uniqueQuickRef: {
      type: Schema.Types.String,
      unique: true,
      sparse: true,
    },
    path: {
      type: Schema.Types.String,
      required: true,
    },
    playableInBatch: {
      type: Schema.Types.Boolean,
      default: true,
    },
    custom: {
      type: Schema.Types.Boolean,
      required: true,
      default: true,
    },
    extraVars: {
      type: [Object],
      required: false,
    },
    playbooksRepository: {
      type: Schema.Types.ObjectId,
      ref: 'PlaybooksRepository',
      required: true,
      select: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const PlaybookModel = model<Playbook>(DOCUMENT_NAME, schema, COLLECTION_NAME);
