import { IUser } from '../../../users/domain/entities/user.entity';

export const AUTH_SERVICE = 'AUTH_SERVICE';

/**
 * Interface for the Auth Service
 */
export interface IAuthService {
  /**
   * Validate a user's credentials
   * @param email User email
   * @param password User password
   * @returns User if validation is successful or null if not
   */
  validateUser(email: string, password: string): Promise<IUser | null>;

  /**
   * Generate a JWT token for a user
   * @param user User to generate token for
   * @returns JWT token
   */
  generateToken(user: IUser): string;

  /**
   * Validate a JWT token
   * @param token JWT token
   * @returns User if token is valid or null if not
   */
  validateToken(token: string): Promise<IUser | null>;

  /**
   * Validate a user's API key
   * @param apiKey API key
   * @returns User if API key is valid or null if not
   */
  validateApiKey(apiKey: string): Promise<IUser | null>;
}
