import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTimestampsConfig } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * Schema name constant for DI
 */
export const CONTAINER_VOLUME = 'ContainerVolume';

export type ContainerVolumeDocument = ContainerVolume & Document & SchemaTimestampsConfig;

/**
 * Container volume schema using NestJS decorators
 */
@Schema({
  timestamps: true,
  versionKey: false,
})
export class ContainerVolume {
  @Prop({ type: String, default: uuidv4, required: true, unique: true })
  uuid!: string;

  @Prop({ type: String })
  name!: string;

  @Prop({
    type: String,
    required: true,
    index: true,
    ref: 'Device'
  })
  deviceUuid!: string;

  @Prop({ type: String, required: true })
  watcher!: string;

  @Prop({ type: String, required: true })
  driver!: string;

  @Prop({ type: String })
  mountPoint!: string;

  @Prop({ type: String, required: true, default: 'unknown' })
  status?: { [p: string]: string } | undefined;

  @Prop({ type: Object, default: {} })
  labels!: { [p: string]: string };

  @Prop({ type: String })
  scope!: 'local' | 'global';

  @Prop({ type: Object, default: null })
  options!: { [p: string]: string } | null;

  @Prop({ type: Object, default: null })
  usageData?: { Size: number; RefCount: number } | null | undefined;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;
}


export const ContainerVolumeSchema = SchemaFactory.createForClass(ContainerVolume);


// Set up the relationship with Device model
ContainerVolumeSchema.virtual('device', {
  ref: 'Device',
  localField: 'deviceUuid',
  foreignField: 'uuid',
  justOne: true
});