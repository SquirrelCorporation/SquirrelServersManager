import { API } from 'ssm-shared-lib';
import AnsibleLogsRepo from '../../data/database/repository/AnsibleLogsRepo';
import logger from '../../logger';

interface FailurePattern {
  id: string;
  pattern: RegExp;
  cause: string;
  resolution: string;
}

// Common patterns to identify failure reasons, causes, and resolutions
const failurePatterns: FailurePattern[] = [
  {
    id: 'unreachable',
    pattern: /UNREACHABLE!|unable to connect to port|failed to connect to the host/i,
    cause: 'The device may be down or unreachable.',
    resolution: 'Check the device network connectivity and ensure you entered the right IP.',
  },
  {
    id: 'no_package',
    pattern: /No package matching/i,
    cause: 'The package name may be incorrect or the package repository is not available.',
    resolution:
      'Verify the package name and ensure the relevant repository is configured correctly.',
  },
  {
    id: 'permission_denied',
    pattern: /Permission denied|Failed to authenticate/i,
    cause: 'Incorrect SSH credentials or insufficient permissions.',
    resolution: 'Check the SSH credentials and permissions.',
  },
  {
    id: 'command_not_found',
    pattern: /command not found|command failed/i,
    cause: 'The command does not exist or is not in the PATH.',
    resolution: 'Ensure the command exists and is correctly added to the PATH.',
  },
  {
    id: 'timeout',
    pattern: /timed out|timeout/i,
    cause: 'The connection or operation timed out.',
    resolution: 'Increase the timeout setting or check network stability.',
  },
  {
    id: 'disk_space',
    pattern: /disk space/i,
    cause: 'Insufficient disk space on the host.',
    resolution: 'Free up disk space or add additional storage.',
  },
  {
    id: 'syntax_error',
    pattern: /syntax error/i,
    cause: 'There is a syntax error in the playbook or roles.',
    resolution: 'Fix the syntax error in the specified line of the playbook.',
  },
  {
    id: 'user_not_found',
    pattern: /unable to find user/i,
    cause: 'The specified user does not exist on the device.',
    resolution: 'Create the user on the device.',
  },
  {
    id: 'service_not_found',
    pattern: /could not find the requested service/i,
    cause: 'The specified service does not exist or is misspelled.',
    resolution: 'Verify the service name and ensure it is correctly spelled.',
  },
  {
    id: 'ssl_problem',
    pattern: /SSL certificate problem/i,
    cause: 'SSL certificate validation failed.',
    resolution: 'Check the SSL certificate and ensure it is valid and correctly configured.',
  },
  {
    id: 'module_not_found',
    pattern: /module could not be found/i,
    cause: 'An Ansible module required for the playbook is not installed.',
    resolution: 'Install the required Ansible module.',
  },
  {
    id: 'variable_undefined',
    pattern: /variable is undefined/i,
    cause: 'An undefined variable is being used in the playbook.',
    resolution: 'Define the variable in the playbook or inventory.',
  },
  {
    id: 'redirect_failed',
    pattern: /redirect module has failed/i,
    cause: 'The redirect module in the playbook failed to execute properly.',
    resolution:
      'Check the configuration and parameters of the redirect module used in the playbook.',
  },
];

class SmartFailure {
  private failurePatterns: FailurePattern[];

  constructor(failurePatterns: FailurePattern[]) {
    this.failurePatterns = failurePatterns;
  }

  public async parseAnsibleLogsAndMayGetSmartFailure(
    execId: string,
  ): Promise<API.SmartFailure | undefined> {
    const logData = await AnsibleLogsRepo.findAllByIdent(execId);
    const smartFailures: API.SmartFailure[] = [];

    logData?.forEach((value) => {
      const logLines = value.stdout?.split('\n');
      logger.debug(`Processing ${logLines?.length} lines from log`);

      logLines?.forEach((line, index) => {
        const trimmedLine = line.trim();
        logger.debug(`Line ${index + 1}: "${trimmedLine}"`);

        this.failurePatterns.forEach(({ id, pattern, cause, resolution }) => {
          logger.debug(
            `Testing pattern: /${pattern.source}/${pattern.flags} against line: "${trimmedLine}"`,
          );
          if (pattern.test(trimmedLine)) {
            logger.debug(`Pattern matched: ${trimmedLine}`);

            // Check for duplicate entries using pattern id
            const existingEntry = smartFailures.find((failure) => failure.id === id);

            if (!existingEntry) {
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

    return smartFailures?.length > 1 ? smartFailures[0] : undefined;
  }
}

export default new SmartFailure(failurePatterns);
