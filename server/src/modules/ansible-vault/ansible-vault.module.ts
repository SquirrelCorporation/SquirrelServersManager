import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnsibleVaultService } from './application/services/ansible-vault.service';
import { VaultCryptoService } from './application/services/vault-crypto.service';
import { AnsibleVaultController } from './presentation/controllers/ansible-vault.controller';
import { ANSIBLE_VAULT, AnsibleVaultSchema } from './infrastructure/schemas/ansible-vault.schema';
import { AnsibleVaultRepositoryMapper } from './infrastructure/mappers/ansible-vault-repository.mapper';
import { AnsibleVaultRepository } from './infrastructure/repositories/ansible-vault.repository';
import { ANSIBLE_VAULT_REPOSITORY } from './domain/repositories/ansible-vault-repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ANSIBLE_VAULT, schema: AnsibleVaultSchema },
      { name: 'PlaybooksRepository', schema: null, collection: 'playbooksrepository' },
    ]),
  ],
  controllers: [AnsibleVaultController],
  providers: [
    AnsibleVaultService,
    VaultCryptoService,
    AnsibleVaultRepositoryMapper,
    {
      provide: ANSIBLE_VAULT_REPOSITORY,
      useClass: AnsibleVaultRepository,
    },
  ],
  exports: [AnsibleVaultService, VaultCryptoService],
})
export class AnsibleVaultModule {} 