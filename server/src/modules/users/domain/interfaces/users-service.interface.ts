import { IUser } from '../../domain/entities/user.entity';

export const USERS_SERVICE = 'USERS_SERVICE';

/**
 * Interface for the Users Service
 */
export interface IUsersService {
  /**
   * Create a new user
   * @param userData User data
   * @returns Created user
   */
  createUser(userData: IUser): Promise<IUser>;

  /**
   * Update an existing user
   * @param userData User data
   * @returns Updated user or null if not found
   */
  updateUser(userData: IUser): Promise<IUser | null>;

  /**
   * Find a user by email
   * @param email User email
   * @returns User or null if not found
   */
  findUserByEmail(email: string): Promise<IUser | null>;

  /**
   * Find a user by email and password
   * @param email User email
   * @param password User password
   * @returns User or null if not found
   */
  findUserByEmailAndPassword(email: string, password: string): Promise<IUser | null>;

  /**
   * Find a user by API key
   * @param apiKey API key
   * @returns User or null if not found
   */
  findUserByApiKey(apiKey: string): Promise<IUser | null>;

  /**
   * Get all users
   * @returns Array of users or null
   */
  getAllUsers(): Promise<IUser[] | null>;

  /**
   * Get the total number of users
   * @returns User count
   */
  getUserCount(): Promise<number>;

  /**
   * Get the first user in the database
   * @returns First user or null if none exists
   */
  getFirstUser(): Promise<IUser | null>;

  /**
   * Regenerate a user's API key
   * @param email User email
   * @returns New API key or null if user not found
   */
  regenerateApiKey(email: string): Promise<string | null>;

  /**
   * Update a user's logs level
   * @param email User email
   * @param logsLevel New logs level
   * @returns Updated user or null if not found
   */
  updateLogsLevel(email: string, logsLevel: any): Promise<IUser | null>;

  /**
   * Create the first admin user
   * @param name User name
   * @param email User email
   * @param password User password
   * @param avatar User avatar
   * @returns Created admin user
   */
  createFirstAdminUser(
    name: string,
    email: string,
    password: string,
    avatar?: string,
  ): Promise<IUser>;

  /**
   * Get current user data with additional system information
   * @param user User
   * @returns Enhanced user data with system information
   */
  getCurrentUser(user: IUser): Promise<any>;
}
