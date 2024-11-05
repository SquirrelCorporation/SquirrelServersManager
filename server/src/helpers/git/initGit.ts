import { truncate } from 'lodash';
import { commitAndSync } from './commitAndSync';
import { defaultGitInfo as defaultDefaultGitInfo } from './defaultGitInfo';
import { SyncParameterMissingError } from './errors';
import { initGitWithBranch } from './init';
import { GitStep, IGitUserInfos, IGitUserInfosWithoutToken, ILogger } from './interface';
import { commitFiles } from './sync';

export interface IInitGitOptionsSyncImmediately {
  /** Optional fallback of userInfo. If some info is missing in userInfo, will use defaultGitInfo instead. */
  defaultGitInfo?: typeof defaultDefaultGitInfo;
  /**  folder path, can be relative */
  dir: string;
  logger?: ILogger;
  /** only required if syncImmediately is true, the storage service url we are sync to, for example your github repo url */
  remoteUrl: string;
  /** should we sync after git repository init? */
  syncImmediately: true;
  /** user info used in the commit message */
  userInfo: IGitUserInfos;
}
export interface IInitGitOptionsNotSync {
  defaultGitInfo?: typeof defaultDefaultGitInfo;
  /**  folder path, can be relative */
  dir: string;
  logger?: ILogger;
  /** should we sync after git repository init? */
  syncImmediately?: false;
  userInfo?: IGitUserInfosWithoutToken | IGitUserInfos;
}

export type IInitGitOptions = IInitGitOptionsSyncImmediately | IInitGitOptionsNotSync;

export async function initGit(options: IInitGitOptions): Promise<void> {
  const {
    dir,
    userInfo,
    syncImmediately,
    logger,
    defaultGitInfo = defaultDefaultGitInfo,
  } = options;

  const logProgress = (step: GitStep): unknown =>
    logger?.info(step, {
      functionName: 'initGit',
      step,
    });
  const logDebug = (message: string, step: GitStep): unknown =>
    logger?.debug(message, { functionName: 'initGit', step });

  logProgress(GitStep.StartGitInitialization);
  const { gitUserName, email, branch } = userInfo ?? defaultGitInfo;
  logDebug(`Running git init in dir ${dir}`, GitStep.StartGitInitialization);
  await initGitWithBranch(dir, branch);
  logDebug(`Successfully Running git init in dir ${dir}`, GitStep.StartGitInitialization);
  await commitFiles(dir, gitUserName, email ?? defaultGitInfo.email);

  // if we are config local note git repository, we are done here
  if (syncImmediately !== true) {
    logProgress(GitStep.GitRepositoryConfigurationFinished);
    return;
  }
  // sync to remote, start config synced note
  if (
    userInfo === undefined ||
    !('accessToken' in userInfo) ||
    userInfo?.accessToken?.length === 0
  ) {
    throw new SyncParameterMissingError('accessToken');
  }
  const { remoteUrl } = options;
  if (remoteUrl === undefined || remoteUrl.length === 0) {
    throw new SyncParameterMissingError('remoteUrl');
  }
  logDebug(
    `Calling commitAndSync() from initGit() Using gitUrl ${remoteUrl} with gitUserName ${gitUserName} and accessToken ${truncate(
      userInfo?.accessToken,
      {
        length: 24,
      },
    )}`,
    GitStep.StartConfiguringGithubRemoteRepository,
  );
  logProgress(GitStep.StartConfiguringGithubRemoteRepository);
  await commitAndSync(options);
}
