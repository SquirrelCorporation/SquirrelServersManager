import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { HEALTH_TAG, PingDoc } from './decorators/health.decorators';
import { HealthResponseDto } from './presentation/dtos/health.dto';

@ApiTags(HEALTH_TAG)
@Controller()
export class HealthController {
  @Public()
  @Get('ping')
  @PingDoc()
  ping(): HealthResponseDto {
    return { status: 'ok' };
  }
}
