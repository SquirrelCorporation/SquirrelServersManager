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
      ...document,
      _id: document._id?.toString(),
    };
  }

  /**
   * Map from entity to document
   */
  static toDocument(entity: ContainerImageEntity): any {
    const document: any = { ...entity };

    return document;
  }
}