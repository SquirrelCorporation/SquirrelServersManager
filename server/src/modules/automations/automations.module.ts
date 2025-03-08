import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContainersModule } from '../containers/containers.module';
import { PlaybooksModule } from '../playbooks/playbooks.module';
import { AnsibleModule } from '../ansible/ansible.module';
import { UsersModule } from '../users/users.module';
import { AutomationEngine } from './application/services/automation-engine.service';
import { AutomationsService } from './application/services/automations.service';
import { AutomationRepository } from './infrastructure/repositories/automation.repository';
import { Automation, AutomationSchema } from './infrastructure/schemas/automation.schema';
import { AutomationsController } from './presentation/controllers/automations.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Automation.name, schema: AutomationSchema }]),
    ContainersModule,
    PlaybooksModule,
    AnsibleModule,
    UsersModule
  ],
  controllers: [AutomationsController],
  providers: [AutomationsService, AutomationEngine, AutomationRepository],
  exports: [AutomationsService, AutomationEngine],
})
export class AutomationsModule {}
