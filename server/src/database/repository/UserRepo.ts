import mongoose from 'mongoose';
import logger from '../../logger';
import User, { UsersModel, schema } from '../model/User';

async function create(user: User): Promise<User> {
  const created = await UsersModel.create(user);
  return created.toObject();
}

async function findByEmailAndPassword(email: string, password: string): Promise<User | null> {
  logger.info(email + password);
  const User = mongoose.model('User', schema);
  const messageToSearchWith = new User({ password: password });
  // @ts-expect-error - Not recognizing the field
  messageToSearchWith.encryptFieldsSync();
  logger.info(messageToSearchWith.password);
  return await UsersModel.findOne({
    email: email,
    password: messageToSearchWith.password,
  }).exec();
}

async function count(): Promise<number> {
  return await UsersModel.countDocuments().exec();
}

export default {
  create,
  findByEmailAndPassword,
  count,
};
