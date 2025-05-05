export class ServerLogEntity {
  _id?: string;
  level?: number;
  time?: Date;
  pid?: number;
  hostname?: string;
  msg?: string;
  req?: any;
  res?: any;
  err?: any;
}
