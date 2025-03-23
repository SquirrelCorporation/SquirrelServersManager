import * as FS from 'node:fs';
import * as PATH from 'node:path';
import { Stats } from 'fs-extra';
import { DirectoryTree } from 'ssm-shared-lib';

function safeReadDirSync(path: FS.PathLike) {
  let dirData: string[] = [];
  try {
    dirData = FS.readdirSync(path);
  } catch (ex: any) {
    if (ex.code === 'EACCES' || ex.code === 'EPERM') {
      //User does not have permissions, ignore directory
      return null;
    } else {
      throw ex;
    }
  }
  return dirData;
}

/**
 * Normalizes windows style paths by replacing double backslashes with single forward slashes (unix style).
 * @param  {string} path
 * @return {string}
 */
function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

/**
 * Tests if the supplied parameter is of type RegExp
 * @param  {any}  regExp
 * @return {Boolean}
 */
function isRegExp(regExp: any): boolean {
  return typeof regExp === 'object' && regExp.constructor === RegExp;
}

/**
 * Collects the files and folders for a directory path into an Object, subject
 * to the options supplied, and invoking optional
 * @param  {String} path
 * @param  {Object} options
 * @param  {function} onEachFile
 * @param  {function} onEachDirectory
 * @param currentDepth
 */
function directoryTree(
  path: string,
  options?: {
    depth?: any;
    attributes?: string[];
    normalizePath?: any;
    exclude?: any;
    followSymlinks?: any;
    symlinks?: any;
    extensions?: any;
  },
  onEachFile?: (arg0: DirectoryTree.TreeNode, arg1: string, arg2: FS.Stats) => void,
  onEachDirectory?: (arg0: DirectoryTree.TreeNode, arg1: string, arg2: FS.Stats) => void,
  currentDepth = 0,
) {
  options = options || {};

  if (
    options.depth !== undefined &&
    options.attributes &&
    options.attributes.indexOf('size') !== -1
  ) {
    throw new Error('usage of size attribute with depth option is prohibited');
  }

  const name = PATH.basename(path);
  path = options.normalizePath ? normalizePath(path) : path;
  const item: DirectoryTree.TreeNode = { path, name };
  let stats;
  let lstat;

  try {
    stats = FS.statSync(path);
    lstat = FS.lstatSync(path);
  } catch {
    return null;
  }

  // Skip if it matches the exclude regex
  if (options.exclude) {
    const excludes = isRegExp(options.exclude) ? [options.exclude] : options.exclude;
    if (excludes.some((exclusion: RegExp) => exclusion.test(path))) {
      return null;
    }
  }

  if (lstat.isSymbolicLink()) {
    item.isSymbolicLink = true;
    // Skip if symbolic links should not be followed
    if (options.followSymlinks === false) {
      return null;
    }
    // Initialize the symbolic links array to avoid infinite loops
    if (!options.symlinks) {
      options = { ...options, symlinks: [] };
    }
    // Skip if a cyclic symbolic link has been found
    if (options.symlinks.find((ino: number) => ino === lstat.ino)) {
      return null;
    } else {
      options.symlinks.push(lstat.ino);
    }
  }

  if (stats.isFile()) {
    const ext = PATH.extname(path).toLowerCase();

    // Skip if it does not match the extension regex
    if (options.extensions && !options.extensions.test(ext)) {
      return null;
    }

    if (options.attributes) {
      options.attributes.forEach((attribute) => {
        switch (attribute) {
          case 'extension':
            item.extension = ext;
            break;
          case 'type':
            item.type = DirectoryTree.CONSTANTS.FILE;
            break;
          default:
            item[attribute] = stats[attribute as keyof Stats];
            break;
        }
      });
    }

    if (onEachFile) {
      onEachFile(item, path, stats);
    }
  } else if (stats.isDirectory()) {
    const dirData = safeReadDirSync(path);
    if (dirData === null) {
      return null;
    }

    if (options.depth === undefined || options.depth > currentDepth) {
      item.children = dirData
        .map((child) =>
          directoryTree(
            PATH.join(path, child),
            options,
            onEachFile,
            onEachDirectory,
            currentDepth + 1,
          ),
        )
        .filter((e) => !!e);
    }

    if (options.attributes) {
      options.attributes.forEach((attribute) => {
        switch (attribute) {
          case 'size':
            item.size = item.children?.reduce((prev, cur) => prev + (cur?.size || 0), 0);
            break;
          case 'type':
            item.type = DirectoryTree.CONSTANTS.DIRECTORY;
            break;
          case 'extension':
            break;
          default:
            item[attribute] = stats[attribute as keyof Stats];
            break;
        }
      });
    }

    if (onEachDirectory) {
      onEachDirectory(item, path, stats);
    }
  } else {
    return null; // Or set item.size = 0 for devices, FIFO and sockets ?
  }
  return item;
}

export default directoryTree;
