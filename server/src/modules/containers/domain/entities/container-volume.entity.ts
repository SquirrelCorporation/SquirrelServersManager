/**
 * Domain entity for container volumes
 */
export interface ContainerVolumeEntity {
  id: string;
  uuid: string;
  name: string;
  deviceUuid: string;
  driver: string;
  scope: string;
  mountpoint: string;
  driver_opts?: Record<string, string>;
  options?: Record<string, string>;
  labels?: Record<string, string>;
  usage?: {
    size: number;
    refCount: number;
  };
  containers?: string[]; // List of container IDs using this volume
  createdAt?: Date;
}