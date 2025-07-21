import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LocalRepositoryDto {
  @ApiProperty({
    description: 'Name of the local playbook repository',
    example: 'my-ansible-playbooks',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Path to the local playbook repository on the filesystem',
    example: '/path/to/playbooks',
  })
  @IsString()
  @IsNotEmpty()
  path!: string;

  @ApiProperty({
    description: 'Description of the repository contents',
    example: 'Collection of infrastructure automation playbooks',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Whether to automatically sync the repository on changes',
    example: true,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  autoSync?: boolean;
}
