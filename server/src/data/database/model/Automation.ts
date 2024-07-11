import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export const DOCUMENT_NAME = 'Automations';
export const COLLECTION_NAME = 'automations';

export default interface Automation {
  _id?: string;
  uuid: string;
  name: string;
  enabled: boolean;
  automationChains: any;
  lastExecutionStatus?: 'success' | 'failed';
  lastExecutionTime?: Date;
}

const schema = new Schema<Automation>(
  {
    uuid: {
      type: Schema.Types.String,
      required: true,
      default: uuidv4,
    },
    name: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    automationChains: {
      type: Object,
      required: true,
    },
    lastExecutionTime: {
      type: Schema.Types.Date,
    },
    lastExecutionStatus: {
      type: Schema.Types.String,
    },
    enabled: {
      type: Schema.Types.Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
  },
);

export const AutomationModel = model<Automation>(DOCUMENT_NAME, schema, COLLECTION_NAME);
