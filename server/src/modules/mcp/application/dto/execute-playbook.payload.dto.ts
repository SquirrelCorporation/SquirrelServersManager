import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { IUser } from '@modules/users';

export class ExecutePlaybookPayloadDto {
  @ApiProperty({
    description: 'The Uuid of the playbook to execute',
    example: '11111111-1111-1111-1111-111111111111',
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  playbookUuid!: string;

  @ApiProperty({
    description: 'The quick reference of the playbook to execute',
    example: 'playbook-name',
  })
  @IsString()
  @IsOptional()
  playbookQuickRef!: string;

  @ApiProperty({
    description: 'Optional target filter (e.g., specific hostnames or group names)',
    example: 'webservers',
    required: false,
  })
  @IsOptional()
  @IsArray()
  target?: string[];

  @ApiProperty({
    description: 'The user to execute the playbook',
    example: { name: 'John Doe', email: 'john.doe@example.com' },
  })
  @IsObject()
  user!: IUser;
}
