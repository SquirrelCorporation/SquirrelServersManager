import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for updating a setting
 */
export class UpdateSettingDto {
  @IsNotEmpty()
  @IsString()
  value!: string;
}

// For backward compatibility
export type SettingDto = UpdateSettingDto;
