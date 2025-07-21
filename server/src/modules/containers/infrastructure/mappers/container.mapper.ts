import { Injectable } from '@nestjs/common';
import { IContainer } from '../../domain/entities/container.entity';

@Injectable()
export class ContainerMapper {
  /**
   * Maps a database document to a container entity
   */
  toEntity(document: any): IContainer {
    return {
      ...document,
      _id: document._id?.toString(),
    };
  }

  /**
   * Maps a container entity to a database document
   */
  toDocument(entity: Partial<IContainer>): any {
    const document: any = { ...entity };
    // Remove _id field to prevent MongoDB immutable field update error
    delete document._id;
    return document;
  }
}
