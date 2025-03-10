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
export * from './application/services/repository-tree.service';
export * from './application/services/tree-node.service';

// Infrastructure exports
export * from './infrastructure/repositories/playbook.repository';
export * from './infrastructure/repositories/playbooks-register.repository';
export * from './application/services/components/git-playbooks-register.service';
export * from './infrastructure/repositories/local-playbooks-repository.service';
export * from './application/services/components/playbooks-register-engine.service';
export * from './application/services/components/default-playbooks-register.service';
export * from './infrastructure/schemas/playbook.schema';
export * from './infrastructure/schemas/playbooks-register.schema';

// Presentation exports
export * from './presentation/controllers/playbook.controller';
export * from './presentation/controllers/playbooks-repository.controller';
export * from './presentation/controllers/git-playbooks-repository.controller';
export * from './presentation/controllers/local-playbooks-repository.controller';

// Re-export the module
export { PlaybooksModule };

// Export bridge classes for backward compatibility
export { default as PlaybooksRepository } from './components/PlaybooksRepository';
export { default as PlaybooksRepositoryEngine } from './engines/PlaybooksRepositoryEngine';
export { PlaybooksRepositoryComponent } from './components/playbooks-repository.component';
export { GitPlaybooksRepositoryComponent } from './components/git-playbooks-repository.component';
export { LocalPlaybooksRepositoryComponent } from './components/local-playbooks-repository.component';

// Export services
export { PlaybooksRepositoryService } from './services/playbooks-repository.service';
export { GitPlaybooksRepositoryService } from './services/git-playbooks-repository.service';
export { LocalPlaybooksRepositoryService } from './services/local-playbooks-repository.service';
export { RepositoryTreeService } from './services/repository-tree.service';
export { PlaybooksRepositoryRepository } from './repositories/playbooks-repository.repository';
export { PlaybooksRepositoryEngineService } from './services/playbooks-repository-engine.service';

// Export controllers
export { PlaybooksRepositoryController } from './controllers/playbooks-repository.controller';
export { GitPlaybooksRepositoryController } from './controllers/git-playbooks-repository.controller';
export { LocalPlaybooksRepositoryController } from './controllers/local-playbooks-repository.controller';