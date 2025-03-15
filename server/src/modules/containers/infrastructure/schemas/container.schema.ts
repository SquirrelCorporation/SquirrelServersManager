import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { SSMServicesTypes } from '../../../../types/typings';

export const CONTAINER_SCHEMA = 'Container';

export type ContainerDocument = Container & Document;

@Schema({ timestamps: true, versionKey: false })
export class Container {
  @Prop({ type: String, required: true })
  uuid!: string;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, required: true })
  deviceUuid!: string;

  @Prop({ type: String, required: true })
  image!: string;

  @Prop({ type: String })
  customName?: string;

  @Prop({ type: String })
  shortId?: string;

  @Prop({ type: String, default: 'unknown' })
  state?: string;

  @Prop({ type: String, default: 'unknown' })
  status?: string;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Object })
  labels?: Record<string, string>;

  @Prop({ type: Object })
  hostConfig?: any;

  @Prop({ type: String })
  networkMode?: string;

  @Prop({ type: Object })
  networks?: Record<string, any>;

  @Prop({ type: Array })
  mounts?: any[];

  @Prop({ type: String })
  command?: string;

  @Prop({ type: Object })
  ports?: Record<string, any>;

  @Prop({ type: Object })
  containerConfig?: SSMServicesTypes.ContainerConfig;

  @Prop({ type: String })
  restart?: string;

  @Prop({ type: String })
  timestamp?: string;

  @Prop({ type: [String], default: [] })
  watchers?: string[];

  @Prop({ type: Object })
  stats?: any;

  @Prop({ type: String })
  kind?: string;

  @Prop({ type: [String] })
  env?: string[];

  @Prop({ type: Boolean, default: false })
  oomKilled?: boolean;

  @Prop({ type: Boolean, default: true })
  isManaged?: boolean;

  @Prop({ type: Boolean, default: true })
  isWatched?: boolean;
}

export const ContainerSchema = SchemaFactory.createForClass(Container);

// Add indexes for performance
ContainerSchema.index({ uuid: 1 }, { unique: true });
ContainerSchema.index({ deviceUuid: 1 });
ContainerSchema.index({ watchers: 1 });
ContainerSchema.index({ status: 1 });
ContainerSchema.index({ state: 1 });