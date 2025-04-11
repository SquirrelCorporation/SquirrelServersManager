import { IUser } from '../entities/user.entity';

export const USER_REPOSITORY = 'USER_REPOSITORY';

/**
 * User repository interface in the domain layer
 */
export interface IUserRepository {
  create(user: IUser): Promise<IUser>;
  update(user: IUser): Promise<IUser | null>;
  findAll(): Promise<IUser[] | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findByEmailAndPassword(email: string, password: string): Promise<IUser | null>;
  findByApiKey(apiKey: string): Promise<IUser | null>;
  count(): Promise<number>;
  findFirst(): Promise<IUser | null>;
  updateApiKey(email: string): Promise<string | null>;
  updateLogsLevel(email: string, logsLevel: any): Promise<IUser | null>;
}
