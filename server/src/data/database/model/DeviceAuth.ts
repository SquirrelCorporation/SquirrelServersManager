import { Schema, model } from 'mongoose';
import { SSHType } from 'ssm-shared-lib/distribution/enums/ansible';
import Device from './Device';

export const DOCUMENT_NAME = 'DeviceAuth';
export const COLLECTION_NAME = 'deviceauth';

export default interface DeviceAuth {
  device: Device;
  authType?: SSHType;
  sshUser?: string;
  sshPwd?: string;
  sshKey?: string;
  sshPort?: number;
  becomePass?: string;
  becomeMethod?: string;
  becomeExe?: string;
  becomeFlags?: string;
  strictHostKeyChecking?: boolean;
  becomeUser?: string;
  sshCommonArgs?: string;
  sshExecutable?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<DeviceAuth>(
  {
    device: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
      select: true,
      index: true,
      unique: true,
    },
    authType: {
      type: Schema.Types.String,
      enum: SSHType,
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
    becomePass: {
      type: Schema.Types.String,
      required: false,
    },
    becomeMethod: {
      type: Schema.Types.String,
      required: false,
    },
    becomeUser: {
      type: Schema.Types.String,
      required: false,
    },
    strictHostKeyChecking: {
      type: Schema.Types.Boolean,
      required: false,
    },
    sshPort: {
      type: Schema.Types.Number,
      required: true,
    },
    sshCommonArgs: {
      type: Schema.Types.String,
      required: false,
    },
    sshExecutable: {
      type: Schema.Types.String,
      required: false,
    },
    becomeExe: {
      type: Schema.Types.String,
      required: false,
    },
    becomeFlags: {
      type: Schema.Types.String,
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const DeviceAuthModel = model<DeviceAuth>(DOCUMENT_NAME, schema, COLLECTION_NAME);
