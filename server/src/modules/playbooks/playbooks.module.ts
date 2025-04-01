import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PLAYBOOKS_REGISTER_ENGINE_SERVICE } from '@modules/playbooks';
import { VAULT_CRYPTO_SERVICE } from '@modules/ansible-vaults';
import { ShellModule } from '@modules/shell';
import { AnsibleModule } from '@modules/ansible';
import { AnsibleVaultsModule } from '@modules/ansible-vaults';
import { DevicesModule } from '@modules/devices';
import { VaultCryptoService } from '../ansible-vaults/application/services/vault-crypto.service';
import { PlaybookDiagnosticController } from './presentation/controllers/playbook-diagnostic.controller';
import { PLAYBOOKS_SERVICE } from './application/interfaces/playbooks-service.interface';
import { PlaybookService } from './application/services/playbook.service';
import { PlaybooksRegisterService } from './application/services/playbooks-register.service';
import { TreeNodeService } from './application/services/tree-node.service';
import { RegisterTreeService } from './application/services/register-tree.service';
import { PlaybookRepository } from './infrastructure/repositories/playbook.repository';
import { PlaybooksRegisterRepository } from './infrastructure/repositories/playbooks-register.repository';
import { PlaybooksRegisterEngineService } from './application/services/engine/playbooks-register-engine.service';
import { DefaultPlaybooksRegisterService } from './application/services/default-playbooks-register.service';
import { PlaybooksRegisterComponentFactory } from './application/services/components/component-factory.service';
import { PlaybookController } from './presentation/controllers/playbook.controller';
import { PlaybooksRepositoryController } from './presentation/controllers/playbooks-repository.controller';
import { GitPlaybooksRepositoryController } from './presentation/controllers/git-playbooks-register.controller';
import { LocalPlaybooksRepositoryController } from './presentation/controllers/local-playbooks-register.controller';
import { Playbook, PlaybookSchema } from './infrastructure/schemas/playbook.schema';
import {
  PlaybooksRegister,
  PlaybooksRegisterSchema,
} from './infrastructure/schemas/playbooks-register.schema';
import { PLAYBOOK_REPOSITORY } from './domain/repositories/playbook-repository.interface';
import { PLAYBOOKS_REGISTER_REPOSITORY } from './domain/repositories/playbooks-register-repository.interface';
import { PLAYBOOKS_REGISTER_SERVICE } from './domain/services/playbooks-register-service.interface';
import { TREE_NODE_SERVICE } from './domain/interfaces/tree-node-service.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Playbook.name, schema: PlaybookSchema },
      { name: PlaybooksRegister.name, schema: PlaybooksRegisterSchema },
    ]),
    ShellModule,
    AnsibleModule,
    AnsibleVaultsModule,
    DevicesModule,
  ],
  controllers: [
    PlaybookController,
    PlaybooksRepositoryController,
    GitPlaybooksRepositoryController,
    LocalPlaybooksRepositoryController,
    PlaybookDiagnosticController,
  ],
  providers: [
    // Application services
    PlaybookService,
    {
      provide: PLAYBOOKS_SERVICE,
      useClass: PlaybookService,
    },
    {
      provide: PLAYBOOKS_REGISTER_SERVICE,
      useClass: PlaybooksRegisterService,
    },
    PlaybooksRegisterService,
    TreeNodeService,
    {
      provide: TREE_NODE_SERVICE,
      useClass: TreeNodeService,
    },
    RegisterTreeService,

    // Infrastructure services
    PlaybooksRegisterEngineService,
    {
      provide: PLAYBOOKS_REGISTER_ENGINE_SERVICE,
      useClass: PlaybooksRegisterEngineService,
    },
    {
      provide: VAULT_CRYPTO_SERVICE,
      useClass: VaultCryptoService,
    },
    DefaultPlaybooksRegisterService,

    // Factory service
    PlaybooksRegisterComponentFactory,

    // Infrastructure repositories
    PlaybooksRegisterRepository,
    PlaybookRepository,
    {
      provide: PLAYBOOK_REPOSITORY,
      useClass: PlaybookRepository,
    },
    {
      provide: PLAYBOOKS_REGISTER_REPOSITORY,
      useClass: PlaybooksRegisterRepository,
    },
  ],
  exports: [
    // Application services
    PLAYBOOKS_SERVICE,
    PlaybookService,
    PLAYBOOKS_REGISTER_SERVICE,
    PlaybooksRegisterService,
    TREE_NODE_SERVICE,
    TreeNodeService,

    // Engine service for external use
    PlaybooksRegisterEngineService,
    PLAYBOOKS_REGISTER_ENGINE_SERVICE,
    VAULT_CRYPTO_SERVICE,
  ],
})
export class PlaybooksModule {}
