import { Injectable } from '@nestjs/common';
import { AnsibleTaskEntity } from '../../domain/entities/ansible-task.entity';
import { AnsibleTask } from '../schemas/ansible-task.schema';

@Injectable()
export class AnsibleTaskMapper {
  toDomain(persistenceModel: AnsibleTask): AnsibleTaskEntity {
    const entity = new AnsibleTaskEntity();
    entity.ident = persistenceModel.ident;
    entity.status = persistenceModel.status;
    entity.cmd = persistenceModel.cmd;
    entity.target = persistenceModel.target;
    entity.createdAt = (persistenceModel as any).createdAt;
    return entity;
  }

  toPersistence(domainModel: Partial<AnsibleTaskEntity>): Partial<AnsibleTask> {
    return {
      ident: domainModel.ident,
      status: domainModel.status,
      cmd: domainModel.cmd,
      target: domainModel.target,
    };
  }
}