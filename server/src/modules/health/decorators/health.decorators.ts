import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponse } from '@infrastructure/decorators/api-standard-response.decorator';
import { HealthResponseDto } from '../presentation/dtos/health.dto';

export const HEALTH_TAG = 'Health';

export const HealthControllerDocs = () => applyDecorators(ApiTags(HEALTH_TAG));

export function PingDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Health check endpoint',
      description: 'Returns ok if the service is running',
    }),
    ApiStandardResponse(HealthResponseDto),
  );
}
