import { SsmGit } from 'ssm-shared-lib';

/**
 * Options for creating a Git playbooks register component
 */
export interface GitComponentOptions {
  uuid: string;
  name: string;
  branch: string;
  email: string;
  gitUserName: string;
  accessToken: string;
  remoteUrl: string;
  gitService: SsmGit.Services;
  ignoreSSLErrors: boolean;
}

/**
 * Options for creating a Local playbooks register component
 */
export interface LocalComponentOptions {
  uuid: string;
  name: string;
  directory: string;
}
