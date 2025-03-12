import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShellModule } from '../shell/shell.module';
import { AnsibleModule } from '../ansible/ansible.module';
import { PlaybookService } from './application/services/playbook.service';
import { PlaybooksRegisterService } from './application/services/playbooks-register.service';
import { TreeNodeService } from './application/services/tree-node.service';
import { RepositoryTreeService } from './application/services/register-tree.service';

// Infrastructure repositories
import { PlaybookRepository } from './infrastructure/repositories/playbook.repository';
import { PlaybooksRepositoryRepository } from './infrastructure/repositories/playbooks-register.repository';
import { GitPlaybooksRepositoryService } from './application/services/components/git-playbooks-register.service';
import { LocalPlaybooksRepositoryService } from './infrastructure/repositories/local-playbooks-repository.service';
import { PlaybooksRepositoryEngineService } from './application/services/engine/playbooks-register-engine.service';
import { DefaultPlaybooksRepositoriesService } from './application/services/components/default-playbooks-register.service';

// Presentation controllers
import { PlaybookController } from './presentation/controllers/playbook.controller';
import { PlaybooksRepositoryController } from './presentation/controllers/playbooks-repository.controller';
import { GitPlaybooksRepositoryController } from './presentation/controllers/git-playbooks-repository.controller';
import { LocalPlaybooksRepositoryController } from './presentation/controllers/local-playbooks-repository.controller';

// Infrastructure schemas
import { Playbook, PlaybookSchema } from './infrastructure/schemas/playbook.schema';
import { PlaybooksRepository, PlaybooksRepositorySchema } from './infrastructure/schemas/playbooks-register.schema';

// Domain interfaces
import { PLAYBOOK_REPOSITORY } from './domain/repositories/playbook-repository.interface';
import { PLAYBOOKS_REPOSITORY_REPOSITORY } from './domain/repositories/playbooks-register-repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Playbook.name, schema: PlaybookSchema },
      { name: PlaybooksRepository.name, schema: PlaybooksRepositorySchema },
    ]),
    ShellModule,
    AnsibleModule,
  ],
  controllers: [
    PlaybookController,
    PlaybooksRepositoryController,
    GitPlaybooksRepositoryController,
    LocalPlaybooksRepositoryController,
  ],
  providers: [
    // Application services
    PlaybookService,
    PlaybooksRegisterService,
    TreeNodeService,
    RepositoryTreeService,

    // Infrastructure services
    GitPlaybooksRepositoryService,
    LocalPlaybooksRepositoryService,
    PlaybooksRepositoryEngineService,
    DefaultPlaybooksRepositoriesService,

    // Infrastructure repositories
    PlaybooksRepositoryRepository,
    PlaybookRepository,

    // Domain repositories
    {
      provide: PLAYBOOK_REPOSITORY,
      useClass: PlaybookRepository,
    },
    {
      provide: PLAYBOOKS_REPOSITORY_REPOSITORY,
      useClass: PlaybooksRepositoryRepository,
    },
  ],
  exports: [
    // Application services
    PlaybookService,
    PlaybooksRepositoryService,

    // Infrastructure repositories
    PlaybookRepository,
    PlaybooksRepositoryRepository,

    // Domain repositories
    PLAYBOOK_REPOSITORY,
    PLAYBOOKS_REPOSITORY_REPOSITORY,
  ],
})
export class PlaybooksModule {}

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
export { PlaybookService } from './services/playbook.service';
export { PlaybookRepository } from './repositories/playbook.repository';

// Export controllers
export { PlaybooksRepositoryController } from './controllers/playbooks-repository.controller';
export { GitPlaybooksRepositoryController } from './controllers/git-playbooks-repository.controller';
export { LocalPlaybooksRepositoryController } from './controllers/local-playbooks-repository.controller';
export { PlaybookController } from './controllers/playbook.controller';

// Export schemas
export { Playbook } from './schemas/playbook.schema';