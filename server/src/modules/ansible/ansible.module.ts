import { Module } from '@nestjs/common';
import { ShellModule } from '../shell/shell.module';
import { SmartFailureModule } from '../smart-failure/smart-failure.module';
import { AnsibleCommandService } from './services/ansible-command.service';
import { AnsibleCommandBuilderService } from './services/ansible-command-builder.service';
import { AnsibleGalaxyCommandService } from './services/ansible-galaxy-command.service';
import { InventoryTransformerService } from './services/inventory-transformer.service';
import { ExtraVarsService } from './services/extra-vars.service';
import { ExtraVarsTransformerService } from './services/extra-vars-transformer.service';

/**
 * AnsibleModule provides services for executing Ansible commands and playbooks
 */
@Module({
  imports: [ShellModule, SmartFailureModule],
  providers: [
    AnsibleCommandService,
    AnsibleCommandBuilderService,
    AnsibleGalaxyCommandService,
    InventoryTransformerService,
    ExtraVarsService,
    ExtraVarsTransformerService,
  ],
  exports: [
    AnsibleCommandService,
    AnsibleCommandBuilderService,
    AnsibleGalaxyCommandService,
    InventoryTransformerService,
    ExtraVarsService,
    ExtraVarsTransformerService,
  ],
})
export class AnsibleModule {}
