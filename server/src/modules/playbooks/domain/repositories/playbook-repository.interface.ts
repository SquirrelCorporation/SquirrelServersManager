import { IPlaybooksRegister } from '@modules/playbooks/domain/entities/playbooks-register.entity';
import { IPlaybook } from '../entities/playbook.entity';

export const PLAYBOOK_REPOSITORY = 'PLAYBOOK_REPOSITORY';

/**
 * Interface for the playbook repository in the domain layer
 */
export interface IPlaybookRepository {
  /**
   * Create a new playbook
   * @param playbook Playbook data
   */
  create(playbook: Partial<IPlaybook>): Promise<IPlaybook>;

  /**
   * Update or create a playbook
   * @param playbook Playbook data
   */
  updateOrCreate(playbook: Partial<IPlaybook>): Promise<IPlaybook | null>;

  /**
   * Find all playbooks
   */
  findAll(): Promise<IPlaybook[] | null>;

  /**
   * Find all playbooks with active repositories
   */
  findAllWithActiveRepositories(): Promise<IPlaybook[] | null>;

  /**
   * Find a playbook by name
   * @param name Playbook name
   */
  findOneByName(name: string): Promise<IPlaybook | null>;

  /**
   * Find a playbook by UUID
   * @param uuid Playbook UUID
   */
  findOneByUuid(uuid: string): Promise<IPlaybook | null>;

  /**
   * List all playbooks by repository
   * @param playbooksRepository Repository to list playbooks from
   */
  listAllByRepository(playbooksRepository: IPlaybooksRegister): Promise<IPlaybook[] | null>;

  /**
   * Delete a playbook by UUID
   * @param uuid Playbook UUID
   */
  deleteByUuid(uuid: string): Promise<void>;

  /**
   * Find a playbook by path
   * @param path Playbook path
   */
  findOneByPath(path: string): Promise<IPlaybook | null>;

  /**
   * Find a playbook by unique quick reference
   * @param quickRef Quick reference string
   */
  findOneByUniqueQuickReference(quickRef: string): Promise<IPlaybook | null>;

  /**
   * Delete all playbooks from a repository
   * @param playbooksRepository Repository to delete playbooks from
   */
  deleteAllByRepository(playbooksRepository: IPlaybooksRegister): Promise<void>;
}
