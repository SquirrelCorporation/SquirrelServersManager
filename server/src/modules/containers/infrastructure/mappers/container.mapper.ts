import { ContainerEntity } from '../../domain/entities/container.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ContainerMapper {
  /**
   * Maps a database document to a container entity
   */
  toEntity(document: any): ContainerEntity {
    return {
      id: document._id.toString(),
      uuid: document.uuid,
      name: document.name,
      deviceUuid: document.deviceUuid,
      image: document.image,
      shortId: document.shortId,
      state: document.state,
      status: document.status,
      createdAt: document.createdAt,
      labels: document.labels,
      hostConfig: document.hostConfig,
      networkMode: document.networkMode,
      networks: document.networks,
      mounts: document.mounts,
      command: document.command,
      ports: document.ports,
      containerConfig: document.containerConfig,
      restart: document.restart,
      timestamp: document.timestamp,
      watchers: document.watchers,
      stats: document.stats,
      kind: document.kind,
      env: document.env,
      oomKilled: document.oomKilled,
      isManaged: document.isManaged,
      isWatched: document.isWatched,
    };
  }

  /**
   * Maps a container entity to a database document
   */
  toDocument(entity: ContainerEntity): any {
    const document: any = { ...entity };
    
    // Remove id from document as MongoDB will create its own _id
    if (document.id) {
      delete document.id;
    }
    
    return document;
  }
}