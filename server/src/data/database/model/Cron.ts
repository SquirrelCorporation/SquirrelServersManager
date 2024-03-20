import {model, Schema} from "mongoose";

export const DOCUMENT_NAME = 'Cron';
export const COLLECTION_NAME = 'crons';

export default interface Cron {
  name: string;
  disabled?: boolean;
  lastExecution?: Date;
  expression?: string;
}

const schema = new Schema<Cron>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    disabled: {
      type: Schema.Types.Boolean,
      required: true,
      default: false,
    },
    lastExecution: {
      type: Schema.Types.Date,
      required: false,
    },
    expression: {
      type: Schema.Types.String,
      required: true,
    },
  },
  {
    versionKey: false,
  },
);

export const CronModel = model<Cron>(DOCUMENT_NAME, schema, COLLECTION_NAME);
