import { Injectable } from '@nestjs/common';
import { IUser } from '../../domain/entities/user.entity';

@Injectable()
export class UserRepositoryMapper {
  toDomain(persistenceModel: any): IUser | null {
    if (!persistenceModel) { return null; }

    return {
      _id: persistenceModel._id?.toString(),
      name: persistenceModel.name,
      avatar: persistenceModel.avatar,
      email: persistenceModel.email,
      password: persistenceModel.password,
      role: persistenceModel.role,
      apiKey: persistenceModel.apiKey,
      logsLevel: persistenceModel.logsLevel,
      createdAt: persistenceModel.createdAt,
      updatedAt: persistenceModel.updatedAt,
    };
  }

  toDomainList(persistenceModels: any[]): IUser[] | null {
    if (!persistenceModels) { return null; }

    return persistenceModels.map((model) => this.toDomain(model)).filter((model): model is IUser => model !== null);
  }
}