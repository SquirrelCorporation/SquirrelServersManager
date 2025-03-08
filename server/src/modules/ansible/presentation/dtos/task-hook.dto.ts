import { IsNotEmpty, IsString } from 'class-validator';

export class TaskHookDto {
  @IsNotEmpty()
  @IsString()
  runner_ident!: string;

  @IsNotEmpty()
  @IsString()
  status!: string;
}