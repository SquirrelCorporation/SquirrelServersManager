import { SFTPDataNode } from '@/components/DeviceComponents/SFTPDrawer/SFTPDrawer';
import React from 'react';

export const updateTreeData = (
  list: SFTPDataNode[],
  key: React.Key,
  newChildren?: SFTPDataNode[] | undefined,
  isDelete = false, // New parameter for deletion
): SFTPDataNode[] =>
  list
    .map((node) => {
      if (node.key === key) {
        console.log('updating node', node.key, isDelete);
        if (isDelete) {
          console.log('deleting node', node.key);
          // If it's marked for deletion, exclude this node
          return null;
        }
        return {
          ...node,
          // Merge existing children with the new ones (if any children exist)
          children: [
            ...(node.children || []),
            ...((newChildren as SFTPDataNode[]) || []),
          ],
        };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, newChildren, isDelete).filter(
            Boolean,
          ),
        };
      }
      return node;
    })
    .filter(Boolean) as SFTPDataNode[];

export const updateNodeKeyAndTitle = (
  nodes: SFTPDataNode[],
  oldKey: string,
  newKey: string,
  updatedTitle: string,
): SFTPDataNode[] =>
  nodes.map((node) => {
    if (node.key === oldKey) {
      console.log('updating node', node.key, newKey, updatedTitle);
      // Update the node with the new key and title
      return { ...node, key: newKey, title: updatedTitle };
    }

    if (node.children) {
      // Recursively update children if they exist
      return {
        ...node,
        children: updateNodeKeyAndTitle(
          node.children,
          oldKey,
          newKey,
          updatedTitle,
        ),
      };
    }

    return node;
  });

export const updateNodeMode = (
  nodes: SFTPDataNode[],
  keyToUpdate: string,
  updatedMode: number,
): SFTPDataNode[] =>
  nodes.map((node) => {
    if (node.key === keyToUpdate) {
      // Update the mode of the node that matches the key
      return { ...node, mode: updatedMode };
    }

    if (node.children) {
      // Recursively check and update children
      return {
        ...node,
        children: updateNodeMode(node.children, keyToUpdate, updatedMode),
      };
    }

    return node;
  });
