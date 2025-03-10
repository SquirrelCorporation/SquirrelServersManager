export class AnsibleLogEntity {
  ident!: string;
  content?: string;
  stdout?: string;
  logRunnerId?: string;
  createdAt?: Date;
}
