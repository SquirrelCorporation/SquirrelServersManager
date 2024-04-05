import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export const DOCUMENT_NAME = 'User';
export const COLLECTION_NAME = 'users';
const SALT_ROUNDS = 8;

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
      default: uuidv4,
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

schema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  }
  next();
});

export const UsersModel = model<User>(DOCUMENT_NAME, schema, COLLECTION_NAME);
