import { GitProcess } from 'dugite';
import { syncPreflightCheck } from './commit-and-sync.service';
import { credentialOff, credentialOn } from '../utils/credential.util';
import { defaultGitInfo as defaultDefaultGitInfo } from '../utils/default-info.util';
import { CantForcePullError, SyncParameterMissingError } from '../errors/errors.util';
import { getDefaultBranchName, getRemoteName, getSyncState } from './inspect.service';
import { GitStep, IGitUserInfos, ILogger } from '../interfaces/git.interface';
import { fetchRemote } from './sync.service';

export interface IForcePullOptions {
  /** Optional fallback of userInfo. If some info is missing in userInfo, will use defaultGitInfo instead. */
  defaultGitInfo?: typeof defaultDefaultGitInfo;
  /** folder path, can be relative */
  dir: string;
  logger?: ILogger;
  /** the storage service url we are sync to, for example your github repo url
   * When empty, and commitOnly===true, it means we just want commit, without sync
   */
  remoteUrl?: string;
  /** user info used in the commit message
   * When empty, and commitOnly===true, it means we just want commit, without sync
   */
  userInfo?: IGitUserInfos;
}

/**
 * Ignore all local changes, force reset local to remote.
 * This is usually used in readonly blog, that will fetch content from a remote repo. And you can push content to the remote repo, let the blog update.
 */
export async function forcePull(options: IForcePullOptions) {
  const { dir, logger, defaultGitInfo = defaultDefaultGitInfo, userInfo, remoteUrl } = options;
  const { gitUserName, branch, gitService } = userInfo ?? defaultGitInfo;
  const { accessToken, env } = userInfo ?? {};
  const defaultBranchName = (await getDefaultBranchName(dir, env)) ?? branch;
  const remoteName = await getRemoteName(dir, branch, defaultGitInfo.env);

  if (accessToken === '' || accessToken === undefined) {
    throw new SyncParameterMissingError('accessToken');
  }
  if (remoteUrl === '' || remoteUrl === undefined) {
    throw new SyncParameterMissingError('remoteUrl');
  }

  const logProgress = (step: GitStep): unknown =>
    logger?.info(step, {
      functionName: 'forcePull',
      step,
      dir,
      remoteUrl,
      branch: defaultBranchName,
    });
  const logDebug = (message: string, step: GitStep): unknown =>
    logger?.debug(message, {
      functionName: 'forcePull',
      step,
      dir,
      remoteUrl,
      branch: defaultBranchName,
    });

  logProgress(GitStep.StartForcePull);
  logDebug(`Do preflight Check before force pull in dir ${dir}`, GitStep.StartForcePull);
  // preflight check
  await syncPreflightCheck({
    dir,
    logger,
    logProgress,
    logDebug,
    defaultGitInfo,
    userInfo,
  });
  logProgress(GitStep.StartConfiguringGithubRemoteRepository);
  await credentialOn(dir, remoteUrl, gitUserName, accessToken, remoteName, gitService, env);
  try {
    logProgress(GitStep.StartFetchingFromGithubRemote);
    await fetchRemote(dir, defaultGitInfo.remote, defaultGitInfo.branch, env);
    const syncState = await getSyncState(dir, defaultBranchName, remoteName, logger, env);
    logDebug(`syncState in dir ${dir} is ${syncState}`, GitStep.StartFetchingFromGithubRemote);
    if (syncState === 'equal') {
      // if there is no new commit in remote (and nothing messy in local), we don't need to pull.
      logProgress(GitStep.SkipForcePull);
      return;
    }
    logProgress(GitStep.StartResettingLocalToRemote);
    await hardResetLocalToRemote(dir, branch, remoteName, env);
    logProgress(GitStep.FinishForcePull);
  } catch (error) {
    if (error instanceof CantForcePullError) {
      throw error;
    } else {
      throw new CantForcePullError(`${(error as Error).message} ${(error as Error).stack ?? ''}`);
    }
  } finally {
    await credentialOff(dir, remoteName, remoteUrl, undefined, env);
  }
}

/**
 * Internal method used by forcePull, does the `reset --hard`.
 */
export async function hardResetLocalToRemote(
  dir: string,
  branch: string,
  remoteName: string,
  env?: Record<string, string>,
) {
  const { exitCode, stderr } = await GitProcess.exec(
    ['reset', '--hard', `${remoteName}/${branch}`],
    dir,
    env,
  );
  if (exitCode !== 0) {
    throw new CantForcePullError(`${remoteName}/${branch} ${stderr}`);
  }
}