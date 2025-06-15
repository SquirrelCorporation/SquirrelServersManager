import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse } from '@infrastructure/models/api-response.model';

export const PLAYBOOK_DIAGNOSTIC_TAG = 'PlaybooksDiagnostic';

export const CheckDeviceConnectionDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Check device connection using diagnostic playbook' }),
    ApiParam({ name: 'uuid', description: 'Device UUID to check connection for' }),
    ApiResponse({
      status: 200,
      description: 'Returns task ID for the diagnostic execution',
      schema: {
        properties: {
          taskId: { type: 'string', description: 'Execution task ID' },
        },
      },
    }),
    ApiResponse({
      status: 404,
      type: ApiErrorResponse,
      description: 'Device or diagnostic playbook not found',
    }),
  );
