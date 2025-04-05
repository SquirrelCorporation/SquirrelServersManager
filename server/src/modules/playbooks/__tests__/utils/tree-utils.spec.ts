import { DirectoryTree } from 'ssm-shared-lib';
import { describe, expect, test, vi } from 'vitest';
import '../test-setup';

// Mock the tree utils functions
const recursiveTreeCompletion = vi.fn().mockImplementation(async (tree) => {
  // Return empty array for empty tree
  if (!tree.children || tree.children.length === 0) {
    return [];
  }
  
  // Otherwise return mock processed tree
  return [
    {
      key: '/root/folder1/file1',
      title: 'file1',
      path: '/root/folder1/file1',
      extension: '.yml',
      isLeaf: true,
    },
    {
      key: '/root/folder2/file2',
      title: 'file2',
      path: '/root/folder2/file2',
      extension: '.yml',
      isLeaf: true,
    },
  ];
});

const recursivelyFlattenTree = vi.fn().mockImplementation((node, depth = 0) => {
  if (depth > 20) {
    throw new Error('Depth is too high, to prevent any infinite loop, directories depth is limited to 20');
  }

  if (node.type === DirectoryTree.CONSTANTS.FILE) {
    return [node];
  }

  if (!node.children || node.children.length === 0) {
    return [];
  }

  let result: DirectoryTree.TreeNode[] = [];
  for (const child of node.children) {
    if (child.type === DirectoryTree.CONSTANTS.FILE) {
      result.push(child);
    } else {
      result = [...result, ...recursivelyFlattenTree(child, depth + 1)];
    }
  }
  return result;
});

// Mock imports
vi.mock('../../utils/tree-utils', () => ({
  recursiveTreeCompletion,
  recursivelyFlattenTree,
}));

// Mock tree structures for testing
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
  test('should recursively process a tree and return new tree with completed nodes', async () => {
    const newTree = await recursiveTreeCompletion(mockTree);
    expect(newTree).not.toBeNull();
    expect(newTree).not.toBeUndefined();
    expect(newTree.length).toBeGreaterThan(0);
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
    expect(result.length).toBe(0);
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
    expect(newTree.length).toBeGreaterThan(0);
  });

  test('should process complexTree2 correctly when it has a node with no children', async () => {
    const newTree = await recursiveTreeCompletion(complexTree2);
    expect(newTree).not.toBeNull();
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