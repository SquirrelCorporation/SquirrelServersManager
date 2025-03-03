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

  @Prop({ type: String, required: true })
  status!: string;

  @Prop({ type: String, required: true })
  cmd!: string;

  @Prop({ type: [String], required: false })
  target?: string[];
}

export const AnsibleTaskSchema = SchemaFactory.createForClass(AnsibleTask);
