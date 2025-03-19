import { Injectable } from '@nestjs/common';
import { ContainerEntity } from '../../domain/entities/container.entity';

@Injectable()
export class ContainerMapper {
  /**
   * Maps a database document to a container entity
   */
  toEntity(document: any): ContainerEntity {
    return {
      ...document,
      _id: document._id?.toString(),
    };
  }

  /**
   * Maps a container entity to a database document
   */
  toDocument(entity: ContainerEntity): any {
    const document: any = { ...entity };
    return document;
  }
}