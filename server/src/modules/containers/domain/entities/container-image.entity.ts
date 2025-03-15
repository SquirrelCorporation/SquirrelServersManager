/**
 * Domain entity for container images
 */
export interface ContainerImageEntity {
  id: string;
  uuid: string;
  deviceUuid: string;
  name: string;
  tag: string;
  registry?: string;
  size: number;
  createdAt: Date;
  parentId?: string;
  repoDigests?: string[];
  labels?: Record<string, string>;
  containers?: string[]; // List of container IDs using this image
  virtualSize?: number;
  shared?: boolean;
}