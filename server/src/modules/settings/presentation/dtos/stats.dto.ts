import { ApiProperty } from '@nestjs/swagger';

export class MongoDBStatsDto {
  @ApiProperty({ description: 'Number of collections in the database' })
  collections!: number;

  @ApiProperty({ description: 'Total size of the data in bytes' })
  dataSize!: number;

  @ApiProperty({ description: 'Total storage size in bytes' })
  storageSize!: number;

  @ApiProperty({ description: 'Number of indexes' })
  indexes!: number;

  @ApiProperty({ description: 'Total size of all indexes in bytes' })
  indexSize!: number;
}

export class RedisStatsDto {
  @ApiProperty({ description: 'Number of connected clients' })
  connectedClients!: number;

  @ApiProperty({ description: 'Used memory in bytes' })
  usedMemory!: number;

  @ApiProperty({ description: 'Total number of keys in the database' })
  totalKeys!: number;

  @ApiProperty({ description: 'Server uptime in seconds' })
  uptime!: number;
}

export class PrometheusStatsDto {
  @ApiProperty({ description: 'Number of targets being monitored' })
  targets!: number;

  @ApiProperty({ description: 'Number of scrapes performed' })
  scrapes!: number;

  @ApiProperty({ description: 'Number of samples collected' })
  samples!: number;

  @ApiProperty({ description: 'Total storage size in bytes' })
  storageSize!: number;
}
