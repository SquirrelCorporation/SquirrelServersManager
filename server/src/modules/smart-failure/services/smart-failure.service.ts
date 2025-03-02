import { Injectable, Logger } from '@nestjs/common';
import { API } from 'ssm-shared-lib';
import AnsibleLogsRepo from '../../../data/database/repository/AnsibleLogsRepo';
import { FAILURE_PATTERNS } from '../constants';
import { FailurePattern } from '../interfaces/failure-pattern.interface';

/**
 * Service for analyzing Ansible logs and providing smart failure analysis
 */
@Injectable()
export class SmartFailureService {
  private readonly logger = new Logger(SmartFailureService.name);
  private readonly failurePatterns: FailurePattern[];

  constructor() {
    this.failurePatterns = FAILURE_PATTERNS;
  }

  /**
   * Parse Ansible logs and extract smart failure information
   * @param execId Execution ID of the Ansible run
   * @returns Smart failure information if found, undefined otherwise
   */
  public async parseAnsibleLogsAndMayGetSmartFailure(
    execId: string,
  ): Promise<API.SmartFailure | undefined> {
    const logData = await AnsibleLogsRepo.findAllByIdent(execId);
    const smartFailures: API.SmartFailure[] = [];

    logData?.forEach((value) => {
      const logLines = value.stdout?.split('\n');
      this.logger.debug(`Processing ${logLines?.length} lines from log`);

      logLines?.forEach((line, index) => {
        const trimmedLine = line.trim();
        this.logger.debug(`Line ${index + 1}: "${trimmedLine}"`);

        this.failurePatterns.forEach(({ id, pattern, cause, resolution }) => {
          this.logger.debug(
            `Testing pattern: /${pattern.source}/${pattern.flags} against line: "${trimmedLine}"`,
          );
          if (pattern.test(trimmedLine)) {
            this.logger.debug(`Pattern matched: ${trimmedLine}`);

            // Check for duplicate entries using pattern id
            const existingEntry = smartFailures.find((failure) => failure.id === id);

            if (!existingEntry) {
              this.logger.debug(`Adding SmartFailure entry: ${id}`);
              smartFailures.push({
                id,
                message: trimmedLine,
                cause,
                resolution,
              });
            }
          }
        });
      });
    });

    return smartFailures?.length > 0 ? smartFailures[0] : undefined;
  }
}
