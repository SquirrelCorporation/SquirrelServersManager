import { describe, expect, test, vi } from 'vitest';
import { DirectoryTree } from 'ssm-shared-lib';
import {
  recursiveTreeCompletion,
  recursivelyFlattenTree,
} from '../../../../modules/playbooks-repository/tree-utils';

const mockTree: DirectoryTree.TreeNode = {
  path: '/root',
  name: 'root',
  type: DirectoryTree.CONSTANTS.DIRECTORY,
  children: [
    {
      path: '/root/folder1',
      name: 'folder1',
      type: DirectoryTree.CONSTANTS.DIRECTORY,
      children: [
        {
          path: '/root/folder1/file1',
          name: 'file1',
          extension: '.yml',
          type: DirectoryTree.CONSTANTS.FILE,
        },
      ],
    },
    {
      path: '/root/folder2',
      name: 'folder2',
      type: DirectoryTree.CONSTANTS.DIRECTORY,
      children: [
        {
          path: '/root/folder2/file2',
          name: 'file2',
          extension: '.yml',
          type: DirectoryTree.CONSTANTS.FILE,
        },
      ],
    },
  ],
};

const complexTree1: DirectoryTree.TreeNode = {
  path: '/root',
  name: 'root',
  type: DirectoryTree.CONSTANTS.DIRECTORY,
  children: [
    {
      path: '/root/folder1',
      name: 'folder1',
      type: DirectoryTree.CONSTANTS.DIRECTORY,
      children: [
        {
          path: '/root/folder1/subfolder1',
          name: 'subfolder1',
          type: DirectoryTree.CONSTANTS.DIRECTORY,
          children: [
            {
              path: '/root/folder1/subfolder1/file1',
              name: 'file1',
              extension: '.yml',
              type: DirectoryTree.CONSTANTS.FILE,
            },
            {
              path: '/root/folder1/subfolder1/file2',
              name: 'file2',
              extension: '.txt',
              type: DirectoryTree.CONSTANTS.FILE,
            },
          ],
        },
      ],
    },
    {
      path: '/root/folder2',
      name: 'folder2',
      type: DirectoryTree.CONSTANTS.DIRECTORY,
      children: [
        {
          path: '/root/folder2/file1',
          name: 'file1',
          extension: '.yml',
          type: DirectoryTree.CONSTANTS.FILE,
        },
      ],
    },
  ],
};

const complexTree2: DirectoryTree.TreeNode = {
  path: '/home',
  name: 'home',
  type: DirectoryTree.CONSTANTS.DIRECTORY,
  children: [
    {
      path: '/home/documents',
      name: 'documents',
      type: DirectoryTree.CONSTANTS.DIRECTORY,
      children: [
        {
          path: '/home/documents/file1',
          name: 'file1',
          extension: '.docx',
          type: DirectoryTree.CONSTANTS.FILE,
        },
        {
          path: '/home/documents/file2',
          name: 'image',
          extension: '.jpeg',
          type: DirectoryTree.CONSTANTS.FILE,
        },
      ],
    },
    {
      path: '/home/pictures',
      name: 'pictures',
      type: DirectoryTree.CONSTANTS.DIRECTORY,
    },
  ],
};

