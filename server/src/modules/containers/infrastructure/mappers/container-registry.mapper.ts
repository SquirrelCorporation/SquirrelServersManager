import { ContainerRegistryEntity } from '../../domain/entities/container-registry.entity';
import { ContainerRegistryDocument } from '../schemas/container-registry.schema';

/**
 * Maps between container registry documents and entities
 */
export class ContainerRegistryMapper {
  /**
   * Maps a container registry document to an entity
   * @param document Container registry document
   * @returns Container registry entity
   */
  static toEntity(document: any): ContainerRegistryEntity | null {
    if (!document) {
      return null;
    }

    return {
      ...document,
      _id: document._id?.toString(),
    };
  }

  /**
   * Maps multiple container registry documents to entities
   * @param documents Container registry documents
   * @returns Container registry entities
   */
  static toEntities(documents: ContainerRegistryDocument[]): ContainerRegistryEntity[] {
    if (!documents) {
      return [];
    }

    return documents.map(document => this.toEntity(document)).filter((entity): entity is ContainerRegistryEntity => entity !== null);
  }

  /**
   * Maps an entity or partial entity to document properties
   * @param entity Container registry entity
   * @returns Container registry document properties
   */
  static toDocument(entity: Partial<ContainerRegistryEntity>): Partial<ContainerRegistryDocument> {
    const document: any = { ...entity };

    return document;
  }
}
