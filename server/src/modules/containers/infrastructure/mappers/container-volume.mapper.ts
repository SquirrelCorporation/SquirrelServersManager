import { IContainerVolumeEntity } from '../../domain/entities/container-volume.entity';

/**
 * Mapper class to transform between volume entities and documents
 */
export class ContainerVolumeMapper {
  /**
   * Map from document to entity
   */
  static toEntity(document: any): IContainerVolumeEntity {
    return {
      ...document,
      _id: document._id?.toString(),
    };
  }

  /**
   * Map from entity to document
   */
  static toDocument(entity: IContainerVolumeEntity): any {
    const document: any = { ...entity };

    return document;
  }
}
