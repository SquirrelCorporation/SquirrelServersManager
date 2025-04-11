import { describe, expect, test } from 'vitest';
import { directoryTree } from '../directory-tree.util';
import { TEST_DATA_DIRECTORY } from './constants';
import testTree from './fixture.js';
import testTreeZeroDepth from './depth/fixtureZeroDepth.js';
import testTreeFirstDepth from './depth/fixtureFirstDepth.js';
import testTreeSecondDepth from './depth/fixtureSecondDepth.js';
import excludeTree from './fixtureExclude';
import excludeTree2 from './fixtureMultipleExclude';

describe('directoryTree', () => {
  test('should not crash with empty options', () => {
    expect(directoryTree(TEST_DATA_DIRECTORY)).not.null;
  });

  test('should return an Object', () => {
    const tree = directoryTree(TEST_DATA_DIRECTORY, {
      extensions: /\.txt$/,
      followSymlinks: false,
    });
    expect(tree).to.be.an('object');
  });

  test('should list the children in a directory', () => {
    const tree = directoryTree(TEST_DATA_DIRECTORY, {
      extensions: /\.txt$/,
      followSymlinks: false,
    });

    // 4 including the empty `some_dir_2`.
    expect(tree?.children?.length).to.equal(4);
  });

  test('should execute a callback function for each file with no specified extensions', () => {
    const number_of_files = 7;
    let callback_executed_times = 0;

    directoryTree(TEST_DATA_DIRECTORY, { followSymlinks: false }, function () {
      callback_executed_times++;
    });

    expect(callback_executed_times).to.equal(number_of_files);
  });

  test('should execute a callback function for each directory', () => {
    const number_of_directories = 4;
    let callback_executed_times = 0;

    directoryTree(TEST_DATA_DIRECTORY, { followSymlinks: false }, undefined, function () {
      callback_executed_times++;
    });

    expect(callback_executed_times).to.equal(number_of_directories);
  });

  test('should execute a callback function for each file with specified extensions', () => {
    const number_of_files = 6;
    let callback_executed_times = 0;

    directoryTree(
      TEST_DATA_DIRECTORY,
      { extensions: /\.txt$/, followSymlinks: false },
      function () {
        callback_executed_times++;
      },
    );
    expect(callback_executed_times).to.equal(number_of_files);
  });

  test('should display the size of a directory (summing up the children)', () => {
    const tree = directoryTree(TEST_DATA_DIRECTORY, { extensions: /\.txt$/, attributes: ['size'] });
    expect(tree?.size).to.be.above(11000);
  });

  test('should not crash with directories where the user does not have necessary permissions', () => {
    const tree = directoryTree('/root/', { extensions: /\.txt$/ });
    expect(tree).to.equal(null);
  });

  test('should return the correct exact result', () => {
    const tree = directoryTree(TEST_DATA_DIRECTORY, {
      normalizePath: true,
      followSymlinks: false,
      attributes: ['size', 'type', 'extension'],
    });
    expect(tree).to.deep.equal(testTree);
  });

  test('should not swallow exceptions thrown in the callback function', () => {
    const error = new Error('Something happened!');
    const badFunction = function () {
      directoryTree(TEST_DATA_DIRECTORY, { extensions: /\.txt$/ }, function () {
        throw error;
      });
    };
    expect(badFunction).to.throw(error);
  });

  test('should exclude the correct folders', () => {
    const tree = directoryTree(TEST_DATA_DIRECTORY, {
      exclude: /another_dir/,
      normalizePath: true,
      followSymlinks: false,
      attributes: ['size', 'type', 'extension'],
    });
    expect(tree).to.deep.equal(excludeTree);
  });

  test('should exclude multiple folders', () => {
    const tree = directoryTree(TEST_DATA_DIRECTORY, {
      exclude: [/another_dir/, /some_dir_2/],
      normalizePath: true,
      followSymlinks: false,
      attributes: ['size', 'type', 'extension'],
    });
    expect(tree).to.deep.equal(excludeTree2);
  });

  test('should include attributes', () => {
    const tree = directoryTree(TEST_DATA_DIRECTORY, {
      attributes: ['mtime', 'ctime'],
      followSymlinks: false,
    });
    tree?.children?.forEach((child) => {
      if (child?.type === 'file') {
        expect(child).to.have.property('mtime');
        expect(child).to.have.property('ctime');
      }
    });
  });

  test('should respect "depth = 0" argument', () => {
    const tree = directoryTree(TEST_DATA_DIRECTORY, {
      depth: 0,
      normalizePath: true,
      followSymlinks: false,
      attributes: ['type', 'extension'],
    });
    expect(tree).to.deep.equal(testTreeZeroDepth);
  });

  test('should respect "depth = 1" argument', () => {
    const tree = directoryTree(TEST_DATA_DIRECTORY, {
      depth: 1,
      normalizePath: true,
      followSymlinks: false,
      attributes: ['type', 'extension'],
    });
    expect(tree).to.deep.equal(testTreeFirstDepth);
  });

  test('should respect "depth = 2" argument', () => {
    const tree = directoryTree(TEST_DATA_DIRECTORY, {
      depth: 2,
      normalizePath: true,
      followSymlinks: false,
      attributes: ['type', 'extension'],
    });
    expect(tree).to.deep.equal(testTreeSecondDepth);
  });

  test('should throw error when combines size attribute with depth option', () => {
    expect(
      directoryTree.bind(directoryTree, TEST_DATA_DIRECTORY, {
        depth: 2,
        normalizePath: true,
        followSymlinks: false,
        attributes: ['size', 'type', 'extension'],
      }),
    ).to.throw('usage of size attribute with depth option is prohibited');
  });
});
