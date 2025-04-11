import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { IUser } from '../../domain/entities/user.entity';
import { USER, UserDocument } from '../schemas/user.schema';
import { UserRepositoryMapper } from '../mappers/user-repository.mapper';

const SALT_ROUNDS = 8;

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel(USER) private userModel: Model<UserDocument>,
    private readonly mapper: UserRepositoryMapper,
  ) {}

  async create(user: IUser): Promise<IUser> {
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
    const userWithHashedPassword = { ...user, password: hashedPassword };

    const createdUser = await this.userModel.create(userWithHashedPassword);
    return this.mapper.toDomain(createdUser.toObject())!;
  }

  async update(user: IUser): Promise<IUser | null> {
    user.updatedAt = new Date();
    const updated = await this.userModel
      .findOneAndUpdate({ email: user.email }, user, { new: true })
      .lean()
      .exec();

    return this.mapper.toDomain(updated);
  }

  async findAll(): Promise<IUser[] | null> {
    const users = await this.userModel.find().lean().exec();
    return this.mapper.toDomainList(users);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const user = await this.userModel.findOne({ email }).lean().exec();
    return this.mapper.toDomain(user);
  }

  async findByEmailAndPassword(email: string, password: string): Promise<IUser | null> {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      return this.mapper.toDomain(user.toObject());
    }

    return null;
  }

  async findByApiKey(apiKey: string): Promise<IUser | null> {
    const user = await this.userModel.findOne({ apiKey }).lean().exec();
    return this.mapper.toDomain(user);
  }

  async count(): Promise<number> {
    return await this.userModel.countDocuments().exec();
  }

  async findFirst(): Promise<IUser | null> {
    const user = await this.userModel.findOne().lean().exec();
    return this.mapper.toDomain(user);
  }

  async updateApiKey(email: string): Promise<string | null> {
    const newApiKey = uuidv4();
    const updated = await this.userModel
      .findOneAndUpdate({ email }, { apiKey: newApiKey }, { new: true })
      .lean()
      .exec();

    if (updated) {
      return newApiKey;
    }

    return null;
  }

  async updateLogsLevel(email: string, logsLevel: any): Promise<IUser | null> {
    const updated = await this.userModel
      .findOneAndUpdate({ email }, { logsLevel }, { new: true })
      .lean()
      .exec();

    return this.mapper.toDomain(updated);
  }
}
