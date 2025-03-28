import { Image } from '@modules/containers/types';
import { IDevice } from '@modules/devices/domain/entities/device.entity';

/**
 * Domain entity for a container
 */
export interface IContainer {
  _id?: string;
  deviceUuid?: string;
  device?: IDevice;
  id: string;
  name: string;
  customName?: string;
  displayName?: string;
  displayIcon?: string;
  status: string;
  watcher: string;
  includeTags?: string;
  excludeTags?: string;
  transformTags?: string;
  linkTemplate?: string;
  command?: string;
  ports?: { IP: string; PrivatePort: number; PublicPort: number; Type: string }[];
  networkSettings?: {
    Networks: {
      [p: string]: {
        IPAMConfig?: any;
        Links?: any;
        Aliases?: any;
        NetworkID: string;
        EndpointID: string;
        Gateway: string;
        IPAddress: string;
        IPPrefixLen: number;
        IPv6Gateway: string;
        GlobalIPv6Address: string;
        GlobalIPv6PrefixLen: number;
        MacAddress: string;
      };
    };
  };
  mounts?: {
    Name?: string | undefined;
    Type: string;
    Source: string;
    Destination: string;
    Driver?: string | undefined;
    Mode: string;
    RW: boolean;
    Propagation: string;
  }[];
  link?: string;
  image: Image;
  result?: {
    tag: string;
    digest?: string;
    created?: string;
    link?: string;
  };
  error?: {
    message?: string;
  };
  updateAvailable?: boolean;
  updateKind?: {
    kind: 'tag' | 'digest' | 'unknown';
    localValue?: string;
    remoteValue?: string;
    semverDiff?: 'major' | 'minor' | 'patch' | 'prerelease' | 'unknown';
  };
  labels?: {
    [p: string]: string;
  };
  resultChanged?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

// For backward compatibility, keep the old interface name as a type alias
export type IContainerEntity = IContainer;
