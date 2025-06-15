import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Binary } from 'bson';
import { SsmAnsible, SsmProxmox } from 'ssm-shared-lib';
import { Device } from './device.schema';

export type DeviceAuthDocument = DeviceAuth & Document;

export const DEVICE_AUTH = 'DeviceAuth';

@Schema({
  collection: 'deviceauth',
  timestamps: true,
  versionKey: false,
})
export class DeviceAuth {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Device',
    required: true,
    index: true,
    unique: true,
  })
  device!: Device;

  @Prop({
    type: String,
    enum: SsmAnsible.SSHType,
    required: true,
  })
  authType?: SsmAnsible.SSHType;

  @Prop({ type: String })
  sshUser?: string;

  @Prop({ type: String })
  sshPwd?: string;

  @Prop({ type: String })
  sshKey?: string;

  @Prop({ type: String })
  sshKeyPass?: string;

  @Prop({
    type: String,
    default: SsmAnsible.SSHConnection.PARAMIKO,
    enum: SsmAnsible.SSHConnection,
  })
  sshConnection?: SsmAnsible.SSHConnection;

  @Prop({ type: String })
  becomeUser?: string;

  @Prop({ type: String })
  becomePass?: string;

  @Prop({
    type: String,
    enum: SsmAnsible.AnsibleBecomeMethod,
  })
  becomeMethod?: SsmAnsible.AnsibleBecomeMethod;

  @Prop({ type: String })
  becomeExe?: string;

  @Prop({ type: String })
  becomeFlags?: string;

  @Prop({ type: Boolean })
  strictHostKeyChecking?: boolean;

  @Prop({ type: Number, required: true })
  sshPort?: number;

  @Prop({ type: String })
  sshCommonArgs?: string;

  @Prop({ type: String })
  sshExecutable?: string;

  @Prop({ type: Boolean, default: false })
  customDockerSSH?: boolean;

  @Prop({
    type: String,
    enum: SsmAnsible.SSHType,
  })
  dockerCustomAuthType?: SsmAnsible.SSHType;

  @Prop({ type: String })
  dockerCustomSshUser?: string;

  @Prop({ type: String })
  dockerCustomSshPwd?: string;

  @Prop({ type: String })
  dockerCustomSshKeyPass?: string;

  @Prop({ type: String })
  dockerCustomSshKey?: string;

  @Prop({ type: Boolean, default: false })
  customDockerForcev6?: boolean;

  @Prop({ type: Boolean, default: false })
  customDockerForcev4?: boolean;

  @Prop({ type: Boolean, default: false })
  customDockerAgentForward?: boolean;

  @Prop({ type: Boolean, default: false })
  customDockerTryKeyboard?: boolean;

  @Prop({ type: String })
  customDockerSocket?: string;

  @Prop({
    type: {
      remoteConnectionMethod: {
        type: String,
        enum: SsmProxmox.RemoteConnectionMethod,
      },
      connectionMethod: {
        type: String,
        enum: SsmProxmox.ConnectionMethod,
      },
      ignoreSslErrors: {
        type: Boolean,
        default: false,
      },
      port: {
        type: Number,
      },
      userPwd: {
        username: {
          type: String,
        },
        password: {
          type: String,
        },
      },
      tokens: {
        tokenId: {
          type: String,
        },
        tokenSecret: {
          type: String,
        },
      },
    },
  })
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

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: MongooseSchema.Types.Buffer })
  dockerKey?: Buffer | Binary | null;

  @Prop({ type: MongooseSchema.Types.Buffer })
  dockerCert?: Buffer | Binary | null;

  @Prop({ type: MongooseSchema.Types.Buffer })
  dockerCa?: Buffer | Binary | null;
}

export const DeviceAuthSchema = SchemaFactory.createForClass(DeviceAuth);
