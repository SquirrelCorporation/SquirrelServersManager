export class ServerLogResponseDto {
  level?: number;
  time?: Date;
  pid?: number;
  hostname?: string;
  context?: string;
  msg?: string;
  req?: any;
  res?: any;
  err?: any;
}
