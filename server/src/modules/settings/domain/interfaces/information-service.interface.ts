export const INFORMATION_SERVICE = 'INFORMATION_SERVICE';

/**
 * Interface for the Information Service
 */
export interface IInformationService {
  /**
   * Get MongoDB server stats
   * @returns MongoDB server statistics
   */
  getMongoDBStats(): Promise<any>;

  /**
   * Get Redis server stats
   * @returns Redis server statistics
   */
  getRedisStats(): Promise<any>;

  /**
   * Get Prometheus server stats
   * @returns Prometheus server statistics
   */
  getPrometheusStats(): Promise<any>;
}