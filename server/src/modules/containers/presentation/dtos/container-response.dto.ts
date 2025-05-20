import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Image } from '@modules/containers/types';
import { IDevice } from '@modules/devices/domain/entities/device.entity';
import { IContainer } from '../../domain/entities/container.entity';

export class ContainerResponseDto implements IContainer {
  @ApiPropertyOptional()
  _id?: string;

  @ApiPropertyOptional()
  deviceUuid?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: false,
    description: 'Device information',
  })
  device?: IDevice;

  @ApiProperty({ description: 'Container ID' })
  id!: string;

  @ApiProperty({ description: 'Container name' })
  name!: string;

  @ApiPropertyOptional({ description: 'Container custom name' })
  customName?: string;

  @ApiPropertyOptional({ description: 'Container display name' })
  displayName?: string;

  @ApiPropertyOptional({ description: 'Container display icon' })
  displayIcon?: string;

  @ApiProperty({ description: 'Container status' })
  status!: string;

  @ApiProperty({ description: 'Container watcher' })
  watcher!: string;

  @ApiPropertyOptional({ description: 'Include tags' })
  includeTags?: string;

  @ApiPropertyOptional({ description: 'Exclude tags' })
  excludeTags?: string;

  @ApiPropertyOptional({ description: 'Transform tags' })
  transformTags?: string;

  @ApiPropertyOptional({ description: 'Link template' })
  linkTemplate?: string;

  @ApiPropertyOptional({ description: 'Container command' })
  command?: string;

  @ApiPropertyOptional({
    type: 'array',
    description: 'Container ports',
    items: {
      type: 'object',
      properties: {
        IP: { type: 'string' },
        PrivatePort: { type: 'number' },
        PublicPort: { type: 'number' },
        Type: { type: 'string' },
      },
    },
  })
  ports?: { IP: string; PrivatePort: number; PublicPort: number; Type: string }[];

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    description: 'Network settings',
    properties: {
      Networks: {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            NetworkID: { type: 'string' },
            EndpointID: { type: 'string' },
            Gateway: { type: 'string' },
            IPAddress: { type: 'string' },
            IPPrefixLen: { type: 'number' },
            IPv6Gateway: { type: 'string' },
            GlobalIPv6Address: { type: 'string' },
            GlobalIPv6PrefixLen: { type: 'number' },
            MacAddress: { type: 'string' },
          },
        },
      },
    },
  })
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

  @ApiPropertyOptional({
    type: 'array',
    description: 'Container mounts',
    items: {
      type: 'object',
      properties: {
        Name: { type: 'string' },
        Type: { type: 'string' },
        Source: { type: 'string' },
        Destination: { type: 'string' },
        Driver: { type: 'string' },
        Mode: { type: 'string' },
        RW: { type: 'boolean' },
        Propagation: { type: 'string' },
      },
    },
  })
  mounts?: {
    Name?: string;
    Type: string;
    Source: string;
    Destination: string;
    Driver?: string;
    Mode: string;
    RW: boolean;
    Propagation: string;
  }[];

  @ApiPropertyOptional()
  link?: string;

  @ApiProperty({
    type: 'object',
    description: 'Container image',
    additionalProperties: false,
  })
  image!: Image;

  @ApiPropertyOptional({
    type: 'object',
    description: 'Container result',
    properties: {
      tag: { type: 'string' },
      digest: { type: 'string' },
      created: { type: 'string' },
      link: { type: 'string' },
    },
    additionalProperties: false,
  })
  result?: {
    tag: string;
    digest?: string;
    created?: string;
    link?: string;
  };

  @ApiPropertyOptional({
    type: 'object',
    description: 'Container error',
    properties: {
      message: { type: 'string' },
    },
    additionalProperties: false,
  })
  error?: {
    message?: string;
  };

  @ApiPropertyOptional({ description: 'Whether an update is available' })
  updateAvailable?: boolean;

  @ApiPropertyOptional({
    type: 'object',
    description: 'Update kind information',
    properties: {
      kind: { type: 'string', enum: ['tag', 'digest', 'unknown'] },
      localValue: { type: 'string' },
      remoteValue: { type: 'string' },
      semverDiff: { type: 'string', enum: ['major', 'minor', 'patch', 'prerelease', 'unknown'] },
    },
    additionalProperties: false,
  })
  updateKind?: {
    kind: 'tag' | 'digest' | 'unknown';
    localValue?: string;
    remoteValue?: string;
    semverDiff?: 'major' | 'minor' | 'patch' | 'prerelease' | 'unknown';
  };

  @ApiPropertyOptional({
    type: 'object',
    description: 'Container labels',
    additionalProperties: {
      type: 'string',
    },
  })
  labels?: {
    [p: string]: string;
  };

  @ApiPropertyOptional({ description: 'Result changed' })
  resultChanged?: any;

  @ApiPropertyOptional({ type: 'string', format: 'date-time', description: 'Creation date' })
  createdAt?: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time', description: 'Last update date' })
  updatedAt?: Date;

  constructor(partial: Partial<ContainerResponseDto>) {
    Object.assign(this, partial);
  }
}
