/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable unicorn/prevent-abbreviations */
import path from 'path';
import url from 'url';
import { GitProcess } from 'dugite';
import fs from 'fs-extra';
import { compact } from 'lodash';
import { AssumeSyncError, CantSyncGitNotInitializedError } from './errors';
import { GitStep, ILogger } from './interface';
// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
const { listRemotes } = require('isomorphic-git');

const gitEscapeToEncodedUri = (str: string): string =>
  str.replaceAll(
    /\\(\d{3})/g,
    (_: unknown, $1: string) => `%${Number.parseInt($1, 8).toString(16)}`,
  );
const decodeGitEscape = (rawString: string): string =>
  decodeURIComponent(gitEscapeToEncodedUri(rawString));

export interface ModifiedFileList {
  filePath: string;
  fileRelativePath: string;
  type: string;
}
/**
 * Get modified files and modify type in a folder
 * @param {string} folderPath location to scan playbooks-repository modify state
 */
export async function getModifiedFileList(folderPath: string): Promise<ModifiedFileList[]> {
  const { stdout } = await GitProcess.exec(['status', '--porcelain'], folderPath);
  const stdoutLines = stdout.split('\n');
  const nonEmptyLines = compact(stdoutLines);
  const statusMatrixLines = compact(
    nonEmptyLines.map((line: string) => /^\s?(\?\?|[ACMR]|[ACMR][DM])\s?(\S+.*\S+)$/.exec(line)),
  ).filter(
    ([_, type, fileRelativePath]) => type !== undefined && fileRelativePath !== undefined,
  ) as unknown as Array<[unknown, string, string]>;
  return statusMatrixLines
    .map(([_, type, rawFileRelativePath]) => {
      /**
       * If filename contains Chinese, it will becomes:
       * ```js
       * fileRelativePath: "\"tiddlers/\\346\\226\\260\\346\\235\\241\\347\\233\\256.tid\""`
       * ```
       * which is actually `"tiddlers/\\346\\226\\260\\346\\235\\241\\347\\233\\256.tid"` (if you try to type it in the console manually). If you console log it, it will become
       * ```js
       * > temp1[1].fileRelativePath
       * '"tiddlers/\346\226\260\346\235\241\347\233\256.tid"'
       * ```
       *
       * So simply `decodeURIComponent(escape` will work on `tiddlers/\346\226\260\346\235\241\347\233\256.tid` (the logged string), but not on `tiddlers/\\346\\226\\260\\346\\235\\241\\347\\233\\256.tid` (the actual string).
       * So how to transform actual string to logged string? Answer is `eval()` it. But we have to check is there any evil script use `;` or `,` mixed into the filename.
       *
       * But actually those 346 226 are in radix 8 , if we transform it to radix 16 and add prefix % we can make it uri component.
       * And it should not be parsed in groups of three, because only the CJK between 0x0800 - 0xffff are encoded into three bytes; so we should just replace all the \\\d{3} with hexadecimal, and then give it to the decodeURIComponent to parse.
       */
      const isSafeUtf8UnescapedString =
        rawFileRelativePath.startsWith('"') &&
        rawFileRelativePath.endsWith('"') &&
        !rawFileRelativePath.includes(';') &&
        !rawFileRelativePath.includes(',');
      const fileRelativePath = isSafeUtf8UnescapedString
        ? decodeGitEscape(rawFileRelativePath).replace(/^"/, '').replace(/"$/, '')
        : rawFileRelativePath;
      return {
        type,
        fileRelativePath,
        filePath: path.normalize(path.join(folderPath, fileRelativePath)),
      };
    })
    .sort((item, item2) => item.fileRelativePath.localeCompare(item2.fileRelativePath, 'zh'));
}

