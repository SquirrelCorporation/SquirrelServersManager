import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import DeviceAuthRepo from '../../../data/database/repository/DeviceAuthRepo';
import DeviceRepo from '../../../data/database/repository/DeviceRepo';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { InternalError, NotFoundError } from '../../../middlewares/api/ApiError';
import { DiagnosticParamDto } from '../dto/diagnostic.dto';
import { DiagnosticService } from '../services/diagnostic.service';

@Controller('devices')
@UseGuards(JwtAuthGuard)
export class DiagnosticController {
  constructor(private diagnosticService: DiagnosticService) {}

  @Post(':uuid/auth/diagnostic')
  async runDiagnostic(@Param() params: DiagnosticParamDto) {
    const { uuid } = params;

    const device = await DeviceRepo.findOneByUuid(uuid);
    if (!device) {
      throw new NotFoundError('Device ID not found');
    }

    const deviceAuth = await DeviceAuthRepo.findOneByDevice(device);
    if (!deviceAuth) {
      throw new NotFoundError('Device Auth not found');
    }

    try {
      return await this.diagnosticService.run(device, deviceAuth);
    } catch (error: any) {
      throw new InternalError(error.message);
    }
  }
}
