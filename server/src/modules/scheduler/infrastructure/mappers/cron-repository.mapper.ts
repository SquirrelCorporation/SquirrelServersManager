import { Injectable } from '@nestjs/common';
import { ICron } from '../../domain/entities/cron.entity';

@Injectable()
export class CronRepositoryMapper {
  toDomain(persistenceModel: any): ICron | null {
    if (!persistenceModel) { return null; }

    return {
      _id: persistenceModel._id?.toString(),
      name: persistenceModel.name,
      disabled: persistenceModel.disabled,
      lastExecution: persistenceModel.lastExecution,
      expression: persistenceModel.expression,
      createdAt: persistenceModel.createdAt,
      updatedAt: persistenceModel.updatedAt,
    };
  }

  toDomainList(persistenceModels: any[]): ICron[] | null {
    if (!persistenceModels) { return null; }

    return persistenceModels
      .map((model) => this.toDomain(model))
      .filter((model): model is ICron => model !== null);
  }
}