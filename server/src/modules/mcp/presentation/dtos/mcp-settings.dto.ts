import { IsArray, IsBoolean, IsOptional, IsString, ValidateIf } from 'class-validator';

// Using 'export class' to make them available for import

export class McpSettingDto {
  @IsBoolean()
  enabled!: boolean;
}

export class UpdateMcpSettingDto {
  @IsBoolean()
  enabled!: boolean;
}

export class AllowedPlaybooksDto {
  // Using 'unknown' here as we perform manual validation in the controller
  // The type is validated in the controller, not strictly via class-validator here
  allowed!: unknown; // Can be string[] or 'all'
}

export class UpdateAllowedPlaybooksDto {
  @ValidateIf((o) => o.allowed !== 'all')
  @IsArray()
  @IsString({ each: true })
  allowed!: string[] | 'all';
}

export class AvailablePlaybookDto {
  @IsString()
  label!: string;
  @IsString()
  value!: string; // UUID
  @IsString()
  @IsOptional()
  quickRef?: string;
}
