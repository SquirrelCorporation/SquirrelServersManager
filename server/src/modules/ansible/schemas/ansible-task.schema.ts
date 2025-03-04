import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnsibleTaskDocument = AnsibleTask & Document;

@Schema({ timestamps: true })
export class AnsibleTask {
  @Prop({ type: String, required: true })
  uuid!: string;

  @Prop({ type: String, required: true })
  command!: string;

  @Prop({ type: Date, required: true })
  startTime!: Date;

  @Prop({ type: Date })
  endTime?: Date;

  @Prop({ type: String, default: 'running' })
  status!: string;

  @Prop({ type: Number })
  exitCode?: number;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: String })
  serverId?: string;

  @Prop({ type: String })
  serverGroupId?: string;

  @Prop({ type: String })
  playbookPath?: string;

  @Prop({ type: String })
  inventoryPath?: string;

  @Prop({ type: [String] })
  tags?: string[];

  @Prop({ type: Object })
  extraVars?: Record<string, any>;

  @Prop({ type: String })
  userId?: string;
}

export const AnsibleTaskSchema = SchemaFactory.createForClass(AnsibleTask); 