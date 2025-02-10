import { Schema, model } from 'mongoose';

export const DOCUMENT_NAME = 'Log';
export const COLLECTION_NAME = 'logs';

export default interface Logs {
  level: number;
  time: Date;
  pid: number;
  hostname: string;
  msg: string;
  req: any;
  res: any;
  err: any;
}

const schema = new Schema<Logs>(
  {
    level: {
      type: Schema.Types.Number,
      immutable: true,
      required: false,
    },
    time: {
      type: Schema.Types.Date,
      immutable: true,
      required: false,
    },
    pid: {
      type: Schema.Types.Number,
      immutable: true,
      required: false,
    },
    hostname: {
      type: Schema.Types.String,
      immutable: true,
      required: false,
    },
    msg: {
      type: Schema.Types.String,
      immutable: true,
      required: false,
    },
    req: {
      type: Object,
      immutable: true,
      required: false,
    },
    res: {
      type: Object,
      immutable: true,
      required: false,
    },
    err: {
      type: Object,
      immutable: true,
      required: false,
    },
  },
  {
    versionKey: false,
  },
);

export const LogsModel = model<Logs>(DOCUMENT_NAME, schema, COLLECTION_NAME);
