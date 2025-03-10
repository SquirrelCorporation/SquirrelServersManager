import { DirectoryTree } from 'ssm-shared-lib';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExtraVarsService } from '../../ansible'
import { Playbook, PlaybookDocument } from '../components/playbooks-repository.component';

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

/**
 * Service for tree node operations
 */
@Injectable()
export class TreeNodeService {
  constructor(
    @InjectModel(Playbook.name)
    private readonly playbookModel: Model<PlaybookDocument>,
    private readonly extraVarsService: ExtraVarsService,
  ) {}

  /**
   * Complete a node with additional information
   * @param node The node to complete
   * @returns The completed node
   */
  async completeNode(node: DirectoryTree.ExtendedTreeNode) {
    const { path } = node;
    const playbook = await this.playbookModel.findOne({ path }).exec();

    if (!playbook) {
      throw new Error(`Unable to find any playbook for path ${path}`);
    }

    const extraVars = playbook?.extraVars
      ? await this.extraVarsService.findValueOfExtraVars(playbook.extraVars, undefined, true)
      : undefined;

    return {
      ...node,
      uuid: playbook?.uuid,
      extraVars: extraVars,
      custom: playbook?.custom,
    };
  }
}
