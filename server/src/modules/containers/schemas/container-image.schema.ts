import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export const CONTAINER_IMAGE = 'ContainerImage';
export type ContainerImageDocument = ContainerImage & Document;

/**
 * Schema for container images
 */
@Schema({
  collection: 'containerimages',
  timestamps: true,
  versionKey: false
})
export class ContainerImage {
  @Prop({ type: String, required: true })
  id!: string;

  @Prop({ type: String, required: true })
  watcher!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Device', required: true, index: true })
  device: any;

  @Prop({ type: String })
  parentId!: string;

  @Prop({ type: [String] })
  repoTags!: string[];

  @Prop({ type: [String] })
  repoDigests?: string[];

  @Prop({ type: Number })
  created!: number;

  @Prop({ type: Number })
  size!: number;

  @Prop({ type: Number })
  virtualSize!: number;

  @Prop({ type: Number })
  sharedSize!: number;

  @Prop({ type: Object })
  labels!: { [p: string]: string };

  @Prop({ type: Number })
  containers!: number;
}

export const ContainerImageSchema = SchemaFactory.createForClass(ContainerImage);