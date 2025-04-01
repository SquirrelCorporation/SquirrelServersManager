import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';

@Controller()
export class HealthController {
  @Public()
  @Get('ping')
  ping() {
    return { status: 'ok' };
  }
}
