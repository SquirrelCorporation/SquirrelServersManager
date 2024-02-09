import { Schema, model } from 'mongoose';
import { fieldEncryption } from 'mongoose-field-encryption';

export const DOCUMENT_NAME = 'User';
export const COLLECTION_NAME = 'Users';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export default interface User {
  name: string;
  avatar: string;
  email: string;
  password: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<User>(
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
  },
  {
    versionKey: false,
  },
);

schema.plugin(fieldEncryption, {
  fields: ['password'],
  secret: 'some secret key',
});

export const UsersModel = model<User>(DOCUMENT_NAME, schema, COLLECTION_NAME);
