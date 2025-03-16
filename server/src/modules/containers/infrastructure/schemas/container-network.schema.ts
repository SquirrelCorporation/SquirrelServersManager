import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const CONTAINER_NETWORK_SCHEMA = 'ContainerNetwork';

export type ContainerNetworkDocument = ContainerNetwork & Document;

@Schema({ timestamps: true, versionKey: false })
export class ContainerNetwork {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true, unique: true })
  uuid: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  deviceUuid: string;

  @Prop({ type: String, required: true })
  driver: string;

  @Prop({ type: String, required: true })
  scope: string;

  @Prop({ type: Boolean, default: false })
  internal: boolean;

  @Prop({ type: Boolean, default: false })
  attachable: boolean;

  @Prop({ type: Boolean, default: false })
  ingress: boolean;

  @Prop({ type: Object, default: {} })
  ipam: Record<string, any>;

  @Prop({ type: Object, default: {} })
  options: Record<string, any>;

  @Prop({ type: Object, default: {} })
  labels: Record<string, any>;

  @Prop({ type: [String], default: [] })
  containers: string[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const ContainerNetworkSchema = SchemaFactory.createForClass(ContainerNetwork);