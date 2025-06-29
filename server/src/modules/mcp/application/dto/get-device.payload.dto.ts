import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetDevicePayloadDto {
  @ApiProperty({
    description: 'The UUID of the device to retrieve',
    example: '11111111-1111-1111-1111-111111111111',
  })
  @IsString()
  @IsNotEmpty()
  deviceUuid!: string;
}
