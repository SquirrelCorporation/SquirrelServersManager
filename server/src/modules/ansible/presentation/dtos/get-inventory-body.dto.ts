import { IsOptional, IsUUID } from 'class-validator';

export class GetInventoryBodyDto {
  @IsOptional()
  @IsUUID()
  target?: string; // Assuming target is a device UUID
}