/**
 * Inspect playbooks-repository's remote url from folder's .playbooks-repository config
 * @param dir folder path, playbooks-repository folder to inspect
 * @param remoteName
 * @returns remote url, without `'.playbooks-repository'`
 * @example ```ts
 const githubRepoUrl = await getRemoteUrl(directory);
 const gitUrlWithOutCredential = getGitUrlWithOutCredential(githubRepoUrl);
 await GitProcess.exec(['remote', 'set-url', 'origin', gitUrlWithOutCredential], directory);
 ```
 */
export async function getRemoteUrl(dir: string, remoteName: string): Promise<string> {
  const remotes = await listRemotes({ fs, dir });
  const githubRemote = remotes.find(({ remote }) => remote === remoteName) ?? remotes[0];
  if ((githubRemote?.url?.length ?? 0) > 0) {
    return githubRemote!.url;
  }
  return '';
}

/**
 * Get the Github Repo Name, which is similar to "linonetwo/wiki", that is the string after "https://github.com/", so we basically just get the pathname of URL.
 * @param remoteUrl full github repository url or other repository url
 * @returns
 */
export function getRemoteRepoName(remoteUrl: string): string | undefined {
  let repoName = new url.URL(remoteUrl).pathname;
  if (repoName.startsWith('/')) {
    // deepcode ignore GlobalReplacementRegex: change only the first match
    repoName = repoName.replace('/', '');
  }
  if (repoName.length > 0) {
    return repoName;
  }
  return undefined;
}

/**
 * See if there is any file not being committed
 * @param {string} folderPath repo path to test
 * @example ```ts
if (await haveLocalChanges(dir)) {
  // ... do commit and push
```
 */
export async function haveLocalChanges(folderPath: string): Promise<boolean> {
  const { stdout } = await GitProcess.exec(['status', '--porcelain'], folderPath);
  const matchResult = stdout.match(/^(\?\?|[ACMR] |[ ACMR][DM])*/gm);
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  return !!matchResult?.some?.(Boolean);
}

/**
 * Get "master" or "main" from playbooks-repository repo
 *
 * https://github.com/simonthum/git-sync/blob/31cc140df2751e09fae2941054d5b61c34e8b649/git-sync#L228-L232
 * @param folderPath
 */
export async function getDefaultBranchName(folderPath: string): Promise<string | undefined> {
  try {
    const { stdout } = await GitProcess.exec(['rev-parse', '--abbrev-ref', 'HEAD'], folderPath);
    const [branchName] = stdout.split('\n');
    // don't return empty string, so we can use ?? syntax
    if (branchName === '') {
      return undefined;
    }
    return branchName;
  } catch {
    /**
     * Catch "Unable to find path to repository on disk."
      at node_modules/dugite/lib/playbooks-repository-process.ts:226:29
     */
    return undefined;
  }
}

export type SyncState = 'noUpstreamOrBareUpstream' | 'equal' | 'ahead' | 'behind' | 'diverged';
/**
 * determine sync state of repository, i.e. how the remote relates to our HEAD
 * 'ahead' means our local state is ahead of remote, 'behind' means local state is behind of the remote
 * @param dir repo path to test
 * @param defaultBranchName
 * @param remoteName
 * @param logger
 */
