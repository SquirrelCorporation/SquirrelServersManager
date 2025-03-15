import { SSMServicesTypes } from '../../../../types/typings';

/**
 * Domain entity for a container
 */
export interface ContainerEntity {
  id: string;
  uuid: string;
  name: string;
  deviceUuid: string;
  image: string;
  shortId?: string;
  state?: string;
  status?: string;
  createdAt?: Date;
  labels?: Record<string, string>;
  hostConfig?: any;
  networkMode?: string;
  networks?: Record<string, any>;
  mounts?: any[];
  command?: string;
  ports?: Record<string, any>;
  containerConfig?: SSMServicesTypes.ContainerConfig;
  restart?: string;
  timestamp?: string;
  watchers?: string[];
  stats?: any;
  kind?: string;
  env?: string[];
  oomKilled?: boolean;
  isManaged?: boolean;
  isWatched?: boolean;
}