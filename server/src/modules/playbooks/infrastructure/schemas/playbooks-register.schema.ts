import { IAnsibleVault } from '@modules/ansible-vaults';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Repositories, SsmGit } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';

export type PlaybooksRegisterDocument = PlaybooksRegister & Document;

@Schema({ timestamps: true, versionKey: false, collection: 'playbooksrepository' })
export class PlaybooksRegister {
  @Prop({ type: String, default: uuidv4, required: true, unique: true })
  uuid!: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(Repositories.RepositoryType),
  })
  type!: Repositories.RepositoryType;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, required: false })
  accessToken?: string;

  @Prop({ type: String, required: false })
  branch?: string;

  @Prop({ type: String, required: false })
  email?: string;

  @Prop({ type: String, required: false })
  userName?: string;

  @Prop({ type: String, required: false })
  remoteUrl?: string;

  @Prop({ type: String, required: true })
  directory!: string;

  @Prop({ type: Boolean, required: true, default: true })
  enabled: boolean = true;

  @Prop({ type: Boolean, required: false, default: false })
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

  @Prop({ type: Boolean, default: false })
  onError?: boolean;

  @Prop({ type: String, required: false })
  onErrorMessage?: string;

  @Prop({
    type: String,
    required: false,
    enum: Object.values(SsmGit.Services),
  })
  gitService?: SsmGit.Services;

  @Prop({ type: Boolean, default: false })
  ignoreSSLErrors?: boolean;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AnsibleVault' }],
    required: false,
    autopopulate: true,
  })
  vaults?: IAnsibleVault[] | string[];

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const PlaybooksRegisterSchema = SchemaFactory.createForClass(PlaybooksRegister);
