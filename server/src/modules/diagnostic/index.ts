import { DiagnosticService } from './application/services/diagnostic.service';
import { DiagnosticReport } from './domain/entities/diagnostic.entity';
import { DiagnosticController } from './presentation/controllers/diagnostic.controller';
import { DiagnosticMapper } from './presentation/mappers/diagnostic.mapper';
import {
  DiagnosticParamDto,
  DiagnosticReportDto,
  DiagnosticResultDto,
} from './presentation/dtos/diagnostic.dto';

export {
  DiagnosticService,
  DiagnosticReport,
  DiagnosticController,
  DiagnosticMapper,
  DiagnosticParamDto,
  DiagnosticReportDto,
  DiagnosticResultDto,
};
