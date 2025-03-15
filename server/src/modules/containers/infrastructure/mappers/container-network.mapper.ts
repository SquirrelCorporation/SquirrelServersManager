import { Injectable } from '@nestjs/common';
import { ContainerNetworkEntity } from '../../domain/entities/container-network.entity';

@Injectable()
export class ContainerNetworkMapper {
  /**
   * Maps a database document to a container network entity
   */
  toEntity(document: any): ContainerNetworkEntity {
    return {
      id: document._id.toString(),
      uuid: document.uuid,
      name: document.name,
      deviceUuid: document.deviceUuid,
      driver: document.driver,
      scope: document.scope,
      ipam: document.ipam,
      internal: document.internal,
      enableIPv6: document.enableIPv6,
      options: document.options,
      labels: document.labels,
      containers: document.containers,
      createdAt: document.createdAt,
    };
  }

  /**
   * Maps a container network entity to a database document
   */
  toDocument(entity: ContainerNetworkEntity): any {
    const document: any = { ...entity };
    
    // Remove id from document as MongoDB will create its own _id
    if (document.id) {
      delete document.id;
    }
    
    return document;
  }
}