import { IPlaybooksRegister } from '@modules/playbooks/domain/entities/playbooks-register.entity';

export const PLAYBOOKS_REGISTER_REPOSITORY = 'PLAYBOOKS_REGISTER_REPOSITORY';

/**
 * Interface for the playbooks repository in the domain layer
 */
export interface IPlaybooksRegisterRepository {
  /**
   * Find a repository by UUID
   * @param uuid Repository UUID
   * @returns The repository or null if not found
   */
  findByUuid(uuid: string): Promise<IPlaybooksRegister | null>;

  /**
   * Find all active repositories
   * @returns Array of active repositories
   */
  findAllActive(): Promise<IPlaybooksRegister[]>;

  /**
   * Find all active repositories
   * @returns Array of active repositories
   */
  findAllByType(type: any): Promise<IPlaybooksRegister[]>;

  /**
   * Update a repository
   * @param uuid Repository UUID
   * @param updateData Data to update
   * @returns The updated repository
   */
  update(uuid: string, updateData: Partial<IPlaybooksRegister>): Promise<IPlaybooksRegister | null>;

  /**
   * Create a new repository
   * @param repositoryData Repository data
   * @returns The created repository
   */
  create(repositoryData: Partial<IPlaybooksRegister>): Promise<IPlaybooksRegister>;

  /**
   * Delete a repository
   * @param uuid Repository UUID
   * @returns The deleted repository
   */
  delete(uuid: string): Promise<IPlaybooksRegister | null>;
}
