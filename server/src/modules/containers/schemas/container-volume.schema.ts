import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export const CONTAINER_VOLUME = 'ContainerVolume';

export type ContainerVolumeDocument = ContainerVolume & Document;

@Schema({ timestamps: true })
export class ContainerVolume {
  @Prop({ type: String, default: uuidv4, required: true, unique: true })
  uuid!: string;

  @Prop({ type: String })
  name!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Device', required: true, index: true })
  device: any;

  @Prop({ type: String, required: true })
  watcher!: string;

  @Prop({ type: String, required: false })
  driver?: string;

  @Prop({ type: String, required: false })
  mountPoint?: string;

  @Prop({ type: String, required: true, default: 'unknown' })
  status!: string;

  @Prop({ type: Object, required: false })
  labels?: { [p: string]: string };

  @Prop({ type: String, required: false, enum: ['local', 'global'] })
  scope?: 'local' | 'global';

  @Prop({ type: Object, required: false })
  options?: { [p: string]: string } | null;

  @Prop({ type: Object, required: false })
  usageData?: { Size: number; RefCount: number } | null;
}

export const ContainerVolumeSchema = SchemaFactory.createForClass(ContainerVolume);
