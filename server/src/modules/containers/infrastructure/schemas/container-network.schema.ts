import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTimestampsConfig } from 'mongoose';

export const CONTAINER_NETWORK_SCHEMA = 'ContainerNetwork';

export type ContainerNetworkDocument = ContainerNetwork & Document & SchemaTimestampsConfig;

@Schema({ timestamps: true, versionKey: false })
export class ContainerNetwork {
  @Prop({ type: String, required: true })
  id!: string;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, required: true, default: 'unknown' })
  status!: string;

  @Prop({ type: String, required: true })
  watcher!: string;

  @Prop({
    type: String,
    required: true,
    index: true,
    ref: 'Device',
  })
  deviceUuid!: string;

  @Prop({ type: String })
  created!: string;

  @Prop({ type: String })
  driver!: string;

  @Prop({ type: String })
  scope!: string;

  @Prop({ type: Boolean })
  internal!: boolean;

  @Prop({ type: Boolean })
  attachable!: boolean;

  @Prop({ type: Boolean })
  ingress!: boolean;

  @Prop({ type: Boolean })
  enableIPv6!: boolean;

  @Prop({ type: Boolean })
  configOnly!: boolean;

  @Prop({ type: Object })
  ipam!: Record<string, any>;

  @Prop({ type: Object })
  options!: Record<string, any>;

  @Prop({ type: Object })
  labels!: Record<string, any>;

  @Prop({ type: Object })
  containers!: Record<string, any>;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;
}

export const ContainerNetworkSchema = SchemaFactory.createForClass(ContainerNetwork);

// Set up the relationship with Device model
ContainerNetworkSchema.virtual('device', {
  ref: 'Device',
  localField: 'deviceUuid',
  foreignField: 'uuid',
  justOne: true,
});
