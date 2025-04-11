/**
 * Interface for components that can sync with external sources
 */
export interface ISyncable {
  /**
   * Synchronize from an external repository
   */
  syncFromRepository(): Promise<void>;
}