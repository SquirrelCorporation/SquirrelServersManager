import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CronDocument = Cron & Document;

export const CRON = 'Cron';
export const COLLECTION_NAME = 'crons';

@Schema({
  collection: COLLECTION_NAME,
  timestamps: true,
  versionKey: false,
})
export class Cron {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  name!: string;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  disabled?: boolean;

  @Prop({
    type: Date,
    required: false,
  })
  lastExecution?: Date;

  @Prop({
    type: String,
    required: true,
  })
  expression!: string;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const CronSchema = SchemaFactory.createForClass(Cron);
