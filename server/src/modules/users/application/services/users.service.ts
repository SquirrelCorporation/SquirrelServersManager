import { Inject, Injectable } from '@nestjs/common';
import { IUser, Role } from '../../domain/entities/user.entity';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user-repository.interface';
import PinoLogger from '../../../../logger';

const logger = PinoLogger.child({ module: 'UsersService' });

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async createUser(userData: IUser): Promise<IUser> {
    logger.info(`Creating user with email: ${userData.email}`);
    return this.userRepository.create(userData);
  }

  async updateUser(userData: IUser): Promise<IUser | null> {
    logger.info(`Updating user with email: ${userData.email}`);
    return this.userRepository.update(userData);
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return this.userRepository.findByEmail(email);
  }

  async findUserByEmailAndPassword(email: string, password: string): Promise<IUser | null> {
    return this.userRepository.findByEmailAndPassword(email, password);
  }

  async findUserByApiKey(apiKey: string): Promise<IUser | null> {
    return this.userRepository.findByApiKey(apiKey);
  }

  async getAllUsers(): Promise<IUser[] | null> {
    return this.userRepository.findAll();
  }

  async getUserCount(): Promise<number> {
    return this.userRepository.count();
  }

  async getFirstUser(): Promise<IUser | null> {
    return this.userRepository.findFirst();
  }

  async regenerateApiKey(email: string): Promise<string | null> {
    logger.info(`Regenerating API key for user: ${email}`);
    return this.userRepository.updateApiKey(email);
  }

  async updateLogsLevel(email: string, logsLevel: any): Promise<IUser | null> {
    logger.info(`Updating logs level for user: ${email}`);
    return this.userRepository.updateLogsLevel(email, logsLevel);
  }

  async createFirstAdminUser(name: string, email: string, password: string, avatar = '/avatars/squirrel.svg'): Promise<IUser> {
    const userCount = await this.getUserCount();

    if (userCount > 0) {
      logger.error('Attempted to create first admin user when users already exist');
      throw new Error('Cannot create first user: users already exist');
    }

    const userData: IUser = {
      name,
      email,
      password,
      role: Role.ADMIN,
      avatar,
    };

    logger.info('Creating first admin user');
    return this.createUser(userData);
  }
}