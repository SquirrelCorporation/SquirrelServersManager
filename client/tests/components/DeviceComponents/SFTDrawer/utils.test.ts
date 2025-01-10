import { describe, it, expect } from 'vitest';
import {
  updateTreeData,
  updateNodeKeyAndTitle,
  updateNodeMode,
} from '@/components/DeviceComponents/SFTPDrawer/utils'; // Replace with actual file path
import type { SFTPDataNode } from '@/components/DeviceComponents/SFTPDrawer/SFTPDrawer';

describe('SFTP Tree Utility Functions', () => {
  const initialData: SFTPDataNode[] = [
    {
      title: 'Root',
      key: '/',
      children: [
        {
          title: 'Folder1',
          key: '/folder1',
          children: [{ title: 'File1', key: '/folder1/file1', isLeaf: true }],
        },
        {
          title: 'Folder2',
          key: '/folder2',
          children: [],
        },
      ],
    },
  ];

  describe('updateTreeData', () => {
    it('should add new children to a node with an empty children array', () => {
      const updatedData = updateTreeData(initialData, '/folder2', [
        { title: 'FileA', key: '/folder2/fileA', isLeaf: true },
      ]);

      const targetNode = updatedData[0].children?.find(
        (node) => node.key === '/folder2',
      );
      expect(targetNode?.children?.length).toEqual(1);
      expect(targetNode?.children?.[0]).toEqual({
        title: 'FileA',
        key: '/folder2/fileA',
        isLeaf: true,
      });
    });

    it('should merge new children with existing ones', () => {
      const updatedData = updateTreeData(initialData, '/folder1', [
        { title: 'File2', key: '/folder1/file2', isLeaf: true },
      ]);

      const targetNode = updatedData[0].children?.find(
        (node) => node.key === '/folder1',
      );
      expect(targetNode?.children?.length).toEqual(2);
      expect(targetNode?.children).toContainEqual({
        title: 'File2',
        key: '/folder1/file2',
        isLeaf: true,
      });
    });

    it('should not modify tree if target key is not found', () => {
      const updatedData = updateTreeData(initialData, '/non-existent', [
        { title: 'FileX', key: '/non-existent/fileX', isLeaf: true },
      ]);

      expect(updatedData).toEqual(initialData);
    });

    it('should handle nested structures and update target nodes', () => {
      const deepNestedData: SFTPDataNode[] = [
        {
          title: 'Root',
          key: '/',
          children: [
            {
              title: 'Folder1',
              key: '/folder1',
              children: [
                {
                  title: 'NestedFolder',
                  key: '/folder1/nested',
                  children: [],
                },
              ],
            },
          ],
        },
      ];

      const updatedData = updateTreeData(deepNestedData, '/folder1/nested', [
        {
          title: 'FileNested',
          key: '/folder1/nested/FileNested',
          isLeaf: true,
        },
      ]);

      const targetNode = updatedData[0].children?.[0].children?.find(
        (node) => node.key === '/folder1/nested',
      );
      expect(targetNode?.children?.length).toEqual(1);
      expect(targetNode?.children?.[0].key).toEqual(
        '/folder1/nested/FileNested',
      );
    });
  });

  describe('updateNodeKeyAndTitle', () => {
    it('should update key and title of a node', () => {
      const updatedData = updateNodeKeyAndTitle(
        initialData,
        '/folder2',
        '/newFolder2',
        'New Folder 2',
      );

      const targetNode = updatedData[0].children?.find(
        (node) => node.key === '/newFolder2',
      );
      expect(targetNode).toBeDefined();
      expect(targetNode?.title).toEqual('New Folder 2');
    });

    it('should not modify tree if target key is not found', () => {
      const updatedData = updateNodeKeyAndTitle(
        initialData,
        '/non-existent',
        '/newKey',
        'New Title',
      );

      expect(updatedData).toEqual(initialData);
    });

    it('should handle deep nesting and update target nodes', () => {
      const updatedData = updateNodeKeyAndTitle(
        initialData,
        '/folder1/file1',
        '/folder1/newFile1',
        'New File 1',
      );

      const targetNode = updatedData[0].children?.[0].children?.find(
        (node) => node.key === '/folder1/newFile1',
      );
      expect(targetNode).toBeDefined();
      expect(targetNode?.title).toEqual('New File 1');
    });

    it('should update only the specified target node, leaving others unchanged', () => {
      const updatedData = updateNodeKeyAndTitle(
        initialData,
        '/folder2',
        '/folder2Renamed',
        'Renamed Folder2',
      );

      const unchangedNode = updatedData[0].children?.find(
        (node) => node.key === '/folder1',
      );
      expect(unchangedNode).toBeDefined();
      expect(unchangedNode?.key).toEqual('/folder1');
      expect(unchangedNode?.title).toEqual('Folder1');
    });
  });

  describe('updateNodeMode', () => {
    it('should update the mode of a specific node', () => {
      const updatedData = updateNodeMode(initialData, '/folder2', 755);

      const targetNode = updatedData[0].children?.find(
        (node) => node.key === '/folder2',
      );
      expect(targetNode).toBeDefined();
      expect(targetNode?.mode).toEqual(755);
    });

    it('should not modify tree if target key is not found', () => {
      const updatedData = updateNodeMode(initialData, '/non-existent', 777);

      expect(updatedData).toEqual(initialData);
    });

    it('should handle nested structures and update mode of target nodes', () => {
      const updatedData = updateNodeMode(initialData, '/folder1/file1', 644);

      const targetNode = updatedData[0].children?.[0].children?.find(
        (node) => node.key === '/folder1/file1',
      );
      expect(targetNode).toBeDefined();
      expect(targetNode?.mode).toEqual(644);
    });

    it('should only update the targeted node and leave others unchanged', () => {
      const updatedData = updateNodeMode(initialData, '/folder1', 755);

      const unchangedNode = updatedData[0].children?.find(
        (node) => node.key === '/folder2',
      );
      expect(unchangedNode).toBeDefined();
      expect(unchangedNode?.mode).toBeUndefined();
    });
  });
});
