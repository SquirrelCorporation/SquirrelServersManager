import { GitProcess } from 'dugite';
import { truncate } from 'lodash';
import { credentialOff, credentialOn } from './credential';
import { defaultGitInfo as defaultDefaultGitInfo } from './defaultGitInfo';
import { GitPullPushError, SyncParameterMissingError } from './errors';
import { initGitWithBranch } from './init';
import { getRemoteName } from './inspect';
import { GitStep, IGitUserInfos, ILogger } from './interface';

export async function clone(options: {
  /** Optional fallback of userInfo. If some info is missing in userInfo, will use defaultGitInfo instead. */
  defaultGitInfo?: typeof defaultDefaultGitInfo;
  /** wiki folder path, can be relative, should exist before function call */
  dir: string;
  logger?: ILogger;
  /** the storage service url we are sync to, for example your github repo url */
  remoteUrl?: string;
  /** user info used in the commit message */
  userInfo?: IGitUserInfos;
}): Promise<void> {
  const { dir, remoteUrl, userInfo, logger, defaultGitInfo = defaultDefaultGitInfo } = options;
  const { gitUserName, branch } = userInfo ?? defaultGitInfo;
  const { accessToken } = userInfo ?? {};

  if (accessToken === '' || accessToken === undefined) {
    throw new SyncParameterMissingError('accessToken');
  }
  if (remoteUrl === '' || remoteUrl === undefined) {
    throw new SyncParameterMissingError('remoteUrl');
  }

  const logProgress = (step: GitStep): unknown =>
    logger?.info(step, {
      functionName: 'clone',
      step,
      dir,
      remoteUrl,
    });
  const logDebug = (message: string, step: GitStep): unknown =>
    logger?.debug(message, {
      functionName: 'clone',
      step,
      dir,
      remoteUrl,
    });

  logProgress(GitStep.PrepareCloneOnlineWiki);

  logDebug(
    JSON.stringify({
      remoteUrl,
      gitUserName,
      accessToken: truncate(accessToken, {
        length: 24,
      }),
    }),
    GitStep.PrepareCloneOnlineWiki,
  );
  logDebug(`Running git init for clone in dir ${dir}`, GitStep.PrepareCloneOnlineWiki);
  await initGitWithBranch(dir, branch, { initialCommit: false });
  const remoteName = await getRemoteName(dir, branch);
  logDebug(`Successfully Running git init for clone in dir ${dir}`, GitStep.PrepareCloneOnlineWiki);
  logProgress(GitStep.StartConfiguringGithubRemoteRepository);
  await credentialOn(dir, remoteUrl, gitUserName, accessToken, remoteName);
  try {
    logProgress(GitStep.StartFetchingFromGithubRemote);
    const { stderr: pullStdError, exitCode } = await GitProcess.exec(['pull', remoteName, `${branch}:${branch}`], dir);
    if (exitCode === 0) {
      logProgress(GitStep.SynchronizationFinish);
    } else {
      throw new GitPullPushError(options, pullStdError);
    }
  } finally {
    await credentialOff(dir, remoteName, remoteUrl);
  }
}
