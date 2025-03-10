/**
 * Setting entity interface in the domain layer
 */
export interface ISetting {
  /**
   * The unique key for the setting
   */
  key: string;

  /**
   * The value of the setting
   */
  value: string;

  /**
   * Whether the setting should only be set if it doesn't exist yet
   */
  nx?: boolean;
}