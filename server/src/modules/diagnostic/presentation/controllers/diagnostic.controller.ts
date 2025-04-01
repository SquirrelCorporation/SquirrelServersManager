import { JwtAuthGuard } from '@modules/auth/strategies/jwt-auth.guard';
import {
  DEVICES_SERVICE,
  DEVICE_AUTH_SERVICE,
  IDeviceAuthService,
  IDevicesService,
} from '@modules/devices';
import { Controller, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { InternalError, NotFoundError } from '../../../../middlewares/api/ApiError';
import { DiagnosticService } from '../../application/services/diagnostic.service';
import { DiagnosticParamDto, DiagnosticReportDto } from '../dtos/diagnostic.dto';
import { DiagnosticMapper } from '../mappers/diagnostic.mapper';

@Controller('diagnostic')
@UseGuards(JwtAuthGuard)
export class DiagnosticController {
  constructor(
    private diagnosticService: DiagnosticService,
    private diagnosticMapper: DiagnosticMapper,
    @Inject(DEVICES_SERVICE) private devicesService: IDevicesService,
    @Inject(DEVICE_AUTH_SERVICE) private deviceAuthService: IDeviceAuthService,
  ) {}

  @Post(':uuid')
  async runDiagnostic(@Param() params: DiagnosticParamDto): Promise<DiagnosticReportDto> {
    const { uuid } = params;

    const device = await this.devicesService.findOneByUuid(uuid);
    if (!device) {
      throw new NotFoundError('Device ID not found');
    }

    const deviceAuth = await this.deviceAuthService.findDeviceAuthByDevice(device);
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
