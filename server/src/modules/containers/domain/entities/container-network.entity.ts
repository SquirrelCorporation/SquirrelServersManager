import { IPAM, NetworkContainer } from "dockerode";

/**
 * Domain entity for container networks
 */
export interface ContainerNetworkEntity {
  _id?: string;
 name: string;
  status: string;
  watcher: string;
  id: string;
  deviceUuid?: string;
  created: string;
  scope: string;
  driver: string;
  enableIPv6: boolean;
  ipam?: IPAM | undefined;
  internal: boolean;
  attachable: boolean;
  ingress: boolean;
  configFrom?: { Network: string } | undefined;
  configOnly: boolean;
  containers?: { [id: string]: NetworkContainer } | undefined;
  options?: { [key: string]: string } | undefined;
  labels?: { [key: string]: string } | undefined;
  createdAt?: Date;
  updatedAt?: Date;
}