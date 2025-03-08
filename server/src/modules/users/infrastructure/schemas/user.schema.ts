import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Role, UserLogsDefaults, UserLogsLevel } from '../../domain/entities/user.entity';

export type UserDocument = User & Document;

export const USER = 'User';
export const COLLECTION_NAME = 'users';

@Schema({
  collection: COLLECTION_NAME,
  timestamps: true,
  versionKey: false,
})
export class User {
  @Prop({
    type: String,
    required: true,
  })
  name!: string;

  @Prop({
    type: String,
    required: true,
  })
  avatar!: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email!: string;

  @Prop({
    type: String,
    required: true,
  })
  password!: string;

  @Prop({
    type: String,
    enum: Role,
    required: true,
  })
  role!: Role;

  @Prop({
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
  })
  apiKey?: string;

  @Prop({
    type: Object,
    required: false,
    default: UserLogsDefaults,
  })
  logsLevel?: UserLogsLevel;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);