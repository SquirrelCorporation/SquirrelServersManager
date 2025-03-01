import { IsUUID } from 'class-validator';

export class DiagnosticParamDto {
  @IsUUID()
  uuid!: string;
}
