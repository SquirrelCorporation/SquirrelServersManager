import { Controller, Get, Query, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/strategies/jwt-auth.guard';
import { ISmartFailureService } from '../../application/interfaces/smart-failure.service.interface';
import { SmartFailureRequestDto } from '../dtos/smart-failure.dto';

/**
 * Controller for handling smart failure analysis requests
 */
@Controller('ansible/smart-failure')
@UseGuards(JwtAuthGuard)
export class SmartFailureController {
  constructor(
    @Inject('ISmartFailureService')
    private readonly smartFailureService: ISmartFailureService
  ) {}

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
