import {
  DEVICES_SERVICE,
  DEVICE_AUTH_SERVICE,
  IDeviceAuthService,
  IDevicesService,
} from '@modules/devices';
import { Controller, Inject, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  EntityNotFoundException,
  InternalServerException,
} from '@infrastructure/exceptions/app-exceptions';
import { DiagnosticService } from '../../application/services/diagnostic.service';
import { DiagnosticParamDto, DiagnosticReportDto } from '../dtos/diagnostic.dto';
import { DiagnosticMapper } from '../mappers/diagnostic.mapper';
import { DIAGNOSTIC_TAG } from '../decorators/diagnostic.decorators';
import { RunDiagnosticDoc } from '../decorators/diagnostic.decorators';

@ApiTags(DIAGNOSTIC_TAG)
@Controller('diagnostic')
export class DiagnosticController {
  constructor(
    private diagnosticService: DiagnosticService,
    private diagnosticMapper: DiagnosticMapper,
    @Inject(DEVICES_SERVICE) private devicesService: IDevicesService,
    @Inject(DEVICE_AUTH_SERVICE) private deviceAuthService: IDeviceAuthService,
  ) {}

  @Post(':uuid')
  @RunDiagnosticDoc()
  async runDiagnostic(@Param() params: DiagnosticParamDto): Promise<DiagnosticReportDto> {
    const { uuid } = params;

    const device = await this.devicesService.findOneByUuid(uuid);
    if (!device) {
      throw new EntityNotFoundException('Device', uuid);
    }

    const deviceAuth = await this.deviceAuthService.findDeviceAuthByDevice(device);
    if (!deviceAuth) {
      throw new EntityNotFoundException('DeviceAuth', `for device ${uuid}`);
    }

    try {
      const report = await this.diagnosticService.run(device, deviceAuth);
      return this.diagnosticMapper.toDto(report);
    } catch (error: any) {
      throw new InternalServerException(error.message);
    }
  }
}
