import { ContainerVolumeEntity } from '../../domain/entities/container-volume.entity';

/**
 * Mapper class to transform between volume entities and documents
 */
export class ContainerVolumeMapper {
  /**
   * Map from document to entity
   */
  static toEntity(document: any): ContainerVolumeEntity {
    return {
      id: document.id,
      uuid: document.uuid,
      name: document.name,
      deviceUuid: document.deviceUuid,
      driver: document.driver,
      scope: document.scope,
      mountpoint: document.mountpoint,
      driver_opts: document.driver_opts,
      options: document.options,
      labels: document.labels,
      usage: document.usage,
      containers: document.containers,
      createdAt: document.createdAt,
    };
  }

  /**
   * Map from entity to document
   */
  static toDocument(entity: ContainerVolumeEntity): any {
    return {
      id: entity.id,
      uuid: entity.uuid,
      name: entity.name,
      deviceUuid: entity.deviceUuid,
      driver: entity.driver,
      scope: entity.scope,
      mountpoint: entity.mountpoint,
      driver_opts: entity.driver_opts,
      options: entity.options,
      labels: entity.labels,
      usage: entity.usage,
      containers: entity.containers,
      createdAt: entity.createdAt || new Date(),
    };
  }
}