import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { SsmProxmox } from 'ssm-shared-lib';

export const PROXMOX_CONTAINER = 'ProxmoxContainer';

export type ProxmoxContainerDocument = ProxmoxContainer & Document;


@Schema({ timestamps: true, versionKey: false })
export class ProxmoxContainer {
  @Prop({ type: String, unique: true, required: true, default: uuidv4 })
  uuid!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Device', required: true, index: true })
  device: any;

  @Prop({ type: String })
  id!: string;

  @Prop({ type: String })
  name!: string;

  @Prop({ type: String })
  customName?: string;

  @Prop({ type: String })
  displayName?: string;

  @Prop({ type: String })
  displayIcon?: string;

  @Prop({ type: String, default: 'unknown' })
  status!: string;

  @Prop({ type: String })
  watcher!: string;

  @Prop({ type: String })
  node!: string;

  @Prop({ type: String })
  hostname?: string;

  @Prop({ type: String, enum: Object.values(SsmProxmox.ContainerType) })
  type!: SsmProxmox.ContainerType;

  @Prop({ type: Object })
  config!: any; // ProxmoxModel.nodesLxcConfigVmConfig | ProxmoxModel.nodesQemuConfigVmConfig;

  @Prop({ type: Object })
  interfaces?: any[]; // ProxmoxModel.nodesLxcInterfacesIp[];

  @Prop({ type: Number })
  vmid?: number;

  @Prop({ type: Number })
  cpus?: number;

  @Prop({ type: Number })
  maxmem?: number;

  @Prop({ type: Number })
  uptime?: number;

  @Prop({ type: Object })
  resources?: any;

  @Prop({ type: Object })
  snapshots?: any[];
}

export const ProxmoxContainerSchema = SchemaFactory.createForClass(ProxmoxContainer);