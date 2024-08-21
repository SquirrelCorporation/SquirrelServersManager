import { Schema, model } from 'mongoose';
import type { SSMServicesTypes } from '../../../types/typings.d.ts';
import Device from './Device';

export const DOCUMENT_NAME = 'Container';
export const COLLECTION_NAME = 'containers';

export default interface Container {
  _id?: string;
  device?: Device;
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
  image: SSMServicesTypes.Image;
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
  resultChanged?: any;
}

const schema = new Schema<Container>(
  {
    device: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
      select: true,
      index: true,
    },
    id: {
      type: Schema.Types.String,
    },
    name: {
      type: Schema.Types.String,
    },
    displayIcon: {
      type: Schema.Types.String,
    },
    displayName: {
      type: Schema.Types.String,
    },
    excludeTags: {
      type: Schema.Types.String,
    },
    includeTags: {
      type: Schema.Types.String,
    },
    status: {
      type: Schema.Types.String,
      default: 'unknown',
    },
    watcher: {
      type: Schema.Types.String,
    },
    transformTags: {
      type: Schema.Types.String,
    },
    linkTemplate: {
      type: Schema.Types.String,
    },
    link: {
      type: Schema.Types.String,
    },
    updateAvailable: {
      type: Schema.Types.Boolean,
      default: false,
    },
    resultChanged: {
      type: Schema.Types.Boolean,
    },
    result: {
      type: Object,
    },
    image: {
      type: Object,
    },
    updateKind: {
      type: Object,
    },
    customName: {
      type: Schema.Types.String,
    },
    command: {
      type: Schema.Types.String,
    },
    networkSettings: {
      type: Object,
    },
  },
  {
    versionKey: false,
  },
);

export const ContainerModel = model<Container>(DOCUMENT_NAME, schema, COLLECTION_NAME);
