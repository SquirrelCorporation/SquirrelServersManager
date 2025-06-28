import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { HealthControllerDocs, PingDoc } from './decorators/health.decorators';
import { HealthResponseDto } from './presentation/dtos/health.dto';

@HealthControllerDocs()
@Controller()
export class HealthController {
  @Public()
  @Get('ping')
  @PingDoc()
  ping(): HealthResponseDto {
    return { status: 'ok' };
  }
}
