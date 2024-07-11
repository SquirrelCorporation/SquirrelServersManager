import pino from 'pino';
import Logger = pino.Logger;

export abstract class AbstractShellCommander {
  protected constructor(
    protected logger: Logger,
    protected task: string,
  ) {}

  protected executeCommand<T extends (...args: any[]) => any>(
    shellCmd: T,
    ...args: Parameters<T>
  ): ReturnType<T> {
    try {
      this.logger.info(`${this.task} - Starting...`);
      return shellCmd(...args);
    } catch (error) {
      this.logger.error(`${this.task} - Failed`);
      throw new Error(`${this.task} failed due to ${error}`);
    }
  }
}
