import { Injectable } from '@nestjs/common';
import { AnsibleLogEntity } from '../../domain/entities/ansible-log.entity';
import { AnsibleLog } from '../schemas/ansible-log.schema';

@Injectable()
export class AnsibleLogMapper {
  toDomain(persistenceModel: AnsibleLog): AnsibleLogEntity {
    const entity = new AnsibleLogEntity();
    entity.ident = persistenceModel.ident;
    entity.content = persistenceModel.content;
    entity.stdout = persistenceModel.stdout;
    entity.logRunnerId = persistenceModel.logRunnerId;
    entity.createdAt = (persistenceModel as any).createdAt;
    return entity;
  }

  toPersistence(domainModel: Partial<AnsibleLogEntity>): Partial<AnsibleLog> {
    return {
      ident: domainModel.ident,
      content: domainModel.content,
      stdout: domainModel.stdout,
      logRunnerId: domainModel.logRunnerId,
    };
  }
}