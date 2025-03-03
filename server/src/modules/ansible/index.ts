import { AnsibleCommandService } from './services/ansible-command.service';
import { AnsibleCommandBuilderService } from './services/ansible-command-builder.service';
import { AnsibleGalaxyCommandService } from './services/ansible-galaxy-command.service';
import { InventoryTransformerService } from './services/inventory-transformer.service';
import { ExtraVarsService } from './services/extra-vars.service';
import { ExtraVarsTransformerService } from './services/extra-vars-transformer.service';

// Import old implementations for backward compatibility
import ansibleCmd from './AnsibleCmd';
import AnsibleGalaxyCmd from './AnsibleGalaxyCmd';
import smartFailure from './SmartFailure';

// Export all NestJS services
export {
  AnsibleCommandService,
  AnsibleCommandBuilderService,
  AnsibleGalaxyCommandService,
  InventoryTransformerService,
  ExtraVarsService,
  ExtraVarsTransformerService,
};

// Export old implementations for backward compatibility
export { ansibleCmd, AnsibleGalaxyCmd, smartFailure };

// Default export for backward compatibility
export default {
  AnsibleCommandService,
  ansibleCmd,
  AnsibleGalaxyCmd,
  smartFailure,
};