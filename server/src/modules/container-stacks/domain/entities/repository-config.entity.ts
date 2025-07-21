import { SsmGit } from 'ssm-shared-lib';

/**
 * Represents the configuration for a Git repository
 */
export interface RepositoryConfig {
  uuid: string;
  name: string;
  branch: string;
  email: string;
  userName: string;
  accessToken: string;
  remoteUrl: string;
  gitService: SsmGit.Services;
  ignoreSSLErrors?: boolean;
}
