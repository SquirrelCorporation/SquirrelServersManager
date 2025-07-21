import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetContainerPayloadDto {
  @ApiProperty({
    description: 'The ID or name of the container to retrieve',
    example: 'nginx-proxy', // Could be MongoId or Docker ID/name
  })
  @IsString() // Keeping as string to allow Docker ID/name
  @IsNotEmpty()
  containerId!: string;
}
