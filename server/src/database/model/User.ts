import { Schema, model } from 'mongoose';
import { fieldEncryption } from 'mongoose-field-encryption';
import { v4 as uuidv4 } from 'uuid';
import { SALT, SECRET } from '../../config';

export const DOCUMENT_NAME = 'User';
export const COLLECTION_NAME = 'users';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export interface UserLogsLevel {
  terminal: number;
}

const UserLogsDefaults: UserLogsLevel = {
  terminal: 1,
};

export default interface User {
  name: string;
  avatar: string;
  email: string;
  password: string;
  role: string;
  apiKey?: string;
  logsLevel?: UserLogsLevel;
  createdAt?: Date;
  updatedAt?: Date;
}

export const schema = new Schema<User>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
    },
    avatar: {
      type: Schema.Types.String,
      required: true,
    },
    email: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    password: {
      type: Schema.Types.String,
      required: true,
    },
    role: {
      type: Schema.Types.String,
      enum: Role,
      required: true,
    },
    apiKey: {
      type: Schema.Types.String,
      required: true,
      unique: true,
      default: uuidv4(),
    },
    logsLevel: {
      type: Object,
      required: false,
      default: UserLogsDefaults,
    },
  },
  {
    versionKey: false,
  },
);

schema.plugin(fieldEncryption, {
  fields: ['password'],
  secret: SECRET,
  saltGenerator: function () {
    return SALT;
  },
});

export const UsersModel = model<User>(DOCUMENT_NAME, schema, COLLECTION_NAME);
