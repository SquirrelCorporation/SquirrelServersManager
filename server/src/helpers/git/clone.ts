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
  const { gitUserName, branch, gitService, env } = userInfo ?? defaultGitInfo;
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

  logProgress(GitStep.PrepareClone);

  logDebug(
    JSON.stringify({
      remoteUrl,
      gitUserName,
      accessToken: truncate(accessToken, {
        length: 24,
      }),
    }),
    GitStep.PrepareClone,
  );
  logDebug(`Running git init for clone in dir ${dir}`, GitStep.PrepareClone);
  await initGitWithBranch(dir, branch, { initialCommit: false, env: env });
  const remoteName = await getRemoteName(dir, branch, env);
  logDebug(`Successfully Running git init for clone in dir ${dir}`, GitStep.PrepareClone);
  logProgress(GitStep.StartConfiguringGithubRemoteRepository);
  await credentialOn(dir, remoteUrl, gitUserName, accessToken, remoteName, gitService, env);
  try {
    logProgress(GitStep.StartFetchingFromGithubRemote);
    const { stderr: pullStdError, exitCode } = await GitProcess.exec(
      ['pull', remoteName, `${branch}:${branch}`],
      dir,
      { env },
    );
    if (exitCode === 0) {
      logProgress(GitStep.SynchronizationFinish);
    } else {
      throw new GitPullPushError(options, pullStdError);
    }
  } finally {
    await credentialOff(dir, remoteName, remoteUrl, undefined, env);
  }
}
