import { Injectable } from '@nestjs/common';
import { IAnsibleVault } from '../../domain/entities/ansible-vault.entity';

@Injectable()
export class AnsibleVaultRepositoryMapper {
  toDomain(persistenceModel: any): IAnsibleVault | null {
    if (!persistenceModel) {
      return null;
    }

    return {
      _id: persistenceModel._id?.toString(),
      ...persistenceModel,
    };
  }

  toDomainList(persistenceModels: any[]): IAnsibleVault[] | null {
    if (!persistenceModels) {
      return null;
    }

    return persistenceModels
      .map((model) => this.toDomain(model))
      .filter((model): model is IAnsibleVault => model !== null);
  }
}
