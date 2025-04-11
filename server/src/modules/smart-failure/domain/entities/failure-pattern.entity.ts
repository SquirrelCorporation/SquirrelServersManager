/**
 * Interface for failure pattern detection
 */
export interface IFailurePattern {
  /**
   * Unique identifier for the pattern
   */
  id: string;

  /**
   * Regular expression to match in log output
   */
  pattern: RegExp;

  /**
   * Description of the cause of the failure
   */
  cause: string;

  /**
   * Suggested resolution for the failure
   */
  resolution: string;
}

/**
 * Interface for smart failure response
 */
export interface ISmartFailure {
  /**
   * Unique identifier for the failure
   */
  id: string;

  /**
   * The message that triggered the detection
   */
  message: string;

  /**
   * Description of the cause of the failure
   */
  cause: string;

  /**
   * Suggested resolution for the failure
   */
  resolution: string;
}

// For backward compatibility
export type FailurePattern = IFailurePattern;
export type SmartFailure = ISmartFailure;