import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShellModule } from '../shell/shell.module';
import { AnsibleModule } from '../ansible/ansible.module';
import { AnsibleVaultModule } from '../ansible-vault/ansible-vault.module';
import { VaultCryptoService } from '../ansible-vault/application/services/vault-crypto.service';
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
import { GitPlaybooksRepositoryController, PLAYBOOKS_REGISTER_ENGINE_SERVICE, VAULT_CRYPTO_SERVICE } from './presentation/controllers/git-playbooks-register.controller';
import { LocalPlaybooksRepositoryController } from './presentation/controllers/local-playbooks-register.controller';
import { Playbook, PlaybookSchema } from './infrastructure/schemas/playbook.schema';
import { PlaybooksRegister, PlaybooksRegisterSchema } from './infrastructure/schemas/playbooks-register.schema';
import { PLAYBOOK_REPOSITORY } from './domain/repositories/playbook-repository.interface';
import { PLAYBOOKS_REGISTER_REPOSITORY } from './domain/repositories/playbooks-register-repository.interface';
import { PLAYBOOKS_REGISTER_SERVICE } from './domain/services/playbooks-register-service.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Playbook.name, schema: PlaybookSchema },
      { name: PlaybooksRegister.name, schema: PlaybooksRegisterSchema },
    ]),
    ShellModule,
    AnsibleModule,
    AnsibleVaultModule,
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
    {
      provide: PLAYBOOKS_REGISTER_SERVICE,
      useClass: PlaybooksRegisterService,
    },
    PlaybooksRegisterService,
    TreeNodeService,
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

    // Domain repositories
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
    PlaybookService,
    PLAYBOOKS_REGISTER_SERVICE,
    PlaybooksRegisterService,

    // Infrastructure repositories
    PlaybookRepository,
    PlaybooksRegisterRepository,

    // Engine service for external use
    PlaybooksRegisterEngineService,
    PLAYBOOKS_REGISTER_ENGINE_SERVICE,
    VAULT_CRYPTO_SERVICE,

    // Domain repositories
    PLAYBOOK_REPOSITORY,
    PLAYBOOKS_REGISTER_REPOSITORY,
  ],
})
export class PlaybooksModule {}