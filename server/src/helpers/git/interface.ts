import { SsmGit } from 'ssm-shared-lib';

export interface IGitUserInfosWithoutToken {
  branch: string;
  /** Git commit message email */
  email: string | null | undefined;
  /** Github Login: username , this is also used to filter user's repo when searching repo */
  gitUserName: string;
  gitService: SsmGit.Services;
}

export interface IGitUserInfos extends IGitUserInfosWithoutToken {
  /** Github Login: token */
  accessToken: string;
}

export enum GitStep {
  AddComplete = 'AddComplete',
  AddingFiles = 'AddingFiles',
  CantSyncInSpecialGitStateAutoFixSucceed = 'CantSyncInSpecialGitStateAutoFixSucceed',
  CheckingLocalGitRepoSanity = 'CheckingLocalGitRepoSanity',
  CheckingLocalSyncState = 'CheckingLocalSyncState',
  CommitComplete = 'CommitComplete',
  FetchingData = 'FetchingData',
  FinishForcePull = 'FinishForcePull',
  GitMerge = 'GitMerge',
  GitMergeComplete = 'GitMergeComplete',
  GitMergeFailed = 'GitMergeFailed',
  GitPush = 'GitPush',
  GitPushComplete = 'GitPushComplete',
  GitPushFailed = 'GitPushFailed',
  GitRepositoryConfigurationFinished = 'GitRepositoryConfigurationFinished',
  HaveThingsToCommit = 'HaveThingsToCommit',
  LocalAheadStartUpload = 'LocalAheadStartUpload',
  LocalStateBehindSync = 'LocalStateBehindSync',
  LocalStateDivergeRebase = 'LocalStateDivergeRebase',
  NoNeedToSync = 'NoNeedToSync',
  NoUpstreamCantPush = 'NoUpstreamCantPush',
  PerformLastCheckBeforeSynchronizationFinish = 'PerformLastCheckBeforeSynchronizationFinish',
  PrepareClone = 'PrepareClone',
  PrepareSync = 'PrepareSync',
  PreparingUserInfo = 'PreparingUserInfo',
  RebaseConflictNeedsResolve = 'RebaseConflictNeedsResolve',
  RebaseResultChecking = 'RebaseResultChecking',
  RebaseSucceed = 'RebaseSucceed',
  SkipForcePull = 'SkipForcePull',
  StartBackupToGitRemote = 'StartBackupToGitRemote',
  StartConfiguringGithubRemoteRepository = 'StartConfiguringGithubRemoteRepository',
  StartFetchingFromGithubRemote = 'StartFetchingFromGithubRemote',
  StartForcePull = 'StartForcePull',
  StartGitInitialization = 'StartGitInitialization',
  StartResettingLocalToRemote = 'StartResettingLocalToRemote',
  /** this means our algorithm have some problems */
  SyncFailedAlgorithmWrong = 'SyncFailedAlgorithmWrong',
  SynchronizationFinish = 'SynchronizationFinish',
}

/** context to tell logger which function we are in */
export interface ILoggerContext {
  branch?: string;
  dir?: string;
  functionName: string;
  remoteUrl?: string;
  step: GitStep;
}

/** custom logger to report progress on each step
 * we don't use logger to report error, we throw errors.
 */
export interface ILogger {
  /** used to report debug logs */
  debug: (message: string, context: ILoggerContext) => unknown;
  /** used to report progress for human user to read */
  info: (message: GitStep, context: ILoggerContext) => unknown;
  /** used to report failed optional progress */
  warn: (message: string, context: ILoggerContext) => unknown;
}
/**
 * Steps that indicate we have new files, so we can restart our wiki to reload changes.
 *
 * @example <pre><code>
 * // (inside a promise)
 * let hasChanges = false;
    observable?.subscribe({
      next: (messageObject) => {
        if (messageObject.level === 'error') {
          return;
        }
        const { meta } = messageObject;
        if (typeof meta === 'object' && meta !== null && 'step' in meta && stepsAboutChange.includes((meta as { step: GitStep }).step)) {
          hasChanges = true;
        }
      },
      complete: () => {
        resolve(hasChanges);
      },
    });
  </code></pre>
 */
export const stepsAboutChange = [
  GitStep.GitMergeComplete,
  GitStep.RebaseSucceed,
  GitStep.FinishForcePull,
];
