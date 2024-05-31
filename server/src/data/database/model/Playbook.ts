import { Schema, model } from 'mongoose';

export const DOCUMENT_NAME = 'Playbook';
export const COLLECTION_NAME = 'playbooks';

export default interface Playbook {
  custom: boolean;
  name: string;
  extraVars: [{ extraVar: string; required: boolean }];
  playableInBatch?: boolean;
}

const schema = new Schema<Playbook>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
      unique: true,
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const PlaybookModel = model<Playbook>(DOCUMENT_NAME, schema, COLLECTION_NAME);
