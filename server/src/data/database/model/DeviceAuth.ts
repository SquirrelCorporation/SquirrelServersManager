import { Binary } from 'bson';
import { Schema, model } from 'mongoose';
import { SsmAnsible, SsmProxmox } from 'ssm-shared-lib';
import Device from './Device';

export const DOCUMENT_NAME = 'DeviceAuth';
export const COLLECTION_NAME = 'deviceauth';

export default interface DeviceAuth {
  device: Device;
  authType?: SsmAnsible.SSHType;
  sshUser?: string;
  sshPwd?: string;
  sshKey?: string;
  sshKeyPass?: string;
  sshPort?: number;
  sshConnection?: SsmAnsible.SSHConnection;
  becomeUser?: string;
  becomePass?: string;
  becomeMethod?: SsmAnsible.AnsibleBecomeMethod;
  becomeExe?: string;
  becomeFlags?: string;
  strictHostKeyChecking?: boolean;
  sshCommonArgs?: string;
  sshExecutable?: string;
  customDockerSSH?: boolean;
  dockerCustomAuthType?: SsmAnsible.SSHType;
  dockerCustomSshUser?: string;
  dockerCustomSshPwd?: string;
  dockerCustomSshKeyPass?: string;
  dockerCustomSshKey?: string;
  customDockerForcev6?: boolean;
  customDockerForcev4?: boolean;
  customDockerAgentForward?: boolean;
  customDockerTryKeyboard?: boolean;
  customDockerSocket?: string;
  proxmoxAuth?: {
    remoteConnectionMethod?: SsmProxmox.RemoteConnectionMethod;
    connectionMethod?: SsmProxmox.ConnectionMethod;
    ignoreSslErrors?: boolean;
    port?: number;
    userPwd?: {
      username?: string;
      password?: string;
    };
    tokens?: {
      tokenId?: string;
      tokenSecret?: string;
    };
  };
  createdAt?: Date;
  updatedAt?: Date;
  dockerKey?: Buffer | Binary | null;
  dockerCert?: Buffer | Binary | null;
  dockerCa?: Buffer | Binary | null;
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
      enum: SsmAnsible.SSHType,
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
    sshConnection: {
      type: Schema.Types.String,
      default: SsmAnsible.SSHConnection.PARAMIKO,
      enum: SsmAnsible.SSHConnection,
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
      enum: SsmAnsible.SSHType,
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
    dockerCa: {
      type: Schema.Types.Buffer,
      required: false,
    },
    dockerCert: {
      type: Schema.Types.Buffer,
      required: false,
    },
    dockerKey: {
      type: Schema.Types.Buffer,
      required: false,
    },
    proxmoxAuth: {
      remoteConnectionMethod: {
        type: Schema.Types.String,
        enum: SsmProxmox.RemoteConnectionMethod,
      },
      connectionMethod: {
        type: Schema.Types.String,
        enum: SsmProxmox.ConnectionMethod,
      },
      ignoreSslErrors: {
        type: Schema.Types.Boolean,
        default: false,
      },
      port: {
        type: Schema.Types.Number,
      },
      userPwd: {
        username: {
          type: Schema.Types.String,
        },
        password: {
          type: Schema.Types.String,
        },
      },
      tokens: {
        tokenId: {
          type: Schema.Types.String,
        },
        tokenSecret: {
          type: Schema.Types.String,
        },
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const DeviceAuthModel = model<DeviceAuth>(DOCUMENT_NAME, schema, COLLECTION_NAME);
