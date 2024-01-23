import { Schema, model } from 'mongoose';
import Device from './Device';
import { fieldEncryption } from 'mongoose-field-encryption';
export const DOCUMENT_NAME = 'DeviceAuth';
export const COLLECTION_NAME = 'deviceauth';

export default interface DeviceAuth {
  device: Device;
  type?: string;
  sshUser?: string;
  sshPwd?: string;
  sshKey?: string;
  sshPort?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<DeviceAuth>(
  {
    device: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
      select: false,
      index: true,
      unique: true,
    },
    type: {
      type: Schema.Types.String,
      enum: ['userPwd', 'keyBased'],
      required: true,
    },
    sshUser: {
      type: Schema.Types.String,
      required: false,
    },
    sshPwd: {
      type: Schema.Types.String,
      required: false,
    },
    sshKey: {
      type: Schema.Types.String,
      required: false,
    },
    sshPort: {
      type: Schema.Types.Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

schema.plugin(fieldEncryption, {
  fields: ['sshUser', 'sshPwd', 'sshKey'],
  secret: 'some secret key',
});

export const DeviceAuthModel = model<DeviceAuth>(DOCUMENT_NAME, schema, COLLECTION_NAME);