export async function getSyncState(
  dir: string,
  defaultBranchName: string,
  remoteName: string,
  logger?: ILogger,
): Promise<SyncState> {
  const logDebug = (message: string, step: GitStep): unknown =>
    logger?.debug?.(message, { functionName: 'getSyncState', step, dir });
  const logProgress = (step: GitStep): unknown =>
    logger?.info?.(step, {
      functionName: 'getSyncState',
      step,
      dir,
    });
  logProgress(GitStep.CheckingLocalSyncState);
  remoteName = remoteName ?? (await getRemoteName(dir, defaultBranchName));
  const gitArgs = [
    'rev-list',
    '--count',
    '--left-right',
    `${remoteName}/${defaultBranchName}...HEAD`,
  ];
  const { stdout, stderr } = await GitProcess.exec(gitArgs, dir);
  logDebug(
    `Checking sync state with upstream, command: \`git ${gitArgs.join(' ')}\` , stdout:\n${stdout}\n(stdout end)`,
    GitStep.CheckingLocalSyncState,
  );
  if (stderr.length > 0) {
    logDebug(
      `Have problem checking sync state with upstream,stderr:\n${stderr}\n(stderr end)`,
      GitStep.CheckingLocalSyncState,
    );
  }
  if (stdout === '') {
    return 'noUpstreamOrBareUpstream';
  }
  /**
   * checks for the output 0 0, which means there are no differences between the local and remote branches. If this is the case, the function returns 'equal'.
   */
  if (/0\t0/.exec(stdout) !== null) {
    return 'equal';
  }
  /**
   * The pattern /0\t\d+/ checks if there are commits on the current HEAD that are not on the remote branch (e.g., 0 2). If this pattern matches, the function returns 'ahead'.
   */
  if (/0\t\d+/.exec(stdout) !== null) {
    return 'ahead';
  }
  /**
   * The pattern /\d+\t0/ checks if there are commits on the remote branch that are not on the current HEAD (e.g., 2 0). If this pattern matches, the function returns 'behind'.
   */
  if (/\d+\t0/.exec(stdout) !== null) {
    return 'behind';
  }
  /**
   * If none of these patterns match, the function returns 'diverged'. For example, the output `1 1` will indicates that there is one commit on the origin/main branch that is not on your current HEAD, and also one commit on your current HEAD that is not on the origin/main branch.
   */
  return 'diverged';
}

export async function assumeSync(
  folderPath: string,
  defaultBranchName: string,
  remoteName: string,
  logger?: ILogger,
): Promise<void> {
  const syncState = await getSyncState(folderPath, defaultBranchName, remoteName, logger);
  if (syncState === 'equal') {
    return;
  }
  throw new AssumeSyncError(syncState);
}

/**
 * get various repo state in string format
 * @param folderPath repo path to check
 * @param logger
 * @returns gitState
 * // TODO: use template literal type to get exact type of playbooks-repository state
 */
export async function getGitRepositoryState(folderPath: string, logger?: ILogger): Promise<string> {
  if (!(await hasGit(folderPath))) {
    return 'NOGIT';
  }
  const gitDirectory = await getGitDirectory(folderPath, logger);
  const [isRebaseI, isRebaseM, isAMRebase, isMerging, isCherryPicking, isBisecting] =
    await Promise.all([
      // isRebaseI
      (
        (await fs
          .lstat(path.join(gitDirectory, 'rebase-merge', 'interactive'))
          .catch(() => ({}))) as fs.Stats
      )?.isFile?.(),
      // isRebaseM
      (
        (await fs.lstat(path.join(gitDirectory, 'rebase-merge')).catch(() => ({}))) as fs.Stats
      )?.isDirectory?.(),
      // isAMRebase
      (
        (await fs.lstat(path.join(gitDirectory, 'rebase-apply')).catch(() => ({}))) as fs.Stats
      )?.isDirectory?.(),
      // isMerging
      (
        (await fs.lstat(path.join(gitDirectory, 'MERGE_HEAD')).catch(() => ({}))) as fs.Stats
      )?.isFile?.(),
      // isCherryPicking
      (
        (await fs.lstat(path.join(gitDirectory, 'CHERRY_PICK_HEAD')).catch(() => ({}))) as fs.Stats
      )?.isFile?.(),
      // isBisecting
      (
        (await fs.lstat(path.join(gitDirectory, 'BISECT_LOG')).catch(() => ({}))) as fs.Stats
      )?.isFile?.(),
    ]);
  let result = '';
  /* eslint-disable @typescript-eslint/strict-boolean-expressions */
  if (isRebaseI) {
    result += 'REBASE-i';
  } else if (isRebaseM) {
    result += 'REBASE-m';
  } else {
    if (isAMRebase) {
      result += 'AM/REBASE';
    }
    if (isMerging) {
      result += 'MERGING';
    }
    if (isCherryPicking) {
      result += 'CHERRY-PICKING';
    }
    if (isBisecting) {
      result += 'BISECTING';
    }
  }
  result += (
    await GitProcess.exec(['rev-parse', '--is-bare-repository', folderPath], folderPath)
  ).stdout.startsWith('true')
    ? '|BARE'
    : '';

  /* if ((await GitProcess.exec(['rev-parse', '--is-inside-work-tree', wikiFolderPath], wikiFolderPath)).stdout.startsWith('true')) {
    const { exitCode } = await GitProcess.exec(['diff', '--no-ext-diff', '--quiet', '--exit-code'], wikiFolderPath);
    // 1 if there were differences and 0 means no differences.
    if (exitCode !== 0) {
      result += '|DIRTY';
    }
  } */
  // previous above `playbooks-repository diff --no-ext-diff --quiet --exit-code` logic from playbooks-repository-sync script can only detect if an existed file changed, can't detect newly added file, so we use `haveLocalChanges` instead
  if (await haveLocalChanges(folderPath)) {
    result += '|DIRTY';
  }

  return result;
}

