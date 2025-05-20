import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SshSessionDto {
  @IsString()
  @IsNotEmpty()
  deviceUuid!: string;

  @IsNumber()
  @IsNotEmpty()
  rows!: number;

  @IsNumber()
  @IsNotEmpty()
  cols!: number;
}

export class ScreenResizeDto {
  @IsNumber()
  @IsNotEmpty()
  rows!: number;

  @IsNumber()
  @IsNotEmpty()
  cols!: number;
}
