/**
 * User entity interface in the domain layer
 */
export interface IUser {
  _id?: string;
  name: string;
  avatar: string;
  email: string;
  password: string;
  role: Role;
  apiKey?: string;
  logsLevel?: UserLogsLevel;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export interface UserLogsLevel {
  terminal: number;
}

export const UserLogsDefaults: UserLogsLevel = {
  terminal: 1,
};
