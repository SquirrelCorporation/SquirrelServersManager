import { Schema, model } from 'mongoose';
import Events from '../../../core/events/events';

export const DOCUMENT_NAME = 'Notification';
export const COLLECTION_NAME = 'notifications';

export default interface InAppNotification {
  message: string;
  severity: 'info' | 'warning' | 'error';
  event: Events;
  module: string;
  moduleId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  seen: boolean;
}

const schema = new Schema<InAppNotification>(
  {
    message: {
      type: Schema.Types.String,
      immutable: true,
      required: true,
    },
    severity: {
      type: Schema.Types.String,
      immutable: true,
      required: true,
    },
    event: {
      type: Schema.Types.String,
      immutable: true,
      required: true,
    },
    module: {
      type: Schema.Types.String,
      immutable: true,
      required: true,
    },
    moduleId: {
      type: Schema.Types.String,
      immutable: true,
      required: false,
    },
    seen: {
      type: Schema.Types.Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const InAppNotificationModel = model<InAppNotification>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);
