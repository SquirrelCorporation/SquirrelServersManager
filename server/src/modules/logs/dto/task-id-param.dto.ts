import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class TaskIdParamDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  id!: string;
}
