export interface IAnsibleTaskStatus {
  _id?: string;
  taskIdent: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}