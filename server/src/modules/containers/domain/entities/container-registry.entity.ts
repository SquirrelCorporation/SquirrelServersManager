/**
 * Entity representing a container registry
 */
export interface ContainerRegistryEntity {
  _id?: string;
  name: string;
  auth?: any;
  authScheme: any;
  provider: string;
  authSet: boolean;
  canAuth: boolean;
  canAnonymous: boolean;
  fullName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
