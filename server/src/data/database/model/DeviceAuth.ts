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
  sshKeyPass?: string;
  sshPort?: number;
  becomePass?: string;
  becomeMethod?: string;
  becomeExe?: string;
  becomeFlags?: string;
  strictHostKeyChecking?: boolean;
  becomeUser?: string;
  sshCommonArgs?: string;
  sshExecutable?: string;
  customDockerSSH?: boolean;
  dockerCustomAuthType?: SSHType;
  dockerCustomSshUser?: string;
  dockerCustomSshPwd?: string;
  dockerCustomSshKeyPass?: string;
  dockerCustomSshKey?: string;
  customDockerForcev6?: boolean;
  customDockerForcev4?: boolean;
  customDockerAgentForward?: boolean;
  customDockerTryKeyboard?: boolean;
  customDockerSocket?: string;
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
    sshKeyPass: {
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
    customDockerSSH: {
      type: Schema.Types.Boolean,
      default: false,
    },
    customDockerAgentForward: {
      type: Schema.Types.Boolean,
      default: false,
    },
    customDockerForcev4: {
      type: Schema.Types.Boolean,
      default: false,
    },
    customDockerForcev6: {
      type: Schema.Types.Boolean,
      default: false,
    },
    customDockerTryKeyboard: {
      type: Schema.Types.Boolean,
      default: false,
    },
    dockerCustomAuthType: {
      type: Schema.Types.String,
      enum: SSHType,
      required: false,
    },
    dockerCustomSshKey: {
      type: Schema.Types.String,
      required: false,
    },
    dockerCustomSshKeyPass: {
      type: Schema.Types.String,
      required: false,
    },
    dockerCustomSshPwd: {
      type: Schema.Types.String,
      required: false,
    },
    dockerCustomSshUser: {
      type: Schema.Types.String,
      required: false,
    },
    customDockerSocket: {
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
