import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { SsmAnsible } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import { PlaybooksRegisterDocument } from './playbooks-register.schema';

export type PlaybookDocument = Playbook & Document;

@Schema({
  timestamps: true,
  versionKey: false,
  collection: 'playbooks',
})
export class Playbook {
  @Prop({
    type: String,
    required: true,
  })
  name!: string;

  @Prop({
    type: String,
    default: uuidv4,
    required: true,
    unique: true,
  })
  uuid!: string;

  @Prop({
    type: String,
    unique: true,
    sparse: true,
  })
  uniqueQuickRef?: string;

  @Prop({
    type: String,
    required: true,
  })
  path!: string;

  @Prop({
    type: Boolean,
    default: true,
  })
  playableInBatch!: boolean;

  @Prop({
    type: Boolean,
    required: true,
    default: true,
  })
  custom!: boolean;

  @Prop({
    type: [Object],
    required: false,
  })
  extraVars?: Array<{
    extraVar: string;
    required: boolean;
    type: SsmAnsible.ExtraVarsType;
    deletable: boolean;
  }>;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'PlaybookRepository',
    required: true,
    index: true,
  })
  playbooksRepository!: PlaybooksRegisterDocument;
}

export const PlaybookSchema = SchemaFactory.createForClass(Playbook);
