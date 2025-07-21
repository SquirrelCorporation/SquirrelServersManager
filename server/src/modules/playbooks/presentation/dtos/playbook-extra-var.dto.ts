import { ApiProperty } from '@nestjs/swagger';

export class PlaybookExtraVarDto {
  @ApiProperty({ description: 'Unique identifier of the extra variable', example: '1' })
  id: string;

  @ApiProperty({ description: 'Name of the extra variable', example: 'server_port' })
  name: string;

  @ApiProperty({ description: 'Value of the extra variable', example: '8080' })
  value: string;

  @ApiProperty({
    description: 'Description of the extra variable',
    example: 'Port number for the server to listen on',
  })
  description: string;

  constructor() {
    this.id = '';
    this.name = '';
    this.value = '';
    this.description = '';
  }
}
