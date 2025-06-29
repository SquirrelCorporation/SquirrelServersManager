import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTimestampsConfig } from 'mongoose';

export type AnsibleLogDocument = AnsibleLog & Document & SchemaTimestampsConfig;

@Schema({
  collection: 'ansiblelogs',
  timestamps: true,
  versionKey: false,
})
export class AnsibleLog {
  @Prop({ type: String, required: true })
  ident!: string;

  @Prop({ type: String, required: false })
  content?: string;

  @Prop({ type: String, required: false })
  stdout?: string;

  @Prop({ type: String, required: false })
  logRunnerId?: string;
}

export const AnsibleLogSchema = SchemaFactory.createForClass(AnsibleLog);
