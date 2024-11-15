import { GitProcess } from 'dugite';
import { trim } from 'lodash';
import { SsmGit } from 'ssm-shared-lib';
import { getRemoteUrl } from './inspect';

// TODO: support folderLocation as rawUrl like `/Users/linonetwo/Desktop/repo/playbooks-repository-sync-js/test/mockUpstreamRepo/credential` for test, or gitlab url.
export const getGitHubUrlWithCredential = (
  rawUrl: string,
  username: string,
  accessToken: string,
): string =>
  trim(
    rawUrl
      .replaceAll('\n', '')
      .replace('https://github.com/', `https://${username}:${accessToken}@github.com/`),
  );

export const getGitLabUrlWithCredential = (
  rawUrl: string,
  username: string,
  accessToken: string,
): string =>
  trim(
    rawUrl
      .replaceAll('\n', '')
      .replace('https://gitlab.com/', `https://${username}:${accessToken}@gitlab.com/`),
  );
export const getBitbucketUrlWithCredential = (
  rawUrl: string,
  username: string,
  accessToken: string,
): string =>
  trim(
    rawUrl
      .replaceAll('\n', '')
      .replace('https://bitbucket.org/', `https://${username}:${accessToken}@bitbucket.org/`),
  );

export const getAzureReposUrlWithCredential = (
  rawUrl: string,
  username: string,
  accessToken: string,
): string =>
  trim(
    rawUrl
      .replaceAll('\n', '')
      .replace('https://dev.azure.com/', `https://${username}:${accessToken}@dev.azure.com/`),
  );

const getUrlWithOutCredential = (urlWithCredential: string): string =>
  trim(urlWithCredential.replace(/.+@/, 'https://'));

/**
 *  Add remote with credential
 * @param {string} directory
 * @param {string} remoteUrl
 * @param userName
 * @param accessToken
 * @param remoteName
 * @param serviceType
 */
export async function credentialOn(
  directory: string,
  remoteUrl: string,
  userName: string,
  accessToken: string,
  remoteName: string,
  serviceType: SsmGit.Services,
): Promise<void> {
  let gitUrlWithCredential;
  switch (serviceType) {
    case SsmGit.Services.Github: {
      gitUrlWithCredential = getGitHubUrlWithCredential(remoteUrl, userName, accessToken);
      break;
    }
    case SsmGit.Services.GitLab: {
      gitUrlWithCredential = getGitLabUrlWithCredential(remoteUrl, userName, accessToken);
      break;
    }
    case SsmGit.Services.Bitbucket: {
      gitUrlWithCredential = getBitbucketUrlWithCredential(remoteUrl, userName, accessToken);
      break;
    }
    case SsmGit.Services.AzureRepos: {
      gitUrlWithCredential = getAzureReposUrlWithCredential(remoteUrl, userName, accessToken);
      break;
    }
  }
  await GitProcess.exec(['remote', 'add', remoteName, gitUrlWithCredential], directory);
  await GitProcess.exec(['remote', 'set-url', remoteName, gitUrlWithCredential], directory);
}
/**
 *  Add remote without credential
 * @param {string} directory
 * @param remoteName
 * @param remoteUrl
 * @param serviceType
 */
export async function credentialOff(
  directory: string,
  remoteName: string,
  remoteUrl?: string,
  serviceType = SsmGit.Services.Github,
): Promise<void> {
  const gitRepoUrl = remoteUrl ?? (await getRemoteUrl(directory, remoteName));
  let gitUrlWithOutCredential;
  switch (serviceType) {
    case SsmGit.Services.Github: {
      gitUrlWithOutCredential = getUrlWithOutCredential(gitRepoUrl);
      break;
    }
    case SsmGit.Services.GitLab: {
      gitUrlWithOutCredential = getUrlWithOutCredential(gitRepoUrl);
      break;
    }
    case SsmGit.Services.Bitbucket: {
      gitUrlWithOutCredential = getUrlWithOutCredential(gitRepoUrl);
      break;
    }
    case SsmGit.Services.AzureRepos: {
      gitUrlWithOutCredential = getUrlWithOutCredential(gitRepoUrl);
      break;
    }
  }
  await GitProcess.exec(['remote', 'set-url', remoteName, gitUrlWithOutCredential], directory);
}
