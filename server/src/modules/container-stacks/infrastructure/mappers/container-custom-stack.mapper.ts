import { Injectable } from '@nestjs/common';
import { ContainerCustomStack } from '../../domain/entities/container-custom-stack.entity';

@Injectable()
export class ContainerCustomStackMapper {
  toDomain(entity: any): ContainerCustomStack | null {
    if (!entity) {
      return null;
    }

    return {
      _id: entity._id.toString(),
      ...entity,
    };
  }

  toDomainList(entities: any[]): ContainerCustomStack[] {
    if (!entities) {
      return [];
    }
    return entities
      .map((entity) => this.toDomain(entity))
      .filter((entity): entity is ContainerCustomStack => entity !== null);
  }

  toPersistence(entity: ContainerCustomStack): any {
    const document: any = { ...entity };

    return document;
  }
}
