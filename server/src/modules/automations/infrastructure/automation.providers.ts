import { Provider } from '@nestjs/common';
import { AutomationEngine } from '../automation-engine.service';
import { AutomationsService } from '../automations.service';

export const AUTOMATION_PROVIDERS: Provider[] = [AutomationsService, AutomationEngine];
