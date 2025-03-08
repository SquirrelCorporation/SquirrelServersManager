import { Injectable } from '@nestjs/common';
import { ContainerCustomStack } from '../../domain/entities/container-custom-stack.entity';

@Injectable()
export class ContainerCustomStackMapper {
  toDomain(entity: any): ContainerCustomStack | null {
    if (!entity) {return null;}

    return {
      name: entity.name,
      description: entity.description,
      path: entity.path,
      uuid: entity.uuid,
      yaml: entity.yaml,
      icon: entity.icon,
      iconColor: entity.iconColor,
      iconBackgroundColor: entity.iconBackgroundColor,
      lockJson: entity.lockJson,
      type: entity.type,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  toDomainList(entities: any[]): ContainerCustomStack[] {
    if (!entities) {return [];}
    return entities
      .map(entity => this.toDomain(entity))
      .filter((entity): entity is ContainerCustomStack => entity !== null);
  }

  toPersistence(domainEntity: ContainerCustomStack): any {
    return {
      name: domainEntity.name,
      description: domainEntity.description,
      path: domainEntity.path,
      uuid: domainEntity.uuid,
      yaml: domainEntity.yaml,
      icon: domainEntity.icon,
      iconColor: domainEntity.iconColor,
      iconBackgroundColor: domainEntity.iconBackgroundColor,
      lockJson: domainEntity.lockJson,
      type: domainEntity.type,
      createdAt: domainEntity.createdAt,
      updatedAt: domainEntity.updatedAt
    };
  }
}