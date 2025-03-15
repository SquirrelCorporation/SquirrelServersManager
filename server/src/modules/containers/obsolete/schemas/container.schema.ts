import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { SSMServicesTypes } from '../../../types/typings';

export const CONTAINER = 'Container';

export type ContainerDocument = Container & Document;

@Schema({ timestamps: true, versionKey: false })
export class Container {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Device', required: true, index: true })
  device: any;

  @Prop({ type: String })
  id!: string;

  @Prop({ type: String })
  name!: string;

  @Prop({ type: String })
  customName?: string;

  @Prop({ type: String })
  displayName?: string;

  @Prop({ type: String })
  displayIcon?: string;

  @Prop({ type: String, default: 'unknown' })
  status!: string;

  @Prop({ type: String })
  watcher!: string;

  @Prop({ type: String })
  includeTags?: string;

  @Prop({ type: String })
  excludeTags?: string;

  @Prop({ type: String })
  transformTags?: string;

  @Prop({ type: String })
  linkTemplate?: string;

  @Prop({ type: String })
  command?: string;

  @Prop({ type: Object })
  ports?: { IP: string; PrivatePort: number; PublicPort: number; Type: string }[];

  @Prop({ type: Object })
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

  @Prop({ type: Object })
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

  @Prop({ type: String })
  link?: string;

  @Prop({ type: Object })
  image!: SSMServicesTypes.Image;

  @Prop({ type: Object })
  result?: {
    tag: string;
    digest?: string;
    created?: string;
    link?: string;
  };

  @Prop({ type: Object })
  error?: {
    message?: string;
  };

  @Prop({ type: Boolean, default: false })
  updateAvailable?: boolean;

  @Prop({ type: Object })
  updateKind?: {
    kind: 'tag' | 'digest' | 'unknown';
    localValue?: string;
    remoteValue?: string;
    semverDiff?: 'major' | 'minor' | 'patch' | 'prerelease' | 'unknown';
  };

  @Prop({ type: Object })
  labels?: {
    [p: string]: string;
  };

  @Prop({ type: Boolean })
  resultChanged?: boolean;
}

export const ContainerSchema = SchemaFactory.createForClass(Container);
