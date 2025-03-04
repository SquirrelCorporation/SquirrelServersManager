import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { ShellModule } from '../shell/shell.module';
import { PlaybooksRepositoryService } from './services/playbooks-repository.service';
import { GitPlaybooksRepositoryService } from './services/git-playbooks-repository.service';
import { LocalPlaybooksRepositoryService } from './services/local-playbooks-repository.service';
import { PlaybooksRepositoryEngineService } from './services/playbooks-repository-engine.service';
import { PlaybooksRepositoryComponentFactory } from './factories/playbooks-repository-component.factory';
import { Playbook as PlaybookComponent, PlaybookRepository as PlaybookRepositoryComponent } from './components/playbooks-repository.component';
import { GitPlaybooksRepositoryComponent } from './components/git-playbooks-repository.component';
import { LocalPlaybooksRepositoryComponent } from './components/local-playbooks-repository.component';
import { TreeNodeService } from './services/tree-node.service';
import { DefaultPlaybooksRepositoriesService } from './services/default-playbooks-repositories.service';
import { PlaybooksRepositoryController } from './controllers/playbooks-repository.controller';
import { GitPlaybooksRepositoryController } from './controllers/git-playbooks-repository.controller';
import { LocalPlaybooksRepositoryController } from './controllers/local-playbooks-repository.controller';
import { PlaybooksRepositoryRepository } from './repositories/playbooks-repository.repository';
import { Playbook, PlaybookSchema } from './schemas/playbook.schema';
import { PlaybookRepository } from './repositories/playbook.repository';
import { PlaybookService } from './services/playbook.service';
import { PlaybookController } from './controllers/playbook.controller';

// Define schemas
const PlaybookComponentSchema = {
  name: PlaybookComponent.name,
  schema: {
    uuid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    path: { type: String, required: true },
    custom: { type: Boolean, default: true },
    repositoryUuid: { type: String, required: true },
    playableInBatch: { type: Boolean, default: false },
    extraVars: { type: Object },
    uniqueQuickRef: { type: String },
  },
};

const PlaybookRepositoryComponentSchema = {
  name: PlaybookRepositoryComponent.name,
  schema: {
    uuid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['git', 'local'] },
    directory: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    default: { type: Boolean, default: false },
    branch: { type: String },
    email: { type: String },
    gitUserName: { type: String },
    accessToken: { type: String },
    remoteUrl: { type: String },
    gitService: { type: String },
    ignoreSSLErrors: { type: Boolean, default: false },
    tree: { type: Object },
  },
};

/**
 * PlaybooksModule provides services for managing playbooks repositories
 */
@Module({
  imports: [
    ShellModule,
    EventEmitterModule.forRoot(),
    MongooseModule.forFeature([
      PlaybookComponentSchema,
      PlaybookRepositoryComponentSchema,
      { name: Playbook.name, schema: PlaybookSchema },
    ]),
  ],
  controllers: [
    PlaybooksRepositoryController,
    GitPlaybooksRepositoryController,
    LocalPlaybooksRepositoryController,
    PlaybookController,
  ],
  providers: [
    // Services
    PlaybooksRepositoryService,
    GitPlaybooksRepositoryService,
    LocalPlaybooksRepositoryService,
    PlaybooksRepositoryEngineService,
    PlaybookService,
    
    // Factory
    PlaybooksRepositoryComponentFactory,
    
    // Components
    GitPlaybooksRepositoryComponent,
    LocalPlaybooksRepositoryComponent,
    
    // Utils
    TreeNodeService,
    DefaultPlaybooksRepositoriesService,
    
    // Repositories
    PlaybooksRepositoryRepository,
    PlaybookRepository,
  ],
  exports: [
    PlaybooksRepositoryService,
    GitPlaybooksRepositoryService,
    LocalPlaybooksRepositoryService,
    PlaybooksRepositoryEngineService,
    PlaybooksRepositoryComponentFactory,
    TreeNodeService,
    DefaultPlaybooksRepositoriesService,
    MongooseModule,
    PlaybookService,
    PlaybookRepository,
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