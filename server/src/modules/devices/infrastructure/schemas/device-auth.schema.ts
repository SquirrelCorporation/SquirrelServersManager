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

  @Prop()
  sshUser?: string;

  @Prop()
  sshPwd?: string;

  @Prop()
  sshKey?: string;

  @Prop()
  sshKeyPass?: string;

  @Prop({
    type: String,
    default: SsmAnsible.SSHConnection.PARAMIKO,
    enum: SsmAnsible.SSHConnection,
  })
  sshConnection?: SsmAnsible.SSHConnection;

  @Prop()
  becomeUser?: string;

  @Prop()
  becomePass?: string;

  @Prop({
    type: String,
    enum: SsmAnsible.AnsibleBecomeMethod,
  })
  becomeMethod?: SsmAnsible.AnsibleBecomeMethod;

  @Prop()
  becomeExe?: string;

  @Prop()
  becomeFlags?: string;

  @Prop()
  strictHostKeyChecking?: boolean;

  @Prop({ required: true })
  sshPort?: number;

  @Prop()
  sshCommonArgs?: string;

  @Prop()
  sshExecutable?: string;

  @Prop({ default: false })
  customDockerSSH?: boolean;

  @Prop({
    type: String,
    enum: SsmAnsible.SSHType,
  })
  dockerCustomAuthType?: SsmAnsible.SSHType;

  @Prop()
  dockerCustomSshUser?: string;

  @Prop()
  dockerCustomSshPwd?: string;

  @Prop()
  dockerCustomSshKeyPass?: string;

  @Prop()
  dockerCustomSshKey?: string;

  @Prop({ default: false })
  customDockerForcev6?: boolean;

  @Prop({ default: false })
  customDockerForcev4?: boolean;

  @Prop({ default: false })
  customDockerAgentForward?: boolean;

  @Prop({ default: false })
  customDockerTryKeyboard?: boolean;

  @Prop()
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

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop({ type: MongooseSchema.Types.Buffer })
  dockerKey?: Buffer | Binary | null;

  @Prop({ type: MongooseSchema.Types.Buffer })
  dockerCert?: Buffer | Binary | null;

  @Prop({ type: MongooseSchema.Types.Buffer })
  dockerCa?: Buffer | Binary | null;
}

export const DeviceAuthSchema = SchemaFactory.createForClass(DeviceAuth);
