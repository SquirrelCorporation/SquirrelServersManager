import { GitProcess } from 'dugite';
import { trim } from 'lodash';
import { SsmGit } from 'ssm-shared-lib';
import { getRemoteUrl } from '../services/inspect.service';

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

export const getGiteaUrlWithCredential = (
  rawUrl: string,
  username: string,
  accessToken: string,
): string =>
  trim(
    rawUrl.replaceAll('\n', '').replace(
      /https?:\/\/([a-zA-Z0-9.-]+(:\d+)?)(\/.*)/, // Matches domain, optional port, and trailing path
      `https://${username}:${accessToken}@$1$3`, // Replaces with credentials and preserves the rest of the path
    ),
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
 * @param domain
 * @param env
 */
export async function credentialOn(
  directory: string,
  remoteUrl: string,
  userName: string,
  accessToken: string,
  remoteName: string,
  serviceType: SsmGit.Services,
  env?: Record<string, string>,
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
    case SsmGit.Services.Gitea: {
      gitUrlWithCredential = getGiteaUrlWithCredential(remoteUrl, userName, accessToken);
      break;
    }
    default: {
      throw new Error(`Unknown service type ${serviceType}`);
    }
  }
  await GitProcess.exec(['remote', 'add', remoteName, gitUrlWithCredential], directory, { env });
  await GitProcess.exec(['remote', 'set-url', remoteName, gitUrlWithCredential], directory, {
    env,
  });
}
/**
 *  Add remote without credential
 * @param {string} directory
 * @param remoteName
 * @param remoteUrl
 * @param serviceType
 * @param env
 */
export async function credentialOff(
  directory: string,
  remoteName: string,
  remoteUrl?: string,
  serviceType = SsmGit.Services.Github,
  env?: Record<string, string>,
): Promise<void> {
  const gitRepoUrl = remoteUrl ?? (await getRemoteUrl(directory, remoteName));
  let gitUrlWithOutCredential: string;
  switch (serviceType) {
    case SsmGit.Services.Github:
    case SsmGit.Services.GitLab:
    case SsmGit.Services.Bitbucket:
    case SsmGit.Services.AzureRepos:
    case SsmGit.Services.Gitea: {
      gitUrlWithOutCredential = getUrlWithOutCredential(gitRepoUrl);
      break;
    }
    default: {
      throw new Error(`Unknown service type ${serviceType}`);
    }
  }
  await GitProcess.exec(['remote', 'set-url', remoteName, gitUrlWithOutCredential], directory, env);
}
