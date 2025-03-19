/**
 * Domain entity for container volumes
 */
export interface ContainerVolumeEntity {
  _id?: string;
  uuid: string;
  name: string;
  deviceUuid: string;
  watcher: string;
  driver: string;
  mountPoint: string;
  status?: { [p: string]: string } | undefined;
  labels: { [p: string]: string };
  scope: 'local' | 'global';
  options: { [p: string]: string } | null;
  usageData?: { Size: number; RefCount: number } | null | undefined;
  createdAt?: Date;
  updatedAt?: Date;
}