import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Repositories, SsmGit } from 'ssm-shared-lib';
import { IAnsibleVault } from '@modules/ansible-vaults';

export type PlaybooksRegisterDocument = PlaybooksRegister & Document;

@Schema({ timestamps: true, versionKey: false, collection: 'playbooksrepository' })
export class PlaybooksRegister {
  @Prop({ required: true, unique: true })
  uuid!: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(Repositories.RepositoryType)
  })
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

  @Prop({
    type: String,
    required: false,
    enum: Object.values(SsmGit.Services)
  })
  gitService?: SsmGit.Services;

  @Prop({ default: false })
  ignoreSSLErrors?: boolean;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AnsibleVault' }],
    required: false,
    autopopulate: true,
  })
  vaults?: IAnsibleVault[] | string[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const PlaybooksRegisterSchema = SchemaFactory.createForClass(PlaybooksRegister);
