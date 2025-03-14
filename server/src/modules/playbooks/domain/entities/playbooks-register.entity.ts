import { SsmGit } from "ssm-shared-lib";

/**
 * Interface for the playbooks repository entity in the domain layer
 */
export interface IPlaybooksRegister {
  _id?: string;
  uuid: string;
  name: string;
  description?: string;
  type: 'local' | 'git';
  enabled: boolean;
  ignoreSSLErrors?: boolean;
  accessToken?: string;
  email?: string;
  gitService?: SsmGit.Services;
  directoryExclusionList?: string[];
  branch?: string;
  userName?: string;
  remoteUrl?: string;
  directory: string;
  createdAt?: Date;
  updatedAt?: Date;
  vaults?: string[];
  default?: boolean;
  tree?: any;
}