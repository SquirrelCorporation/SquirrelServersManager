import { SsmAnsible } from 'ssm-shared-lib';

export const isFinalStatus = (status: string): boolean => {
  return (
    status === SsmAnsible.AnsibleTaskStatus.FAILED ||
    status === SsmAnsible.AnsibleTaskStatus.SUCCESS ||
    status === SsmAnsible.AnsibleTaskStatus.CANCELED ||
    status === SsmAnsible.AnsibleTaskStatus.TIMEOUT
  );
};
