import { Injectable } from '@nestjs/common';
import { IContainerCustomStackRepositoryEntity } from '../../domain/entities/container-custom-stack.entity';

@Injectable()
export class ContainerCustomStackRepositoryMapper {
  toDomain(entity: any): IContainerCustomStackRepositoryEntity | null {
    if (!entity) {
      return null;
    }

    return {
      _id: entity._id.toString(),
      ...entity,
    };
  }

  toDomainList(entities: any[]): IContainerCustomStackRepositoryEntity[] {
    if (!entities) {
      return [];
    }
    return entities
      .map((entity) => this.toDomain(entity))
      .filter((entity): entity is IContainerCustomStackRepositoryEntity => entity !== null);
  }

  toPersistence(entity: IContainerCustomStackRepositoryEntity): any {
    const document: any = { ...entity };

    return document;
  }
}
