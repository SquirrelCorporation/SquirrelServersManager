/**
 * Entity representing a container registry
 */
export interface ContainerRegistryEntity {
  /**
   * Registry ID
   */
  id?: string;

  /**
   * Registry name
   */
  name: string;

  /**
   * Registry authentication
   */
  auth?: any;

  /**
   * Authentication scheme
   */
  authScheme?: any;

  /**
   * Registry provider
   */
  provider: string;

  /**
   * Whether authentication is set
   */
  authSet: boolean;

  /**
   * Whether the registry supports authentication
   */
  canAuth: boolean;

  /**
   * Whether the registry supports anonymous access
   */
  canAnonymous: boolean;

  /**
   * Full name of the registry (optional)
   */
  fullName?: string;

  /**
   * Creation date
   */
  createdAt?: Date;

  /**
   * Last update date
   */
  updatedAt?: Date;
}
