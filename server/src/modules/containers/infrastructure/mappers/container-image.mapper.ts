import { ContainerImageEntity } from '../../domain/entities/container-image.entity';

/**
 * Mapper class to transform between image entities and documents
 */
export class ContainerImageMapper {
  /**
   * Map from document to entity
   */
  static toEntity(document: any): ContainerImageEntity {
    return {
      id: document.id,
      uuid: document.uuid,
      deviceUuid: document.deviceUuid,
      name: document.name,
      tag: document.tag,
      registry: document.registry,
      size: document.size,
      createdAt: document.createdAt,
      parentId: document.parentId,
      repoDigests: document.repoDigests,
      labels: document.labels,
      containers: document.containers,
      virtualSize: document.virtualSize,
      shared: document.shared,
    };
  }

  /**
   * Map from entity to document
   */
  static toDocument(entity: ContainerImageEntity): any {
    return {
      id: entity.id,
      uuid: entity.uuid,
      deviceUuid: entity.deviceUuid,
      name: entity.name,
      tag: entity.tag,
      registry: entity.registry,
      size: entity.size,
      createdAt: entity.createdAt || new Date(),
      parentId: entity.parentId,
      repoDigests: entity.repoDigests,
      labels: entity.labels,
      containers: entity.containers,
      virtualSize: entity.virtualSize,
      shared: entity.shared,
    };
  }

  /**
   * Parse Docker image info into entity properties
   */
  static fromDockerImage(dockerImage: any, deviceUuid: string, uuid: string): ContainerImageEntity {
    const repoTags = dockerImage.RepoTags && dockerImage.RepoTags.length > 0 
      ? dockerImage.RepoTags[0] 
      : '<none>:<none>';
    
    // Parse repo:tag format
    const [name, tag] = repoTags.split(':');

    return {
      id: dockerImage.Id.replace('sha256:', ''),
      uuid,
      deviceUuid,
      name,
      tag: tag || 'latest',
      size: dockerImage.Size,
      createdAt: new Date(dockerImage.Created * 1000),
      parentId: dockerImage.ParentId,
      repoDigests: dockerImage.RepoDigests,
      labels: dockerImage.Labels || {},
      containers: [],
      virtualSize: dockerImage.VirtualSize,
    };
  }
}