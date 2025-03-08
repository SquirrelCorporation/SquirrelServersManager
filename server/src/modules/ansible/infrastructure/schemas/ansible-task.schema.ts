import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnsibleTaskDocument = AnsibleTask & Document;

@Schema({
  collection: 'ansibletasks',
  timestamps: true,
  versionKey: false,
})
export class AnsibleTask {
  @Prop({ type: String, required: true, unique: true })
  ident!: string;

  @Prop({ type: String })
  name?: string;

  @Prop({ type: String })
  playbook?: string;

  @Prop({ type: String, required: true, default: 'pending' })
  status!: string;

  @Prop({ type: [String] })
  target?: string[];

  @Prop({ type: Object })
  options?: Record<string, any>;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const AnsibleTaskSchema = SchemaFactory.createForClass(AnsibleTask);