/**
 * Playbooks module provides functionality for managing playbooks repositories
 *
 * This module includes:
 * - Services for managing playbooks repositories
 * - Components for interacting with different types of repositories (git, local)
 * - Controllers for API endpoints
 */

import { PlaybooksModule } from './playbooks.module';

// Domain exports
export * from './domain/entities/playbook.entity';
export * from './domain/entities/playbooks-register.entity';
export * from './domain/repositories/playbook-repository.interface';
export * from './domain/repositories/playbooks-register-repository.interface';

// Application exports
export * from './application/services/playbook.service';
export * from './application/services/playbooks-register.service';
export * from './application/services/register-tree.service';
export * from './application/services/tree-node.service';

// Infrastructure exports
export * from './infrastructure/repositories/playbook.repository';
export * from './infrastructure/repositories/playbooks-register.repository';
export * from './application/services/components/git-playbooks-register.component';
export * from './application/services/engine/playbooks-register-engine.service';
export * from './application/services/default-playbooks-register.service';
export * from './infrastructure/schemas/playbook.schema';
export * from './infrastructure/schemas/playbooks-register.schema';

// Presentation exports
export * from './presentation/controllers/playbook.controller';
export * from './presentation/controllers/playbooks-repository.controller';
export * from './presentation/controllers/git-playbooks-register.controller';
export * from './presentation/controllers/local-playbooks-register.controller';

// Re-export the module
export { PlaybooksModule };