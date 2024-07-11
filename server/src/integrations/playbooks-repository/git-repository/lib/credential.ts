import { GitProcess } from 'dugite';
import { trim } from 'lodash';
import { getRemoteUrl } from './inspect';

export enum ServiceType {
  Github = 'github',
}

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
const getGitHubUrlWithOutCredential = (urlWithCredential: string): string =>
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
  serviceType = ServiceType.Github,
): Promise<void> {
  let gitUrlWithCredential;
  switch (serviceType) {
    case ServiceType.Github: {
      gitUrlWithCredential = getGitHubUrlWithCredential(remoteUrl, userName, accessToken);
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
  serviceType = ServiceType.Github,
): Promise<void> {
  const gitRepoUrl = remoteUrl ?? (await getRemoteUrl(directory, remoteName));
  let gitUrlWithOutCredential;
  switch (serviceType) {
    case ServiceType.Github: {
      gitUrlWithOutCredential = getGitHubUrlWithOutCredential(gitRepoUrl);
      break;
    }
  }
  await GitProcess.exec(['remote', 'set-url', remoteName, gitUrlWithOutCredential], directory);
}
