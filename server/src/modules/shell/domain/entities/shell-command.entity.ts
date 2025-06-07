/**
 * Represents a shell command in the domain layer
 */
export interface IShellCommand {
  command: string;
  args?: string[];
  options?: Record<string, any>;
}
