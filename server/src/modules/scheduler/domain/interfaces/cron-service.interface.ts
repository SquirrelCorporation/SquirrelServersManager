import { ICron } from '../../domain/entities/cron.entity';

export const CRON_SERVICE = 'CRON_SERVICE';

/**
 * Interface for the Cron Service
 */
export interface ICronService {
  /**
   * Update an existing cron job or create a new one if it doesn't exist
   * @param cron Cron job data
   * @returns The updated or created cron job
   */
  updateOrCreateCron(cron: ICron): Promise<ICron>;

  /**
   * Update an existing cron job
   * @param cron Cron job data
   */
  updateCron(cron: ICron): Promise<void>;

  /**
   * Update the last execution timestamp for a cron job
   * @param name Cron job name
   */
  updateLastExecution(name: string): Promise<void>;

  /**
   * Find all cron jobs
   * @returns Array of cron jobs or null
   */
  findAll(): Promise<ICron[] | null>;

  /**
   * Find a cron job by name
   * @param name Cron job name
   * @returns Cron job or null if not found
   */
  findByName(name: string): Promise<ICron | null>;
}
