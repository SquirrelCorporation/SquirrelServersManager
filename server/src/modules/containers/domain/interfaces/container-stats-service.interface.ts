import { StatsType } from 'ssm-shared-lib';
import { IContainer } from '../../domain/entities/container.entity';

export const CONTAINER_STATS_SERVICE = 'CONTAINER_STATS_SERVICE';

/**
 * Interface for the Container Stats Service
 */
export interface IContainerStatsService {
  /**
   * Create stats for a container
   * @param container The container entity
   * @param stats The container stats from Dockerode
   */
  createStats(container: IContainer, stats: any): Promise<void>;

  /**
   * Get stat by container and type
   * @param container The container entity
   * @param type The stat type
   * @returns The container stat
   */
  getStatByDeviceAndType(
    container: IContainer,
    type?: string,
  ): Promise<[{ _id?: string; value: number; date?: string }] | null>;

  /**
   * Get stats by container and type
   * @param container The container entity
   * @param from The number of hours to look back
   * @param type The stat type
   * @returns The container stats
   */
  getStatsByDeviceAndType(
    container: IContainer,
    from: number,
    type?: string,
  ): Promise<{ date: string; value: number; name?: string }[] | null>;

  /**
   * Get averaged stats for a specific type
   * @param type The stat type
   * @returns The averaged stats
   */
  getAveragedStats(type: StatsType.ContainerStatsType): Promise<any>;

  /**
   * Get CPU and memory averaged stats
   * @returns The CPU and memory averaged stats
   */
  getCpuAndMemAveragedStats(): Promise<{ cpuStats: any; memStats: any }>;
}
