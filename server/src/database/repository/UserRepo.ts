import User, { UsersModel } from '../model/User';

async function create(user: User): Promise<User> {
  const created = await UsersModel.create(user);
  return created.toObject();
}

async function findByEmailAndPassword(email: string, password: string): Promise<User> {
  return await UsersModel.findOne({
    email: email,
    password: password,
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
