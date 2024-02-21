import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../logger';
import User, { UserLogsLevel, UsersModel, schema } from '../model/User';

async function create(user: User): Promise<User> {
  const created = await UsersModel.create(user);
  return created.toObject();
}

async function findByEmailAndPassword(email: string, password: string): Promise<User | null> {
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

async function findByEmail(email: string): Promise<User | null> {
  return await UsersModel.findOne({
    email: email,
  }).exec();
}

async function count(): Promise<number> {
  return await UsersModel.countDocuments().exec();
}

async function resetApiKey(email: string): Promise<string | null> {
  const uuid = uuidv4();
  await UsersModel.updateOne({ email: email }, { apiKey: uuid }).exec();
  return uuid;
}

async function updateLogsLevel(email: string, userLogsLevel: UserLogsLevel): Promise<void> {
  await UsersModel.updateOne({ email: email }, { logsLevel: userLogsLevel }).exec();
}

export default {
  create,
  findByEmailAndPassword,
  count,
  findByEmail,
  resetApiKey,
  updateLogsLevel,
};
