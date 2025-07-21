import { IsString } from 'class-validator';

export class GetInventoryQueryDto {
  @IsString()
  execUuid!: string;
}
