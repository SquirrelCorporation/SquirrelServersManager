import path from 'path';
import { GitProcess } from 'dugite';
import fs from 'fs-extra';
import { defaultGitInfo } from './default-info.util';

export interface IGitInitOptions {
  /**
   * Whether create a bare repo, useful as an upstream repo
   */
  bare?: boolean;

  /**
   * Default to true, to try to fix https://stackoverflow.com/questions/12267912/git-error-fatal-ambiguous-argument-head-unknown-revision-or-path-not-in-the
   *
   * Following techniques are not working:
   *
   * ```js
   * await GitProcess.exec(['symbolic-ref', 'HEAD', `refs/heads/${branch}`], dir);
   * await GitProcess.exec(['checkout', `-b`, branch], dir);
   * ```
   *
   * This works:
   * https://stackoverflow.com/a/51527691/4617295
   */
  initialCommit?: boolean;
  env?: Record<string, string>;
}

/**
 * Init and immediately checkout the branch, other wise the branch will be HEAD, which is annoying in the later steps
 */
export async function initGitWithBranch(
  dir: string,
  branch = defaultGitInfo.branch,
  options?: IGitInitOptions,
): Promise<void> {
  if (options?.bare === true) {
    const bareGitPath = path.join(dir, '.git');
    await fs.mkdirp(bareGitPath);
    await GitProcess.exec(['init', `--initial-branch=${branch}`, '--bare'], bareGitPath, {
      env: options.env,
    });
  } else {
    await GitProcess.exec(['init', `--initial-branch=${branch}`], dir, { env: options?.env });
  }

  if (options?.initialCommit !== false) {
    await GitProcess.exec(
      ['commit', `--allow-empty`, '-n', '-m', 'Initial commit when init a new git repository.'],
      dir,
      { env: options?.env },
    );
  }
}