import { model, Schema } from 'mongoose';
import Device from './Device';

export const DOCUMENT_NAME = 'SecurityTestResult';
export const COLLECTION_NAME = 'securitytestresults';

export default interface SecurityTestResult {
  id: string;
  name: string;
  category: string;
  result: {
    status?: string;
    message?: string;
    details?: string;
  };
  duration: number;
  device: Device;
  priority: string;
}

const schema = new Schema<SecurityTestResult>(
  {
    id: {
      type: Schema.Types.String,
      required: true,
    },
    name: {
      type: Schema.Types.String,
      required: true,
    },
    category: {
      type: Schema.Types.String,
      required: true,
    },
    duration: {
      type: Schema.Types.Number,
      required: true,
    },
    result: {
      status: {
        type: Schema.Types.String,
        required: true,
      },
      message: {
        type: Schema.Types.String,
      },
      details: {
        type: Schema.Types.String,
      },
    },
    priority: {
      type: Schema.Types.String,
    },
    device: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
      select: true,
      index: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const SecurityTestResultModel = model<SecurityTestResult>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);
