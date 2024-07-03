import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import User, { UserLogsLevel, UsersModel } from '../model/User';

async function create(user: User): Promise<User> {
  const created = await UsersModel.create(user);
  return created.toObject();
}

async function findByApiKey(apiKey: string) {
  return await UsersModel.findOne({ apiKey: apiKey }).exec();
}

async function findByEmailAndPassword(email: string, password: string): Promise<User | null> {
  const user = await UsersModel.findOne({
    email: email,
  }).exec();
  if (user && bcrypt.compareSync(password, user.password)) {
    return user.toObject();
  } else {
    return null;
  }
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

async function findFirst(): Promise<User | null> {
  return await UsersModel.findOne().lean().exec();
}

export default {
  create,
  findByEmailAndPassword,
  count,
  findByEmail,
  resetApiKey,
  updateLogsLevel,
  findByApiKey,
  findFirst,
};
