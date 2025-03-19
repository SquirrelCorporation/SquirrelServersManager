import { Injectable } from '@nestjs/common';
import { ContainerNetworkEntity } from '../../domain/entities/container-network.entity';

@Injectable()
export class ContainerNetworkMapper {
  /**
   * Maps a database document to a container network entity
   */
  toEntity(document: any): ContainerNetworkEntity {
    return {
      ...document,
      _id: document._id?.toString(),
    };
  }

  /**
   * Maps a container network entity to a database document
   */
  toDocument(entity: ContainerNetworkEntity): any {
    const document: any = { ...entity };

    return document;
  }
}