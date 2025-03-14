import { DirectoryTree } from 'ssm-shared-lib';

export function recursivelyFlattenTree(
  tree: DirectoryTree.TreeNode,
  depth = 0,
): (DirectoryTree.TreeNode | undefined)[] {
  const node = tree;
  if (node.children) {
    return node.children
      .map((child) => {
        if (child && child.type === DirectoryTree.CONSTANTS.DIRECTORY) {
          if (depth > 20) {
            throw new Error(
              'Depth is too high, to prevent any infinite loop, directories depth is limited to 20',
            );
          }
          if (child.children) {
            return child.children
              .map((e) => (e === null ? [] : recursivelyFlattenTree(e, depth + 1)))
              .flat();
          }
        } else {
          return child || [];
        }
      })
      .flat();
  }
  return [node.children ? node.children : node];
}

/**
 * Recursively completes a tree by processing its children
 * @param tree The tree to complete
 * @returns The completed tree
 */
export async function recursiveTreeCompletion(tree: any): Promise<any> {
  if (!tree) {
    return [];
  }

  if (tree.children && Array.isArray(tree.children)) {
    const substitutedChildren = tree.children.map(async (child: any) => {
      return {
        ...child,
        children: await recursiveTreeCompletion(child),
      };
    });

    return Promise.all(substitutedChildren);
  }

  return [];
}
