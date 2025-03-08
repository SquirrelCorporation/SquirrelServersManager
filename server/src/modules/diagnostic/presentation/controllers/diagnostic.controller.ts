import { Controller, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { InternalError, NotFoundError } from '../../../../middlewares/api/ApiError';
import { DiagnosticService } from '../../application/services/diagnostic.service';
import { IDiagnosticRepository } from '../../domain/repositories/diagnostic-repository.interface';
import { DiagnosticParamDto, DiagnosticReportDto } from '../dtos/diagnostic.dto';
import { DiagnosticMapper } from '../mappers/diagnostic.mapper';

@Controller('devices')
@UseGuards(JwtAuthGuard)
export class DiagnosticController {
  constructor(
    private diagnosticService: DiagnosticService,
    @Inject('IDiagnosticRepository') private diagnosticRepository: IDiagnosticRepository,
    private diagnosticMapper: DiagnosticMapper
  ) {}

  @Post(':uuid/auth/diagnostic')
  async runDiagnostic(@Param() params: DiagnosticParamDto): Promise<DiagnosticReportDto> {
    const { uuid } = params;

    const device = await this.diagnosticRepository.getDeviceById(uuid);
    if (!device) {
      throw new NotFoundError('Device ID not found');
    }

    const deviceAuth = await this.diagnosticRepository.getDeviceAuthByDevice(device);
    if (!deviceAuth) {
      throw new NotFoundError('Device Auth not found');
    }

    try {
      const report = await this.diagnosticService.run(device, deviceAuth);
      return this.diagnosticMapper.toDto(report);
    } catch (error: any) {
      throw new InternalError(error.message);
    }
  }
}