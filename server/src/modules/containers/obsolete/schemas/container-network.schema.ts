import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export const CONTAINER_NETWORK = 'ContainerNetwork';

export type ContainerNetworkDocument = ContainerNetwork & Document;

interface NetworkContainer {
  Name: string;
  EndpointID: string;
  MacAddress: string;
  IPv4Address: string;
  IPv6Address: string;
}

interface IPAM {
  Driver: string;
  Options: { [key: string]: string } | null;
  Config: { Subnet: string; Gateway: string }[];
}

@Schema({ timestamps: true })
export class ContainerNetwork {
  @Prop({ type: String })
  name!: string;

  @Prop({ type: String, required: true, default: 'unknown' })
  status!: string;

  @Prop({ type: String, required: true })
  watcher!: string;

  @Prop({ type: String, required: true })
  id!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Device', required: true, index: true })
  device: any;

  @Prop({ type: String, required: false })
  created!: string;

  @Prop({ type: String, required: false })
  scope!: string;

  @Prop({ type: String, required: false })
  driver!: string;

  @Prop({ type: Boolean })
  enableIPv6!: boolean;

  @Prop({ type: Object, required: false })
  ipam?: IPAM;

  @Prop({ type: Boolean, required: false })
  internal!: boolean;

  @Prop({ type: Boolean, required: false })
  attachable!: boolean;

  @Prop({ type: Boolean , required: false})
  ingress!: boolean;

  @Prop({ type: Object, required: false })
  configFrom?: { Network: string };

  @Prop({ type: Boolean })
  configOnly!: boolean;

  @Prop({ type: Object })
  containers?: { [id: string]: NetworkContainer };

  @Prop({ type: Object })
  options?: { [key: string]: string };

  @Prop({ type: Object })
  labels?: { [key: string]: string };
}

export const ContainerNetworkSchema = SchemaFactory.createForClass(ContainerNetwork);
