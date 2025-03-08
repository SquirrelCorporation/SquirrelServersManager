import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type AutomationDocument = Automation & Document;

@Schema({
  collection: 'automations',
  versionKey: false,
  timestamps: true,
})
export class Automation {
  @Prop({
    type: String,
    required: true,
    default: uuidv4,
  })
  uuid: string = uuidv4();

  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
  })
  name: string = '';

  @Prop({
    type: Object,
    required: true,
  })
  automationChains: any = {};

  @Prop({
    type: Date,
    default: null,
  })
  lastExecutionTime?: Date;

  @Prop({
    type: String,
    enum: ['success', 'failed'],
    default: null,
  })
  lastExecutionStatus?: 'success' | 'failed';

  @Prop({
    type: Boolean,
    default: true,
  })
  enabled: boolean = true;
}

export const AutomationSchema = SchemaFactory.createForClass(Automation);

// Add compound index for faster lookup by uuid
AutomationSchema.index({ uuid: 1 }, { unique: true });
