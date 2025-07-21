import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ContainersModule } from '../containers/containers.module';
import { PlaybooksModule } from '../playbooks/playbooks.module';
import { AnsibleModule } from '../ansible/ansible.module';
import { UsersModule } from '../users/users.module';
import { AutomationEngine } from './application/services/engine/automation-engine.service';
import { AutomationsService } from './application/services/automations.service';
import { AutomationRepository } from './infrastructure/repositories/automation.repository';
import { Automation, AutomationSchema } from './infrastructure/schemas/automation.schema';
import { AutomationsController } from './presentation/controllers/automations.controller';
import { AUTOMATION_REPOSITORY } from './domain/repositories/automation.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Automation.name, schema: AutomationSchema }]),
    ScheduleModule,
    ContainersModule,
    PlaybooksModule,
    AnsibleModule,
    UsersModule,
  ],
  controllers: [AutomationsController],
  providers: [
    AutomationsService,
    AutomationEngine,
    AutomationRepository,
    {
      provide: AUTOMATION_REPOSITORY,
      useClass: AutomationRepository,
    },
  ],
  exports: [AutomationsService, AutomationEngine],
})
export class AutomationsModule {}
