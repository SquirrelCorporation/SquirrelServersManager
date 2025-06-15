import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTimestampsConfig } from 'mongoose';

export type AnsibleTaskStatusDocument = AnsibleTaskStatus & Document & SchemaTimestampsConfig;

@Schema({
  collection: 'ansibletaskstatuses',
  timestamps: true,
  versionKey: false,
})
export class AnsibleTaskStatus {
  @Prop({ type: String, required: true })
  taskIdent!: string;

  @Prop({ type: String, required: true })
  status!: string;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const AnsibleTaskStatusSchema = SchemaFactory.createForClass(AnsibleTaskStatus);
