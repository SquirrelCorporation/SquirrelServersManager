/**
 * Custom errors, for user to catch and `instanceof`. So you can show your custom translated message for each error type.
 * `Object.setPrototypeOf(this, AssumeSyncError.prototype);` to fix https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
 */
import { truncate } from 'lodash';
import { SyncState } from './inspect';
import { IGitUserInfos, IGitUserInfosWithoutToken } from './interface';

export class AssumeSyncError extends Error {
  constructor(state: SyncState, extraMessage?: string) {
    super(extraMessage);
    Object.setPrototypeOf(this, AssumeSyncError.prototype);
    this.name = 'AssumeSyncError';
    this.message = `E-1 In this state, git should have been sync with the remote, but it is "${state}", this is caused by procedural bug in the git-sync-js. ${extraMessage ?? ''}`;
  }
}
export class SyncParameterMissingError extends Error {
  /** the missing parameterName */
  parameterName: string;
  constructor(parameterName = 'accessToken') {
    super(parameterName);
    Object.setPrototypeOf(this, SyncParameterMissingError.prototype);
    this.name = 'SyncParameterMissingError';
    this.parameterName = parameterName;
    this.message = `E-2 We need ${parameterName} to sync to the cloud, you should pass ${parameterName} as parameters in options.`;
  }
}

export class GitPullPushError extends Error {
  constructor(
    configuration: {
      branch?: string;
      /** wiki folder path, can be relative */
      dir: string;
      /** for example, origin */
      remote?: string;
      /** the storage service url we are sync to, for example your github repo url */
      remoteUrl?: string;
      /** user info used in the commit message */
      userInfo?: IGitUserInfos | IGitUserInfosWithoutToken;
    },
    extraMessages: string,
  ) {
    super(extraMessages);
    Object.setPrototypeOf(this, GitPullPushError.prototype);
    this.name = 'GitPullPushError';
    this.message = `E-3 failed to config git to successfully pull from or push to remote with configuration ${JSON.stringify(
      {
        ...configuration,
        userInfo: {
          ...configuration.userInfo,
          accessToken: truncate((configuration?.userInfo as IGitUserInfos)?.accessToken, {
            length: 6,
          }),
        },
      },
    )}.\nerrorMessages: ${extraMessages}`;
  }
}

export class CantSyncGitNotInitializedError extends Error {
  /** the directory that should have a git repo */
  directory: string;
  constructor(directory: string) {
    super(directory);
    Object.setPrototypeOf(this, CantSyncGitNotInitializedError.prototype);
    this.directory = directory;
    this.name = 'CantSyncGitNotInitializedError';
    this.message = `E-4 we can't sync on a git repository that is not initialized, maybe this folder is not a git repository. ${directory}`;
  }
}

export class SyncScriptIsInDeadLoopError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, SyncScriptIsInDeadLoopError.prototype);
    this.name = 'SyncScriptIsInDeadLoopError';
    this.message = `E-5 Unable to sync, and Sync script is in a dead loop, this is caused by procedural bug in the git-sync-js.`;
  }
}

export class CantSyncInSpecialGitStateAutoFixFailed extends Error {
  stateMessage: string;
  constructor(stateMessage: string) {
    super(stateMessage);
    Object.setPrototypeOf(this, CantSyncInSpecialGitStateAutoFixFailed.prototype);
    this.stateMessage = stateMessage;
    this.name = 'CantSyncInSpecialGitStateAutoFixFailed';
    this.message = `E-6 Unable to Sync, this folder is in special condition, thus can't Sync directly. An auto-fix has been tried, but error still remains. Please resolve all the conflict manually , if this still don't work out, please use professional Git tools (Source Tree, GitKraken) to solve this. This is caused by procedural bug in the git-sync-js.\n${stateMessage}`;
  }
}

export class CantForcePullError extends Error {
  stateMessage: string;
  constructor(stateMessage: string) {
    super(stateMessage);
    Object.setPrototypeOf(this, CantForcePullError.prototype);
    this.stateMessage = stateMessage;
    this.name = 'CantForcePullError';
    this.message = `E-7 Unable to force pull remote. This is caused by procedural bug in the git-sync-js.\n${stateMessage}`;
  }
}
