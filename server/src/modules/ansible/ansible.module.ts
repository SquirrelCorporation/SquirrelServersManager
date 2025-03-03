import { Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ShellModule } from '../shell/shell.module';
import { SmartFailureModule } from '../smart-failure/smart-failure.module';
import AnsibleCmd from './AnsibleCmd';
import AnsibleGalaxyCmd from './AnsibleGalaxyCmd';
import ExtraVars from './extravars/ExtraVars';
import { AnsibleCommandBuilderService } from './services/ansible-command-builder.service';
import { AnsibleCommandService } from './services/ansible-command.service';
import { AnsibleGalaxyCommandService } from './services/ansible-galaxy-command.service';
import { ExtraVarsTransformerService } from './services/extra-vars-transformer.service';
import { ExtraVarsService } from './services/extra-vars.service';
import { InventoryTransformerService } from './services/inventory-transformer.service';
import InventoryTransformer from './utils/InventoryTransformer';

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
export class AnsibleModule implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  /**
   * Initialize the bridge classes with the ModuleRef
   * to allow them to access the NestJS dependency injection container
   */
  onModuleInit() {
    InventoryTransformer.setModuleRef(this.moduleRef);
    AnsibleCmd.setModuleRef(this.moduleRef);
    AnsibleGalaxyCmd.setModuleRef(this.moduleRef);
    ExtraVars.setModuleRef(this.moduleRef);
  }
}

// Export the bridge classes for backward compatibility
export { default as InventoryTransformer } from './utils/InventoryTransformer';
export { default as AnsibleCmd } from './AnsibleCmd';
export { default as AnsibleGalaxyCmd } from './AnsibleGalaxyCmd';
export { default as ExtraVars } from './extravars/ExtraVars';
