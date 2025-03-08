import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  collection: 'ansibletaskstatuses',
  timestamps: true,
  versionKey: false,
})
export class AnsibleTaskStatus {
  @Prop({ required: true })
  taskIdent!: string;

  @Prop({ required: true })
  status!: string;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const AnsibleTaskStatusSchema = SchemaFactory.createForClass(AnsibleTaskStatus);