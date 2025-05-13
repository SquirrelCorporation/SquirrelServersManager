import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTimestampsConfig } from 'mongoose';

export type ServerLogDocument = ServerLog & Document & SchemaTimestampsConfig;

@Schema({
  collection: 'logs',
  timestamps: false,
  versionKey: false,
})
export class ServerLog {
  @Prop({ type: Number, required: false })
  level?: number;

  @Prop({ type: Date, required: false })
  time?: Date;

  @Prop({ type: Number, required: false })
  pid?: number;

  @Prop({ type: String, required: false })
  hostname?: string;

  @Prop({ type: String, required: false })
  msg?: string;

  @Prop({ type: Object, required: false })
  req?: any;

  @Prop({ type: Object, required: false })
  res?: any;

  @Prop({ type: Object, required: false })
  err?: any;

  @Prop({ type: String, required: false })
  context?: string;
}

export const ServerLogSchema = SchemaFactory.createForClass(ServerLog);
