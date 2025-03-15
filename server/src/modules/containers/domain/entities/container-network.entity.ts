/**
 * Domain entity for container networks
 */
export interface ContainerNetworkEntity {
  id: string;
  uuid: string;
  name: string;
  deviceUuid: string;
  driver: string;
  scope: string;
  ipam?: {
    driver: string;
    options?: Record<string, string>;
    config?: Array<{
      subnet?: string;
      gateway?: string;
      ipRange?: string;
    }>;
  };
  internal?: boolean;
  enableIPv6?: boolean;
  options?: Record<string, string>;
  labels?: Record<string, string>;
  containers?: Record<string, {
    name: string;
    endpointId: string;
    macAddress: string;
    ipv4Address: string;
    ipv6Address: string;
  }>;
  createdAt?: Date;
}