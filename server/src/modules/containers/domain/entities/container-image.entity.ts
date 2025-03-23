import { Image } from "@modules/containers/types";

/**
 * Domain entity for container images
 */
export interface IContainerImageEntity {
  _id?: string;
  id: string;
  watcher: string;
  deviceUuid: string;
  parentId: string;
  repoTags: string[] | undefined;
  repoDigests?: string[] | undefined;
  created: number;
  size: number;
  virtualSize: number;
  sharedSize: number;
  labels: { [p: string]: string };
  containers: number;
  createdAt?: Date;
  updatedAt?: Date;
}