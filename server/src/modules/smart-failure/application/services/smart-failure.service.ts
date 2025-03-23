import { Inject, Injectable, Logger } from '@nestjs/common';
import { API } from 'ssm-shared-lib';
import { FAILURE_PATTERNS } from '../../domain/constants';
import { FailurePattern } from '../../domain/entities/failure-pattern.interface';
import {
  ISmartFailureRepository,
  SMART_FAILURE_REPOSITORY,
} from '../../domain/repositories/smart-failure.repository.interface';
import { ISmartFailureService } from '../interfaces/smart-failure.service.interface';

/**
 * Service for analyzing Ansible logs and providing smart failure analysis
 */
@Injectable()
export class SmartFailureService implements ISmartFailureService {
  private readonly logger = new Logger(SmartFailureService.name);
  private readonly failurePatterns: FailurePattern[];

  constructor(
    @Inject(SMART_FAILURE_REPOSITORY)
    private readonly smartFailureRepository: ISmartFailureRepository,
  ) {
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
    const logData = await this.smartFailureRepository.findAllByIdent(execId);
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
