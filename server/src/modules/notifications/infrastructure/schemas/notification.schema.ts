import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

export const NOTIFICATION = 'Notification';

@Schema({
  timestamps: true,
  versionKey: false,
  collection: 'notifications',
})
export class Notification {
  @Prop({
    type: String,
    required: true,
    immutable: true,
  })
  message!: string;

  @Prop({
    type: String,
    required: true,
    immutable: true,
    enum: ['info', 'warning', 'error'],
  })
  severity!: 'info' | 'warning' | 'error';

  @Prop({
    type: String,
    required: true,
    immutable: true,
  })
  event!: string;

  @Prop({
    type: String,
    required: true,
    immutable: true,
  })
  module!: string;

  @Prop({
    type: String,
    required: false,
    immutable: true,
  })
  moduleId?: string;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  seen!: boolean;

  @Prop({
    type: Date,
  })
  createdAt?: Date;

  @Prop({
    type: Date,
  })
  updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);