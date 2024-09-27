import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export const DOCUMENT_NAME = 'ContainerCustomStack';
export const COLLECTION_NAME = 'containercustomstacks';

export default interface ContainerCustomStack {
  uuid?: string;
  icon?: string;
  iconColor?: string;
  iconBackgroundColor?: string;
  name: string;
  json: any;
  yaml: string;
  rawStackValue: any;
  lockJson: boolean;
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
      unique: true,
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
