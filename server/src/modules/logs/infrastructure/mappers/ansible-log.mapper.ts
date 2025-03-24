import { Injectable } from '@nestjs/common';
import { AnsibleLogEntity } from '../../domain/entities/ansible-log.entity';
import { AnsibleLog, AnsibleLogDocument } from '../schemas/ansible-log.schema';

@Injectable()
export class AnsibleLogMapper {
  toDomain(document: AnsibleLogDocument): AnsibleLogEntity | null {
    if (!document) {
      return null;
    }

    // Convert to plain object first
    const plainDoc = document.toObject ? document.toObject() : document;

    return {
      ...plainDoc,
      _id: plainDoc._id?.toString(),
    };
  }

  toPersistence(domainModel: Partial<AnsibleLogEntity>): Partial<AnsibleLog> {
    const document: any = { ...domainModel };

    return document;
  }
}
