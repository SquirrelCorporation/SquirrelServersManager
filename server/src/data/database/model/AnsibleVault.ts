import { Schema, model } from 'mongoose';

export interface AnsibleVault {
  _id?: string;
  vaultId: string;
  password: string;
}

export const DOCUMENT_NAME = 'AnsibleVault';
export const COLLECTION_NAME = 'ansiblevaults';

const schema = new Schema<AnsibleVault>({
  vaultId: {
    type: Schema.Types.String,
    required: true,
    unique: true,
  },
  password: {
    type: Schema.Types.String,
    required: true,
  },
});

export const AnsibleVaultModel = model<AnsibleVault>(DOCUMENT_NAME, schema, COLLECTION_NAME);
