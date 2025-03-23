/**
 * Domain entity for container registries
 */
export interface IContainerRegistryEntity {
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
