import { API } from 'ssm-shared-lib';
import { IPlaybooksRegister } from '../entities/playbooks-register.entity';

export const PLAYBOOKS_REGISTER_SERVICE = 'PLAYBOOKS_REGISTER_SERVICE';

export interface IPlaybooksRegisterService {
  getAllPlaybooksRepositories(): Promise<API.PlaybooksRepository[]>;
  createDirectoryInPlaybookRepository(register: IPlaybooksRegister, path: string): Promise<void>;
  createPlaybookInRepository(register: IPlaybooksRegister, fullPath: string, name: string): Promise<any>;
  deletePlaybookFromRepository(register: IPlaybooksRegister, playbookUuid: string): Promise<void>;
  deleteDirectoryFromRepository(register: IPlaybooksRegister, path: string): Promise<void>;
  savePlaybook(playbookUuid: string, content: string): Promise<void>;
  syncRepository(registerUuid: string): Promise<void>;
  deleteRepository(register: IPlaybooksRegister): Promise<void>;
}