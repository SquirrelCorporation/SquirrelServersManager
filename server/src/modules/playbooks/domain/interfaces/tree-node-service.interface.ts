import { DirectoryTree } from 'ssm-shared-lib';

/**
 * Interface for tree node operations
 */
export interface ITreeNodeService {
  completeNode(node: DirectoryTree.ExtendedTreeNode): Promise<any>;
  recursivelyFlattenTree(tree: DirectoryTree.TreeNode, depth?: number): (DirectoryTree.TreeNode | undefined)[];
  recursiveTreeCompletion(tree: DirectoryTree.TreeNode, depth?: number): Promise<any>;
}

export const TREE_NODE_SERVICE = 'TREE_NODE_SERVICE'; 