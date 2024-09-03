import { DirectoryTree } from 'ssm-shared-lib';
import PlaybookRepo from '../../data/database/repository/PlaybookRepo';
import logger from '../../logger';
import ExtraVars from '../ansible/extravars/ExtraVars';
import { FILE_PATTERN } from './PlaybooksRepositoryComponent';

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

export async function recursiveTreeCompletion(
  tree: DirectoryTree.TreeNode,
  depth = 0,
): Promise<DirectoryTree.ExtendedTreeNode[]> {
  const node = tree;
  const newTree: DirectoryTree.ExtendedTreeNode[] = [];
  if (node?.children) {
    for (const child of node.children) {
      if (child && child.type === DirectoryTree.CONSTANTS.DIRECTORY) {
        if (depth > 20) {
          throw new Error(
            'Depth is too high, to prevent any infinite loop, directories depth is limited to 20',
          );
        }
        newTree.push({ ...child, children: await recursiveTreeCompletion(child, depth + 1) });
      } else {
        if (child?.extension?.match(FILE_PATTERN)) {
          try {
            newTree.push(await completeNode(child));
          } catch (error: any) {
            logger.error(error);
          }
        } else {
          newTree.push(node);
        }
      }
    }
  } else {
    try {
      newTree.push(await completeNode(node));
    } catch (error: any) {
      logger.error(error);
    }
  }
  return newTree;
}

async function completeNode(node: DirectoryTree.ExtendedTreeNode) {
  const { path } = node;
  const playbook = await PlaybookRepo.findOneByPath(path);
  const extraVars = playbook?.extraVars
    ? await ExtraVars.findValueOfExtraVars(playbook.extraVars, undefined, true)
    : undefined;
  if (!playbook) {
    throw new Error(`Unable to find any playbook for path ${path}`);
  }
  return {
    ...node,
    uuid: playbook?.uuid,
    extraVars: extraVars,
    custom: playbook?.custom,
  };
}
