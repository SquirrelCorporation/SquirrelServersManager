import { Schema, model } from 'mongoose';
import { fieldEncryption } from 'mongoose-field-encryption';

export const DOCUMENT_NAME = 'User';
export const COLLECTION_NAME = 'users';

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
  },
  {
    versionKey: false,
  },
);

schema.plugin(fieldEncryption, {
  fields: ['password'],
  secret: 'some secret key',
  saltGenerator: function (secret) {
    return '1234567890123456';
    // should ideally use the secret to return a string of length 16,
    // default = `const defaultSaltGenerator = secret => crypto.randomBytes(16);`,
    // see options for more details
  },
});

export const UsersModel = model<User>(DOCUMENT_NAME, schema, COLLECTION_NAME);
