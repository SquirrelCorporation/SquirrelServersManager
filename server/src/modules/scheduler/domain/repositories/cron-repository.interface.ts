import { ICron } from '../entities/cron.entity';

export const CRON_REPOSITORY = 'CRON_REPOSITORY';

/**
 * Cron repository interface in the domain layer
 */
export interface ICronRepository {
  updateOrCreateIfNotExist(cron: ICron): Promise<ICron>;
  updateCron(cron: ICron): Promise<void>;
  findAll(): Promise<ICron[] | null>;
  findByName(name: string): Promise<ICron | null>;
}