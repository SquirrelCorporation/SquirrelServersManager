import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TaskEventDto {
  @IsNotEmpty()
  @IsString()
  runner_ident!: string;

  @IsOptional()
  @IsString()
  uuid?: string;

  @IsOptional()
  @IsString()
  stdout?: string;

  // Additional fields from the original payload can be added here
  // These are kept optional as different event types may have different payloads
  [key: string]: any;
}
