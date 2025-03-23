import { IUser } from '../../users/domain/entities/user.entity';

export const JWT_STRATEGY = 'JWT_STRATEGY';

/**
 * Interface for the JWT Strategy
 */
export interface IJwtStrategy {
  /**
   * Validate a JWT payload
   * @param payload JWT payload
   * @returns User if validation is successful
   */
  validate(payload: any): Promise<IUser>;
}