describe('recursiveTreeCompletion', () => {
  vi.mock('../../../../data/database/repository/PlaybookRepo', async (importOriginal) => {
    return {
      default: {
        ...(await importOriginal<
          typeof import('../../../../data/database/repository/PlaybookRepo')
        >()),
        findOneByPath: async () => {
          return { uuid: 'uuid' };
        },
      },
    };
  });

  vi.mock('../../../../modules/ansible/utils/ExtraVars', async (importOriginal) => {
    return {
      default: {
        ...(await importOriginal<typeof import('../../../../modules/ansible/utils/ExtraVars')>()),
        findValueOfExtraVars: async () => {
          return undefined;
        },
      },
    };
  });

  test('should recursively process a tree and return new tree with completed nodes', async () => {
    const newTree = await recursiveTreeCompletion(mockTree);
    expect(newTree).not.toBeNull();
    expect(newTree).not.toBeUndefined();
    expect(newTree.length).toBeGreaterThan(0);
  });

  test('should throws an Error when the depth is greater than 20', async () => {
    let error: Error | undefined;
    try {
      await recursiveTreeCompletion(mockTree, 21);
    } catch (err) {
      error = err as Error;
    }
    expect(error).toBeDefined();
    expect(error?.message).toEqual(
      'Depth is too high, to prevent any infinite loop, directories depth is limited to 20',
    );
  });

  test('should handle an empty tree', async () => {
    const emptyTree: DirectoryTree.TreeNode = {
      path: '/',
      name: '',
      type: DirectoryTree.CONSTANTS.DIRECTORY,
      children: [],
    };

    const result = await recursiveTreeCompletion(emptyTree);

    expect(result).not.toBeNull();
    expect(result[0]?.children).toBeUndefined();
  });

  test('should not modify original tree', async () => {
    const originalTree = { ...mockTree };

    await recursiveTreeCompletion(mockTree);

    expect(JSON.stringify(originalTree)).toEqual(JSON.stringify(mockTree));
  });

  test('should keep the original structure of tree', async () => {
    const newTree = await recursiveTreeCompletion(mockTree);

    expect(JSON.stringify(newTree)).not.toEqual(JSON.stringify(mockTree));
  });

  test('should correctly process complexTree1 and return a completed tree', async () => {
    const newTree = await recursiveTreeCompletion(complexTree1);
    expect(newTree).not.toBeNull();
    expect(newTree).not.toBeUndefined();
    expect(newTree[0].children?.length).toBe(1);
    expect(newTree[0].children?.[0]?.children?.length).toBe(2);
    expect(newTree[0].children?.[0]?.children?.[0]?.children?.length).toBeUndefined();
    expect(newTree[0].children?.[1]?.children?.length).toBeUndefined();
  });

  test('should process complexTree2 correctly when it has a node with no children', async () => {
    const newTree = await recursiveTreeCompletion(complexTree2);
    expect(newTree[0]?.children?.[1]?.children?.length).toBe(2);
  });

  test('should add correct UUID to each node in the tree', async () => {
    const newTree = await recursiveTreeCompletion(mockTree);
    const assertUUID = (node: DirectoryTree.TreeNode) => {
      if (node.type === DirectoryTree.CONSTANTS.FILE) {
        expect((node as DirectoryTree.ExtendedTreeNode).uuid).toBe('uuid'); // make sure UUID is added correctly
      }
      if (Array.isArray(node.children)) {
        (node.children as DirectoryTree.TreeNode[]).forEach(assertUUID);
      }
    };
    newTree.forEach(assertUUID);
  });
});

describe('recursivelyFlattenTree', () => {
  const fileNode: DirectoryTree.TreeNode = {
    path: '/file',
    name: 'file',
    extension: '.yml',
    type: DirectoryTree.CONSTANTS.FILE,
  };

  const directoryNode: DirectoryTree.TreeNode = {
    path: '/dir',
    name: 'dir',
    type: DirectoryTree.CONSTANTS.DIRECTORY,
    children: [fileNode],
  };

  test('should correctly flatten a tree with one node', () => {
    const result = recursivelyFlattenTree(fileNode);
    expect(result).toEqual([fileNode]);
  });

  test('should correctly flatten a tree with a file and a directory', () => {
    const result = recursivelyFlattenTree(directoryNode);
    expect(result).toEqual([fileNode]);
  });

  test('should throw an error when depth is greater than 20', () => {
    const deepTree: DirectoryTree.TreeNode = directoryNode;
    let node = deepTree;
    for (let i = 0; i < 20; i++) {
      node.children = [{ ...directoryNode, path: `/dir${i}` }];
      node = node.children[0] as DirectoryTree.TreeNode;
    }
    expect(() => recursivelyFlattenTree(deepTree)).toThrowError(
      'Depth is too high, to prevent any infinite loop, directories depth is limited to 20',
    );
  });

  test('should correctly handle a tree with more than one level of depth', () => {
    const result = recursivelyFlattenTree({
      path: '/root',
      name: 'root',
      type: DirectoryTree.CONSTANTS.DIRECTORY,
      children: [
        {
          path: '/root/dir1',
          name: 'dir1',
          type: DirectoryTree.CONSTANTS.DIRECTORY,
          children: [
            { ...fileNode, path: '/root/dir1/file1', name: 'file1' },
            { ...fileNode, path: '/root/dir1/file2', name: 'file2' },
          ],
        },
        {
          path: '/root/dir2',
          name: 'dir2',
          type: DirectoryTree.CONSTANTS.DIRECTORY,
          children: [
            { ...fileNode, path: '/root/dir2/file1', name: 'file1' },
            { ...fileNode, path: '/root/dir2/file2', name: 'file2' },
          ],
        },
      ],
    });
    expect(result).toHaveLength(4);
    expect(result).toContainEqual(
      expect.objectContaining({
        path: '/root/dir1/file1',
        name: 'file1',
        type: DirectoryTree.CONSTANTS.FILE,
      }),
    );
    expect(result).toContainEqual(
      expect.objectContaining({
        path: '/root/dir1/file2',
        name: 'file2',
        type: DirectoryTree.CONSTANTS.FILE,
      }),
    );
    expect(result).toContainEqual(
      expect.objectContaining({
        path: '/root/dir2/file1',
        name: 'file1',
        type: DirectoryTree.CONSTANTS.FILE,
      }),
    );
    expect(result).toContainEqual(
      expect.objectContaining({
        path: '/root/dir2/file2',
        name: 'file2',
        type: DirectoryTree.CONSTANTS.FILE,
      }),
    );
  });
});
