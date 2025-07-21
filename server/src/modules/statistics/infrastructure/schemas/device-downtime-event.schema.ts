import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DeviceDownTimeEventDocument = DeviceDownTimeEvent & Document;

export const DEVICE_DOWNTIME_EVENT = 'DeviceDownTimeEvent';
export const COLLECTION_NAME = 'devicedowntimeevents';

@Schema({
  collection: COLLECTION_NAME,
  timestamps: true,
  versionKey: false,
})
export class DeviceDownTimeEvent {
  @Prop({
    type: MongooseSchema.Types.String,
    required: true,
    index: true,
  })
  deviceId!: string;

  @Prop({
    type: Date,
    required: false,
  })
  finishedAt?: Date;

  @Prop({
    type: Number,
    required: false,
  })
  duration?: number;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const DeviceDownTimeEventSchema = SchemaFactory.createForClass(DeviceDownTimeEvent);
