import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    description: 'The status of the health check',
    example: 'ok',
    type: String,
  })
  status!: string;
}
