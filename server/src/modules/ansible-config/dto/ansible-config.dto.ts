import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO for creating or updating an Ansible configuration entry
 */
export class AnsibleConfigDto {
  @IsString()
  @IsNotEmpty()
  section!: string;

  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty() 
  value!: string;

  @IsBoolean()
  @IsOptional()
  deactivated: boolean = false;

  @IsString()
  @IsOptional()
  description: string = '';
}

/**
 * DTO for deleting an Ansible configuration entry
 */
export class DeleteAnsibleConfigDto {
  @IsString()
  @IsNotEmpty()
  section!: string;

  @IsString()
  @IsNotEmpty()
  key!: string;
}
