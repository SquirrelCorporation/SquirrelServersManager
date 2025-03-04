import { IsNotEmpty, IsString } from 'class-validator';

export class TaskIdParamDto {
  @IsNotEmpty()
  @IsString()
  id!: string;
}
