import { SsmAnsible } from 'ssm-shared-lib';
import { IPlaybook } from '../../domain/entities/playbook.entity';
import { PlaybookDocument } from '../schemas/playbook.schema';

export class PlaybookMapper {
  /**
   * Maps a Mongoose document to a domain entity
   */
  static toDomain(document: PlaybookDocument | null): IPlaybook | null {
    if (!document) {
      return null;
    }

    // Convert to plain object first
    const plainDoc = document.toObject ? document.toObject() : document;

    // Map to domain entity
    return {
      _id: plainDoc._id?.toString(),
      uuid: plainDoc.uuid,
      name: plainDoc.name,
      description: plainDoc.description,
      path: plainDoc.path,
      uniqueQuickRef: plainDoc.uniqueQuickRef,
      playbooksRepository: plainDoc.playbooksRepository,
      extraVars: plainDoc.extraVars,
      playableInBatch: plainDoc.playableInBatch,
      custom: plainDoc.custom,
      createdAt: plainDoc.createdAt,
      updatedAt: plainDoc.updatedAt,
    };
  }

  /**
   * Maps an array of Mongoose documents to domain entities
   */
  static toDomainArray(documents: (PlaybookDocument | null)[] | null): IPlaybook[] | null {
    if (!documents) {
      return null;
    }

    return documents.map(doc => this.toDomain(doc)).filter((doc): doc is IPlaybook => doc !== null);
  }

  /**
   * Maps a domain entity to a Mongoose document (for create/update operations)
   */
  static toPersistence(entity: Partial<IPlaybook>): any {
    const { extraVars, playbooksRepository, ...rest } = entity;

    return {
      ...rest,
      // Only include playbooksRepository if it exists
      ...(playbooksRepository && { playbooksRepository }),
      extraVars: extraVars?.map(extraVar => ({
        extraVar: extraVar.extraVar,
        required: extraVar.required ?? false,
        type: extraVar.type ?? SsmAnsible.ExtraVarsType.MANUAL,
        deletable: extraVar.deletable ?? true
      }))
    };
  }
}