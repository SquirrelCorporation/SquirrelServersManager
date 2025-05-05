import { IsNotEmpty, IsString } from 'class-validator';

export class SettingDto {
  @IsNotEmpty()
  @IsString()
  value!: string;
}