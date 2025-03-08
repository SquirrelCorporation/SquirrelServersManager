import { IDevice, IDeviceAuth } from '../devices';
import { DiagnosticService } from './application/services/diagnostic.service';
import { DiagnosticReport } from './domain/entities/diagnostic.entity';
import { IDiagnosticRepository } from './domain/repositories/diagnostic-repository.interface';
import { DiagnosticRepository } from './infrastructure/repositories/diagnostic.repository';
import { DiagnosticController } from './presentation/controllers/diagnostic.controller';
import { DiagnosticMapper } from './presentation/mappers/diagnostic.mapper';
import { DiagnosticParamDto, DiagnosticReportDto, DiagnosticResultDto } from './presentation/dtos/diagnostic.dto';

// This is a compatibility layer for legacy code
let diagnosticService: DiagnosticService | null = null;

export function setDiagnosticService(service: DiagnosticService) {
  diagnosticService = service;
}

export default {
  run: async (device: IDevice, deviceAuth: IDeviceAuth) => {
    if (!diagnosticService) {
      throw new Error('DiagnosticService not initialized');
    }
    return diagnosticService.run(device, deviceAuth);
  },
};

export {
  DiagnosticService,
  DiagnosticReport,
  IDiagnosticRepository,
  DiagnosticRepository,
  DiagnosticController,
  DiagnosticMapper,
  DiagnosticParamDto,
  DiagnosticReportDto,
  DiagnosticResultDto
};
