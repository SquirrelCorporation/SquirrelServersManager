import { Injectable } from '@nestjs/common';
import { IUser } from '../../domain/entities/user.entity';

@Injectable()
export class UserRepositoryMapper {
  toDomain(document: any): IUser | null {
    if (!document) {
      return null;
    }

    return {
      ...document,
      _id: document._id?.toString(),
    };
  }

  toDomainList(persistenceModels: any[]): IUser[] | null {
    if (!persistenceModels) {
      return null;
    }

    return persistenceModels
      .map((model) => this.toDomain(model))
      .filter((model): model is IUser => model !== null);
  }
}
