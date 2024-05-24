import { Container } from 'dockerode';
import { Schema, model } from 'mongoose';

export const DOCUMENT_NAME = 'ContainerStat';
export const COLLECTION_NAME = 'containerstats';

export default interface ContainerStat {
  container: Container;
  cpuDelta?: number;
  cpuSystemDelta?: number;
  memUsed?: number;
  memAvailable?: number;
  memUsedPercentage?: number;
  cpuUsedPercentage?: number;
  raw: any;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<ContainerStat>(
  {
    container: {
      type: Schema.Types.ObjectId,
      ref: 'Container',
      required: true,
      select: false,
      index: true,
    },
    raw: {
      type: Object,
    },
    cpuDelta: {
      type: Schema.Types.Number,
    },
    cpuSystemDelta: {
      type: Schema.Types.Number,
    },
    memUsed: {
      type: Schema.Types.Number,
    },
    memAvailable: {
      type: Schema.Types.Number,
    },
    memUsedPercentage: {
      type: Schema.Types.Number,
    },
    cpuUsedPercentage: {
      type: Schema.Types.Number,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const ContainerStatModel = model<ContainerStat>(DOCUMENT_NAME, schema, COLLECTION_NAME);
