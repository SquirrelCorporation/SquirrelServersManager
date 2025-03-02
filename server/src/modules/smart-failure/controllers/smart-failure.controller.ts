import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/strategies/jwt-auth.guard';
import { SmartFailureRequestDto } from '../dto/smart-failure.dto';
import { SmartFailureService } from '../services/smart-failure.service';

/**
 * Controller for handling smart failure analysis requests
 */
@Controller('ansible/smart-failure')
@UseGuards(JwtAuthGuard)
export class SmartFailureController {
  constructor(private readonly smartFailureService: SmartFailureService) {}

  /**
   * Get smart failure analysis for a specific Ansible execution
   * @param smartFailureRequestDto Request containing the execution ID
   * @returns Smart failure analysis or undefined if none found
   */
  @Get()
  async getSmartFailure(@Query() smartFailureRequestDto: SmartFailureRequestDto) {
    const { execId } = smartFailureRequestDto;
    const smartFailure =
      await this.smartFailureService.parseAnsibleLogsAndMayGetSmartFailure(execId);

    return {
      status: 'success',
      message: 'May got Ansible SmartFailure',
      data: smartFailure,
    };
  }
}
