import { GitProcess } from 'dugite';
import { credentialOff, credentialOn } from '../utils/credential.util';
import { defaultGitInfo as defaultDefaultGitInfo } from '../utils/default-info.util';
import {
  CantSyncGitNotInitializedError,
  GitPullPushError,
  SyncParameterMissingError,
} from '../errors/errors.util';
import { GitStep, IGitUserInfos, ILogger } from '../interfaces/git.interface';
import {
  assumeSync,
  getDefaultBranchName,
  getGitRepositoryState,
  getRemoteName,
  getSyncState,
  haveLocalChanges,
} from './inspect.service';
import {
  commitFiles,
  continueRebase,
  fetchRemote,
  mergeUpstream,
  pushUpstream,
} from './sync.service';

export interface ICommitAndSyncOptions {
  /** the commit message */
  commitMessage?: string;
  commitOnly?: boolean;
  /** Optional fallback of userInfo. If some info is missing in userInfo, will use defaultGitInfo instead. */
  defaultGitInfo?: typeof defaultDefaultGitInfo;
  /** wiki folder path, can be relative */
  dir: string;
  /** if you want to use a dynamic .gitignore, you can passing an array contains filepaths that want to ignore */
  filesToIgnore?: string[];
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
 * `git add .` + `git commit` + `git rebase` or something that can sync bi-directional
 */
export async function commitAndSync(options: ICommitAndSyncOptions): Promise<void> {
  const {
    dir,
    remoteUrl,
    commitMessage = 'Updated with SSM',
    userInfo,
    logger,
    defaultGitInfo = defaultDefaultGitInfo,
    filesToIgnore,
    commitOnly,
  } = options;
  const { gitUserName, email, branch, gitService } = userInfo ?? defaultGitInfo;
  const { accessToken, env } = userInfo ?? {};

  const defaultBranchName = (await getDefaultBranchName(dir, env)) ?? branch;
  const remoteName = await getRemoteName(dir, defaultBranchName, env);

  const logProgress = (step: GitStep): unknown =>
    logger?.info?.(step, {
      functionName: 'commitAndSync',
      step,
      dir,
      remoteUrl,
      branch: defaultBranchName,
    });
  const logDebug = (message: string, step: GitStep): unknown =>
    logger?.debug?.(message, {
      functionName: 'commitAndSync',
      step,
      dir,
      remoteUrl,
      branch: defaultBranchName,
    });
  const logWarn = (message: string, step: GitStep): unknown =>
    logger?.warn?.(message, {
      functionName: 'commitAndSync',
      step,
      dir,
      remoteUrl,
      branch: defaultBranchName,
    });

  // preflight check
  await syncPreflightCheck({
    dir,
    logger,
    logProgress,
    logDebug,
    defaultGitInfo,
    userInfo,
  });

  await GitProcess.exec(['config', 'user.email', `"${email ?? defaultGitInfo.email}"`], dir, {
    env,
  });
  await GitProcess.exec(['config', `user.name`, `"${gitUserName}"`], dir, { env });

  if (await haveLocalChanges(dir)) {
    logProgress(GitStep.HaveThingsToCommit);
    logDebug(commitMessage, GitStep.HaveThingsToCommit);
    const { exitCode: commitExitCode, stderr: commitStdError } = await commitFiles(
      dir,
      gitUserName,
      email ?? defaultGitInfo.email,
      commitMessage,
      filesToIgnore,
      undefined,
      env,
    );
    if (commitExitCode !== 0) {
      logWarn(`commit failed ${commitStdError}`, GitStep.CommitComplete);
    }
    logProgress(GitStep.CommitComplete);
  }
  if (commitOnly === true) {
    return;
  }
  logProgress(GitStep.PreparingUserInfo);
  if (accessToken === '' || accessToken === undefined) {
    throw new SyncParameterMissingError('accessToken');
  }
  if (remoteUrl === '' || remoteUrl === undefined) {
    throw new SyncParameterMissingError('remoteUrl');
  }
  await credentialOn(dir, remoteUrl, gitUserName, accessToken, remoteName, gitService, env);
  logProgress(GitStep.FetchingData);
  try {
    await fetchRemote(dir, remoteName, defaultBranchName, env);
    let exitCode = 0;
    let stderr: string | undefined;
    const syncStateAfterCommit = await getSyncState(
      dir,
      defaultBranchName,
      remoteName,
      logger,
      env,
    );
    switch (syncStateAfterCommit) {
      case 'equal': {
        logProgress(GitStep.NoNeedToSync);
        return;
      }
      case 'noUpstreamOrBareUpstream': {
        logProgress(GitStep.NoUpstreamCantPush);
        // try push, if success, means it is bare, otherwise, it is no upstream
        try {
          await pushUpstream(dir, defaultBranchName, remoteName, userInfo, logger);
          break;
        } catch (error) {
          logWarn(
            `${JSON.stringify({ dir, remoteUrl, userInfo })}, remoteUrl may be not valid, noUpstreamOrBareUpstream after credentialOn`,
            GitStep.NoUpstreamCantPush,
          );
          throw error;
        }
      }
      case 'ahead': {
        logProgress(GitStep.LocalAheadStartUpload);
        await pushUpstream(dir, defaultBranchName, remoteName, userInfo, logger);
        break;
      }
      case 'behind': {
        logProgress(GitStep.LocalStateBehindSync);
        await mergeUpstream(dir, defaultBranchName, remoteName, userInfo, logger);
        break;
      }
      case 'diverged': {
        logProgress(GitStep.LocalStateDivergeRebase);
        ({ exitCode, stderr } = await GitProcess.exec(
          ['rebase', `${remoteName}/${defaultBranchName}`],
          dir,
          { env },
        ));
        logProgress(GitStep.RebaseResultChecking);
        if (exitCode !== 0) {
          logWarn(
            `exitCode: ${exitCode}, stderr of git rebase: ${stderr}`,
            GitStep.RebaseResultChecking,
          );
        }
        if (
          exitCode === 0 &&
          (await getGitRepositoryState(dir, logger, env)).length === 0 &&
          (await getSyncState(dir, defaultBranchName, remoteName, logger, env)) === 'ahead'
        ) {
          logProgress(GitStep.RebaseSucceed);
        } else {
          await continueRebase(
            dir,
            gitUserName,
            email ?? defaultGitInfo.email,
            logger,
            undefined,
            env,
          );
          logProgress(GitStep.RebaseConflictNeedsResolve);
        }
        await pushUpstream(dir, defaultBranchName, remoteName, userInfo, logger);
        break;
      }
      default: {
        logProgress(GitStep.SyncFailedAlgorithmWrong);
      }
    }

    if (exitCode === 0) {
      logProgress(GitStep.PerformLastCheckBeforeSynchronizationFinish);
      await assumeSync(dir, defaultBranchName, remoteName, logger, env);
      logProgress(GitStep.SynchronizationFinish);
    } else {
      switch (exitCode) {
        // "message":"exitCode: 128, stderr of git push: fatal: unable to access 'https://github.com/tiddly-gittly/TiddlyWiki-Chinese-Tutorial.git/': LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to github.com:443 \n"
        case 128: {
          throw new GitPullPushError(options, stderr ?? '');
        }
        // TODO: handle auth expire and throw here
        default: {
          throw new GitPullPushError(options, stderr ?? '');
        }
      }
    }
  } finally {
    // always restore original remoteUrl without token
    await credentialOff(dir, remoteName, remoteUrl, undefined, env);
  }
}

/**
 * Check for git repo state, if it is not clean, try fix it. If not init will throw error.
 * This method is used by commitAndSync and forcePull before they doing anything.
 */
export async function syncPreflightCheck(configs: {
  /** defaultGitInfo from ICommitAndSyncOptions */
  defaultGitInfo?: typeof defaultDefaultGitInfo;
  dir: string;
  logDebug?: (message: string, step: GitStep) => unknown;
  logProgress?: (step: GitStep) => unknown;
  logger?: ILogger;
  /** userInfo from ICommitAndSyncOptions */
  userInfo?: IGitUserInfos;
}) {
  const {
    dir,
    logger,
    logProgress,
    logDebug,
    defaultGitInfo = defaultDefaultGitInfo,
    userInfo,
  } = configs;
  const { gitUserName, email, env } = userInfo ?? defaultGitInfo;

  const repoStartingState = await getGitRepositoryState(dir, logger, env);
  if (repoStartingState.length === 0 || repoStartingState === '|DIRTY') {
    logProgress?.(GitStep.PrepareSync);
    logDebug?.(
      `${dir} repoStartingState: ${repoStartingState}, ${gitUserName} <${email ?? defaultGitInfo.email}>`,
      GitStep.PrepareSync,
    );
  } else if (repoStartingState === 'NOGIT') {
    throw new CantSyncGitNotInitializedError(dir);
  } else {
    // we may be in middle of a rebase, try fix that
    await continueRebase(
      dir,
      gitUserName,
      email ?? defaultGitInfo.email,
      logger,
      repoStartingState,
      env,
    );
  }
}
