import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const CONTAINER_REGISTRY = 'ContainerRegistry';

export type ContainerRegistryDocument = ContainerRegistry & Document;

@Schema({ timestamps: true })
export class ContainerRegistry {
  @Prop({ type: String, required: false })
  name!: string;

  @Prop({ type: Object, required: false })
  auth?: any;

  @Prop({ type: Object })
  authScheme: any;

  @Prop({ type: String })
  provider!: string;

  @Prop({ type: Boolean, default: false })
  authSet!: boolean;

  @Prop({ type: Boolean, default: false })
  canAuth!: boolean;

  @Prop({ type: Boolean, default: false })
  canAnonymous!: boolean;

  @Prop({ type: String })
  fullName?: string;
}

export const ContainerRegistrySchema = SchemaFactory.createForClass(ContainerRegistry);
