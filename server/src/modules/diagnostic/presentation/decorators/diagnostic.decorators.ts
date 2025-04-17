import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponse } from '@infrastructure/decorators/api-error-response.decorator';
import { ApiSuccessResponse } from '@infrastructure/decorators/api-success-response.decorator';
import { DiagnosticReportDto } from '../dtos/diagnostic.dto';

export const DIAGNOSTIC_TAG = 'Diagnostic';

export function RunDiagnosticDoc() {
  return applyDecorators(
    ApiTags(DIAGNOSTIC_TAG),
    ApiOperation({
      summary: 'Run diagnostic checks on a device',
      description:
        'Executes a series of diagnostic checks on the specified device, including SSH connectivity, Docker socket availability, disk space, and CPU/memory information.',
    }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the device to run diagnostics on',
      type: 'string',
      format: 'uuid',
      required: true,
    }),
    ApiSuccessResponse({
      status: 200,
      type: DiagnosticReportDto,
      description: 'Diagnostic checks completed successfully',
    }),
    ApiErrorResponse({
      status: 404,
      description: 'Device or device authentication not found',
    }),
    ApiErrorResponse({
      status: 500,
      description: 'Internal server error occurred during diagnostic checks',
    }),
  );
}
