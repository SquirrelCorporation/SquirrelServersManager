export class AnsibleLogEntity {
  _id?: string;
  ident!: string;
  content?: string;
  stdout?: string;
  logRunnerId?: string;
  createdAt?: Date;
}
