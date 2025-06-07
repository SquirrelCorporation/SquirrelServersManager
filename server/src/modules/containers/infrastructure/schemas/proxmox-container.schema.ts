import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ProxmoxModel, SsmProxmox } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';

export type ProxmoxContainerDocument = ProxmoxContainer & Document;

@Schema({
  timestamps: true,
  versionKey: false,
  collection: 'proxmox-containers',
})
export class ProxmoxContainer {
  @Prop({
    type: String,
    unique: true,
    required: true,
    default: uuidv4,
  })
  uuid!: string;

  // Reference to the Device schema
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
    index: true,
  })
  deviceUuid!: string;

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

  @Prop({ type: String, enum: SsmProxmox.ContainerType })
  type!: SsmProxmox.ContainerType;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  config!: ProxmoxModel.nodesLxcConfigVmConfig | ProxmoxModel.nodesQemuConfigVmConfig;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  interfaces?: ProxmoxModel.nodesLxcInterfacesIp[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const ProxmoxContainerSchema = SchemaFactory.createForClass(ProxmoxContainer);

// Set up the relationship with Device model
ProxmoxContainerSchema.virtual('device', {
  ref: 'Device',
  localField: 'deviceUuid',
  foreignField: 'uuid',
  justOne: true,
});

// Define and export the injection token
export const PROXMOX_CONTAINER_MODEL_TOKEN = ProxmoxContainer.name; // e.g., 'ProxmoxContainer'

// Optional: Add compound indexes if needed
// ProxmoxContainerSchema.index({ device: 1, id: 1 }, { unique: true }); // Example
