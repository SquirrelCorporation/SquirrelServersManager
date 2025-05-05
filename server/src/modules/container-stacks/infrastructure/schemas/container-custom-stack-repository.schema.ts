import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SsmGit } from 'ssm-shared-lib';
import { v4 } from 'uuid';

export const CONTAINER_CUSTOM_STACK_REPOSITORY = 'ContainerCustomStackRepository';

@Schema({
  collection: 'containercustomstackssrepository',
  timestamps: true,
  versionKey: false,
})
export class ContainerCustomStackRepositoryDocument extends Document {
  @Prop({ required: true, unique: true, default: v4 })
  uuid!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: false })
  accessToken!: string;

  @Prop({ required: false })
  branch!: string;

  @Prop({ required: false })
  email!: string;

  @Prop({ required: false })
  userName!: string;

  @Prop({ required: false })
  remoteUrl!: string;

  @Prop({ required: true, default: true })
  enabled!: boolean;

  @Prop({ type: [String] })
  matchesList?: string[];

  @Prop({ default: false })
  onError?: boolean;

  @Prop({ required: false })
  onErrorMessage?: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(SsmGit.Services),
  })
  gitService!: SsmGit.Services;

  @Prop({ default: false })
  ignoreSSLErrors?: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const ContainerCustomStackRepositorySchema = SchemaFactory.createForClass(
  ContainerCustomStackRepositoryDocument,
);
