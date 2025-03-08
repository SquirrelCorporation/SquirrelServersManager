import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Repositories, SsmGit } from 'ssm-shared-lib';
import { AnsibleVault } from '../../../data/database/model/AnsibleVault';

export type PlaybooksRepositoryDocument = PlaybooksRepository & Document;

@Schema({ timestamps: true, versionKey: false, collection: 'playbooksrepository' })
export class PlaybooksRepository {
  @Prop({ required: true, unique: true })
  uuid!: string;

  @Prop({ required: true })
  type!: Repositories.RepositoryType;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: false })
  accessToken?: string;

  @Prop({ required: false })
  branch?: string;

  @Prop({ required: false })
  email?: string;

  @Prop({ required: false })
  userName?: string;

  @Prop({ required: false })
  remoteUrl?: string;

  @Prop({ required: true })
  directory!: string;

  @Prop({ required: true, default: true })
  enabled: boolean = true;

  @Prop({ required: false, default: false })
  default: boolean = false;

  @Prop({ type: Object })
  tree?: any;

  @Prop({
    type: [String],
    default: [
      'production',
      'staging',
      'group_vars',
      'host_vars',
      'library',
      'module_utils',
      'filters_plugin',
      'roles',
      'inventories',
    ],
  })
  directoryExclusionList?: string[];

  @Prop({ default: false })
  onError?: boolean;

  @Prop({ required: false })
  onErrorMessage?: string;

  @Prop({ required: false })
  gitService?: SsmGit.Services;

  @Prop({ default: false })
  ignoreSSLErrors?: boolean;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AnsibleVault' }],
    required: false,
    autopopulate: true,
  })
  vaults?: AnsibleVault[] | string[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const PlaybooksRepositorySchema = SchemaFactory.createForClass(PlaybooksRepository);
