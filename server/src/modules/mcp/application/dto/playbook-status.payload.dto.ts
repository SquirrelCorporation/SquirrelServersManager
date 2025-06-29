import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PlaybookStatusPayloadDto {
  @ApiProperty({ description: 'The ID of the job', example: 123 })
  @IsNotEmpty()
  @IsString()
  execId!: string;
}
