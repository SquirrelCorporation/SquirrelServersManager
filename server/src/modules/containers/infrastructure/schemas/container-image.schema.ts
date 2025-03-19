import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTimestampsConfig } from 'mongoose';

/**
 * Schema name constant for DI
 */
export const CONTAINER_IMAGE = 'ContainerImage';

export type ContainerImageDocument = ContainerImage & Document & SchemaTimestampsConfig;

/**
 * Container image schema using NestJS decorators
 */
@Schema({
  timestamps: true,
  versionKey: false,
})
export class ContainerImage {
  @Prop({ type: String, required: true })
  id!: string;

  @Prop({ type: String, required: true })
  watcher!: string;

  @Prop({
    type: String,
    required: true,
    index: true,
    ref: 'Device'
  })
  deviceUuid!: string;

  @Prop({ type: String })
  parentId!: string;

  @Prop({ type: [String], default: undefined })
  repoTags!: string[] | undefined;

  @Prop({ type: [String], default: undefined })
  repoDigests?: string[] | undefined;

  @Prop({ type: Number })
  created!: number;

  @Prop({ type: Number, required: true })
  size!: number;

  @Prop({ type: Number })
  virtualSize!: number;

  @Prop({ type: Number })
  sharedSize!: number;

  @Prop({ type: Object, default: {} })
  labels!: { [p: string]: string };

  @Prop({ type: Number })
  containers!: number;
}

export const ContainerImageSchema = SchemaFactory.createForClass(ContainerImage);

// Set up the relationship with Device model
ContainerImageSchema.virtual('device', {
  ref: 'Device',
  localField: 'deviceUuid',
  foreignField: 'uuid',
  justOne: true
});