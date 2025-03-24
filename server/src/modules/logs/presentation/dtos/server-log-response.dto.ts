export class ServerLogResponseDto {
  level?: number;
  time?: Date;
  pid?: number;
  hostname?: string;
  msg?: string;
  req?: any;
  res?: any;
  err?: any;
}
