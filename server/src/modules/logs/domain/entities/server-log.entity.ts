export class ServerLogEntity {
  level?: number;
  time?: Date;
  pid?: number;
  hostname?: string;
  msg?: string;
  req?: any;
  res?: any;
  err?: any;
}
