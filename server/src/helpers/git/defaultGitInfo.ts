import { SsmGit } from 'ssm-shared-lib';

export const defaultGitInfo = {
  email: 'gitsync@gmail.com',
  gitUserName: 'gitsync',
  branch: 'main',
  remote: 'origin',
  gitService: SsmGit.Services.Github,
};
