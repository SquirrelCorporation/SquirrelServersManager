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
  static toEntity(document: ContainerRegistryDocument): ContainerRegistryEntity {
    if (!document) {
      return null;
    }
    
    return {
      id: document._id?.toString(),
      name: document.name,
      auth: document.auth,
      authScheme: document.authScheme,
      provider: document.provider,
      authSet: document.authSet,
      canAuth: document.canAuth,
      canAnonymous: document.canAnonymous,
      fullName: document.fullName,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
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
    
    return documents.map(document => this.toEntity(document));
  }

  /**
   * Maps an entity or partial entity to document properties
   * @param entity Container registry entity
   * @returns Container registry document properties
   */
  static toDocument(entity: Partial<ContainerRegistryEntity>): Partial<ContainerRegistryDocument> {
    const document: Partial<ContainerRegistryDocument> = {};
    
    if (entity.name !== undefined) document.name = entity.name;
    if (entity.auth !== undefined) document.auth = entity.auth;
    if (entity.authScheme !== undefined) document.authScheme = entity.authScheme;
    if (entity.provider !== undefined) document.provider = entity.provider;
    if (entity.authSet !== undefined) document.authSet = entity.authSet;
    if (entity.canAuth !== undefined) document.canAuth = entity.canAuth;
    if (entity.canAnonymous !== undefined) document.canAnonymous = entity.canAnonymous;
    if (entity.fullName !== undefined) document.fullName = entity.fullName;
    
    return document;
  }
}
