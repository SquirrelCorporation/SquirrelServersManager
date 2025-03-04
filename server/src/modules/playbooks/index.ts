/**
 * Playbooks module provides functionality for managing playbooks repositories
 * 
 * This module includes:
 * - Services for managing playbooks repositories
 * - Components for interacting with different types of repositories (git, local)
 * - Controllers for API endpoints
 */

// Export the module
export { PlaybooksModule } from './playbooks.module';

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