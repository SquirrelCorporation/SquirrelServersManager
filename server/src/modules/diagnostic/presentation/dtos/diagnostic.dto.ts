import { IsUUID } from 'class-validator';
import { DiagnosticCheckType } from '../../domain/entities/diagnostic.entity';

export class DiagnosticParamDto {
  @IsUUID()
  uuid!: string;
}

export class DiagnosticResultDto {
  success!: boolean;
  severity!: 'success' | 'warning' | 'error';
  message!: string;
  data?: any;
}

export class DiagnosticReportDto {
  deviceId!: string;
  timestamp!: Date;
  results!: Record<DiagnosticCheckType, DiagnosticResultDto>;
}