/**
 * echo the playbooks-repository dir
 * @param dir repo path
 * @param logger
 */
export async function getGitDirectory(dir: string, logger?: ILogger): Promise<string> {
  const logDebug = (message: string, step: GitStep): unknown =>
    logger?.debug?.(message, { functionName: 'getGitDirectory', step, dir });
  const logProgress = (step: GitStep): unknown =>
    logger?.info?.(step, {
      functionName: 'getGitDirectory',
      step,
      dir,
    });

  logProgress(GitStep.CheckingLocalGitRepoSanity);
  const { stdout, stderr } = await GitProcess.exec(
    ['rev-parse', '--is-inside-work-tree', dir],
    dir,
  );
  if (typeof stderr === 'string' && stderr.length > 0) {
    logDebug(stderr, GitStep.CheckingLocalGitRepoSanity);
    throw new CantSyncGitNotInitializedError(dir);
  }
  if (stdout.startsWith('true')) {
    const { stdout: stdout2 } = await GitProcess.exec(
      ['rev-parse', '--playbooks-repository-dir', dir],
      dir,
    );
    const [gitPath2, gitPath1] = compact(stdout2.split('\n'));
    if (gitPath2 !== undefined && gitPath1 !== undefined) {
      return path.resolve(gitPath1, gitPath2);
    }
  }
  throw new CantSyncGitNotInitializedError(dir);
}

/**
 * Check if dir has `.playbooks-repository`.
 * @param dir folder that may contains a playbooks-repository
 * @param strict if is true, then dir should be the root of the playbooks-repository repo. Default is true
 * @returns
 */
export async function hasGit(dir: string, strict = true): Promise<boolean> {
  try {
    const resultDir = await getGitDirectory(dir);
    if (strict && path.dirname(resultDir) !== dir) {
      return false;
    }
  } catch (error) {
    if (error instanceof CantSyncGitNotInitializedError) {
      return false;
    }
  }
  return true;
}

/**
 * get things like "origin"
 *
 * https://github.com/simonthum/git-sync/blob/31cc140df2751e09fae2941054d5b61c34e8b649/git-sync#L238-L257
 */
export async function getRemoteName(dir: string, branch: string): Promise<string> {
  let { stdout } = await GitProcess.exec(['config', '--get', `branch.${branch}.pushRemote`], dir);
  if (stdout.trim()) {
    return stdout.trim();
  }
  ({ stdout } = await GitProcess.exec(['config', '--get', `remote.pushDefault`], dir));
  if (stdout.trim()) {
    return stdout.trim();
  }
  ({ stdout } = await GitProcess.exec(['config', '--get', `branch.${branch}.remote`], dir));
  if (stdout.trim()) {
    return stdout.trim();
  }
  return 'origin';
}
