import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Repositories } from 'ssm-shared-lib';
import { ContainerCustomStackRepositoryDocument } from './container-custom-stack-repository.schema';

export const CONTAINER_CUSTOM_STACK = 'ContainerCustomStack';

@Schema({
  collection: 'containercustomstacks',
  timestamps: true,
  versionKey: false,
})
export class ContainerCustomStackDocument extends Document {
  @Prop({ required: true, unique: true, default: uuidv4 })
  uuid!: string;

  @Prop()
  name!: string;

  @Prop({ type: Object })
  json?: any;

  @Prop()
  yaml!: string;

  @Prop({ type: Object })
  rawStackValue?: any;

  @Prop({ default: false })
  lockJson!: boolean;

  @Prop()
  icon?: string;

  @Prop()
  iconColor?: string;

  @Prop()
  iconBackgroundColor?: string;

  @Prop()
  path?: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(Repositories.RepositoryType),
    default: Repositories.RepositoryType.LOCAL
  })
  type!: Repositories.RepositoryType;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'ContainerCustomStackRepository',
    required: false,
    index: true,
  })
  containerCustomStackRepository?: ContainerCustomStackRepositoryDocument;
}

export const ContainerCustomStackSchema = SchemaFactory.createForClass(ContainerCustomStackDocument);