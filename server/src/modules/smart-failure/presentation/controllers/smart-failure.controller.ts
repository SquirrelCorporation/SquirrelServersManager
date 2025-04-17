import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ISmartFailureService,
  SMART_FAILURE_SERVICE,
} from '../../domain/interfaces/smart-failure.service.interface';
import { SmartFailureRequestDto } from '../dtos/smart-failure.dto';
import { GetSmartFailureDoc } from '../decorators/smart-failure.decorators';

/**
 * Controller for handling smart failure analysis requests
 */
@ApiTags('SmartFailure')
@Controller('smart-failure')
export class SmartFailureController {
  constructor(
    @Inject(SMART_FAILURE_SERVICE)
    private readonly smartFailureService: ISmartFailureService,
  ) {}

  /**
   * Get smart failure analysis for a specific Ansible execution
   * @param smartFailureRequestDto Request containing the execution ID
   * @returns Smart failure analysis or undefined if none found
   */
  @Get()
  @GetSmartFailureDoc()
  async getSmartFailure(@Query() smartFailureRequestDto: SmartFailureRequestDto) {
    const { execId } = smartFailureRequestDto;
    const smartFailure =
      await this.smartFailureService.parseAnsibleLogsAndMayGetSmartFailure(execId);

    return smartFailure;
  }
}
