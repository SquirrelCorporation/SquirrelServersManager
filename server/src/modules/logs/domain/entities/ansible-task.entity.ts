export class AnsibleTaskEntity {
  ident!: string;
  status!: string;
  cmd!: string;
  target?: string[];
  createdAt?: Date;
}
