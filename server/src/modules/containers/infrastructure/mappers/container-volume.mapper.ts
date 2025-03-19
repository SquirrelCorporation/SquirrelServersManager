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
      ...document,
      _id: document._id?.toString(),
    };
  }

  /**
   * Map from entity to document
   */
  static toDocument(entity: ContainerVolumeEntity): any {
      const document: any = { ...entity };

    return document;
  }
}