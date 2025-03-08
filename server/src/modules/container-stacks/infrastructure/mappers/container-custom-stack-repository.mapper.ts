import { Injectable } from '@nestjs/common';
import { IContainerCustomStackRepositoryEntity } from '../../domain/entities/container-custom-stack.entity';

@Injectable()
export class ContainerCustomStackRepositoryMapper {
  toDomain(entity: any): IContainerCustomStackRepositoryEntity | null {
    if (!entity) {return null;}

    return {
      uuid: entity.uuid,
      name: entity.name,
      url: entity.url,
      description: entity.description,
      matchesList: entity.matchesList,
      accessToken: entity.accessToken,
      branch: entity.branch,
      email: entity.email,
      userName: entity.userName,
      remoteUrl: entity.remoteUrl,
      gitService: entity.gitService,
      ignoreSSLErrors: entity.ignoreSSLErrors,
      onError: entity.onError,
      onErrorMessage: entity.onErrorMessage,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  toDomainList(entities: any[]): IContainerCustomStackRepositoryEntity[] {
    if (!entities) {return [];}
    return entities
      .map(entity => this.toDomain(entity))
      .filter((entity): entity is IContainerCustomStackRepositoryEntity => entity !== null);
  }

  toPersistence(domainEntity: IContainerCustomStackRepositoryEntity): any {
    return {
      uuid: domainEntity.uuid,
      name: domainEntity.name,
      url: domainEntity.url,
      description: domainEntity.description,
      matchesList: domainEntity.matchesList,
      accessToken: domainEntity.accessToken,
      branch: domainEntity.branch,
      email: domainEntity.email,
      userName: domainEntity.userName,
      remoteUrl: domainEntity.remoteUrl,
      gitService: domainEntity.gitService,
      ignoreSSLErrors: domainEntity.ignoreSSLErrors,
      onError: domainEntity.onError,
      onErrorMessage: domainEntity.onErrorMessage,
      createdAt: domainEntity.createdAt,
      updatedAt: domainEntity.updatedAt
    };
  }
}