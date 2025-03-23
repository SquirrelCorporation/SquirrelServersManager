import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnsibleVaultDocument = AnsibleVault & Document;

export const ANSIBLE_VAULT = 'AnsibleVault';
export const COLLECTION_NAME = 'ansiblevaults';

@Schema({
  collection: COLLECTION_NAME,
  timestamps: true,
  versionKey: false,
})
export class AnsibleVault {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  vaultId!: string;

  @Prop({
    type: String,
    required: true,
  })
  password!: string;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const AnsibleVaultSchema = SchemaFactory.createForClass(AnsibleVault);