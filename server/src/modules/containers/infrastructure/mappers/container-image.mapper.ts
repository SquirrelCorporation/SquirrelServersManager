import { IContainerImageEntity } from '../../domain/entities/container-image.entity';

/**
 * Mapper class to transform between image entities and documents
 */
export class ContainerImageMapper {
  /**
   * Map from document to entity
   */
  static toEntity(document: any): IContainerImageEntity {
    return {
      ...document,
      _id: document._id?.toString(),
    };
  }

  /**
   * Map from entity to document
   */
  static toDocument(entity: IContainerImageEntity): any {
    const document: any = { ...entity };

    return document;
  }
}
