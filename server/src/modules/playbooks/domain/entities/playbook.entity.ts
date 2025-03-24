import { SsmAnsible } from 'ssm-shared-lib';
import { IPlaybooksRegister } from './playbooks-register.entity';

/**
 * Interface for the playbook entity in the domain layer
 */
export interface IPlaybook {
  _id?: string;
  uuid: string;
  name: string;
  description?: string;
  path: string;
  uniqueQuickRef?: string;
  playbooksRepository: IPlaybooksRegister;
  extraVars?: Array<{
    extraVar: string;
    required?: boolean;
    type?: SsmAnsible.ExtraVarsType;
    deletable?: boolean;
  }>;
  playableInBatch?: boolean;
  custom?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
