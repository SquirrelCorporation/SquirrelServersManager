import { GitProcess, IGitResult } from 'dugite';
import fs from 'fs-extra';
import {
  CantSyncInSpecialGitStateAutoFixFailed,
  GitPullPushError,
  SyncScriptIsInDeadLoopError,
} from './errors';
import { getGitRepositoryState } from './inspect';
import { GitStep, IGitUserInfos, IGitUserInfosWithoutToken, ILogger } from './interface';

/**
 * Git add and commit all file
 * @param dir
 * @param username
 * @param email
 * @param message
 * @param filesToIgnore
 * @param logger
 */
export async function commitFiles(
  dir: string,
  username: string,
  email: string,
  message = 'Commit with SSM',
  filesToIgnore: string[] = [],
  logger?: ILogger,
): Promise<IGitResult> {
  const logProgress = (step: GitStep): unknown =>
    logger?.info(step, {
      functionName: 'commitFiles',
      step,
      dir,
    });

  logProgress(GitStep.AddingFiles);
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { listFiles, remove } = await require('isomorphic-git');

  await GitProcess.exec(['add', '.'], dir);
  // find and unStage files that are in the ignore list
  const stagedFiles = await listFiles({ fs, dir });
  if (filesToIgnore.length > 0) {
    const stagedFilesToIgnore = filesToIgnore.filter((file) => stagedFiles.includes(file));
    if (stagedFilesToIgnore.length > 0) {
      await Promise.all(
        stagedFilesToIgnore.map(async (file) => {
          await remove({ dir, filepath: file, fs });
        }),
      );
    }
  }

  logProgress(GitStep.AddComplete);
  return await GitProcess.exec(['commit', '-m', message, `--author="${username} <${email}>"`], dir);
}

/**
 * Git push -f origin master
 * This does force push, to deal with `--allow-unrelated-histories` case
 * @param dir
 * @param branch
 * @param remoteName
 * @param userInfo
 * @param logger
 */
export async function pushUpstream(
  dir: string,
  branch: string,
  remoteName: string,
  userInfo?: IGitUserInfos | IGitUserInfosWithoutToken | undefined,
  logger?: ILogger,
): Promise<IGitResult> {
  const logProgress = (step: GitStep): unknown =>
    logger?.info(step, {
      functionName: 'pushUpstream',
      step,
      dir,
    });
  /** when push to remote, we need to specify the local branch name and remote branch name */
  const branchMapping = `${branch}:${branch}`;
  logProgress(GitStep.GitPush);
  const pushResult = await GitProcess.exec(['push', remoteName, branchMapping], dir);
  logProgress(GitStep.GitPushComplete);
  if (pushResult.exitCode !== 0) {
    throw new GitPullPushError(
      { dir, branch, remote: remoteName, userInfo },
      pushResult.stdout + pushResult.stderr,
    );
  }
  return pushResult;
}

/**
 * Git merge origin master
 * @param dir
 * @param branch
 * @param remoteName
 * @param userInfo
 * @param logger
 */
export async function mergeUpstream(
  dir: string,
  branch: string,
  remoteName: string,
  userInfo?: IGitUserInfos | IGitUserInfosWithoutToken | undefined,
  logger?: ILogger,
): Promise<IGitResult> {
  const logProgress = (step: GitStep): unknown =>
    logger?.info(step, {
      functionName: 'mergeUpstream',
      step,
      dir,
    });
  logProgress(GitStep.GitMerge);
  const mergeResult = await GitProcess.exec(
    ['merge', '--ff', '--ff-only', `${remoteName}/${branch}`],
    dir,
  );
  logProgress(GitStep.GitMergeComplete);
  if (mergeResult.exitCode !== 0) {
    throw new GitPullPushError(
      { dir, branch, remote: remoteName, userInfo },
      mergeResult.stdout + mergeResult.stderr,
    );
  }

  return mergeResult;
}

/**
 * try to continue rebase, simply adding and committing all things, leave them to user to resolve in the TiddlyWiki later.
 * @param dir
 * @param username
 * @param email
 * @param logger
 * @param providedRepositoryState result of `await getGitRepositoryState(dir, logger)`, optional, if not provided, we will run `await getGitRepositoryState(dir, logger)` by ourself.
 */
export async function continueRebase(
  dir: string,
  username: string,
  email: string,
  logger?: ILogger,
  providedRepositoryState?: string,
): Promise<void> {
  const logProgress = (step: GitStep): unknown =>
    logger?.info(step, {
      functionName: 'continueRebase',
      step,
      dir,
    });

  let hasNotCommittedConflict = true;
  let rebaseContinueExitCode = 0;
  let rebaseContinueStdError = '';
  let repositoryState: string =
    providedRepositoryState ?? (await getGitRepositoryState(dir, logger));
  // prevent infin loop, if there is some bug that I miss
  let loopCount = 0;
  while (hasNotCommittedConflict) {
    loopCount += 1;
    if (loopCount > 1000) {
      throw new SyncScriptIsInDeadLoopError();
    }
    const { exitCode: commitExitCode, stderr: commitStdError } = await commitFiles(
      dir,
      username,
      email,
      'Conflict files committed',
    );
    const rebaseContinueResult = await GitProcess.exec(['rebase', '--continue'], dir);
    // get info for logging
    rebaseContinueExitCode = rebaseContinueResult.exitCode;
    rebaseContinueStdError = rebaseContinueResult.stderr;
    const rebaseContinueStdOut = rebaseContinueResult.stdout;
    repositoryState = await getGitRepositoryState(dir, logger);
    // if git add . + git commit failed or git rebase --continue failed
    if (commitExitCode !== 0 || rebaseContinueExitCode !== 0) {
      throw new CantSyncInSpecialGitStateAutoFixFailed(
        `rebaseContinueStdError when ${repositoryState}: ${rebaseContinueStdError}\ncommitStdError when ${repositoryState}: ${commitStdError}\n${rebaseContinueStdError}`,
      );
    }
    hasNotCommittedConflict =
      rebaseContinueStdError.startsWith('CONFLICT') || rebaseContinueStdOut.startsWith('CONFLICT');
  }
  logProgress(GitStep.CantSyncInSpecialGitStateAutoFixSucceed);
}

/**
 * Simply calling git fetch.
 * @param dir
 * @param remoteName
 * @param branch if not provided, will fetch all branches
 */
export async function fetchRemote(dir: string, remoteName: string, branch?: string) {
  if (branch === undefined) {
    await GitProcess.exec(['fetch', remoteName], dir);
  } else {
    await GitProcess.exec(['fetch', remoteName, branch], dir);
  }
}
