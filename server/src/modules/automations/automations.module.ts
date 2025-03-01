import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutomationEngine } from './automation-engine.service';
import { AutomationsController } from './automations.controller';
import { AutomationsService } from './automations.service';
import { Automation, AutomationSchema } from './schemas/automation.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Automation.name, schema: AutomationSchema }])],
  controllers: [AutomationsController],
  providers: [AutomationsService, AutomationEngine],
  exports: [AutomationsService, AutomationEngine],
})
export class AutomationsModule {}
