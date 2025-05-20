import { FILE_PATTERN } from '@modules/playbooks/constants';
import { ITreeNodeService } from '@modules/playbooks/doma../../domain/interfaces/tree-node-service.interface';
import {
  IPlaybookRepository,
  PLAYBOOK_REPOSITORY,
} from '@modules/playbooks/domain/repositories/playbook-repository.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DirectoryTree } from 'ssm-shared-lib';
import { EXTRA_VARS_SERVICE, IExtraVarsService } from '@modules/ansible';

/**
 * Service for tree node operations
 */
@Injectable()
export class TreeNodeService implements ITreeNodeService {
  private readonly logger = new Logger(TreeNodeService.name);

  constructor(
    @Inject(PLAYBOOK_REPOSITORY)
    private readonly playbookRepository: IPlaybookRepository,
    @Inject(EXTRA_VARS_SERVICE) private readonly extraVarsService: IExtraVarsService,
  ) {}

  /**
   * Complete a node with additional information
   * @param node The node to complete
   * @returns The completed node
   */
  async completeNode(node: DirectoryTree.ExtendedTreeNode) {
    const { path } = node;
    this.logger.debug(`Completing node for path: ${path}`);

    const playbook = await this.playbookRepository.findOneByPath(path);

    if (!playbook) {
      throw new Error(`Unable to find any playbook for path ${path}`);
    }
    this.logger.debug(`Extra vars: ${JSON.stringify(playbook.extraVars)} for node ${path}`);
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

  recursivelyFlattenTree(
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
                .map((e) => (e === null ? [] : this.recursivelyFlattenTree(e, depth + 1)))
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
  async recursiveTreeCompletion(tree: DirectoryTree.TreeNode, depth = 0): Promise<any> {
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
          newTree.push({
            ...child,
            children: await this.recursiveTreeCompletion(child, depth + 1),
          });
        } else {
          if (child?.extension?.match(FILE_PATTERN)) {
            try {
              newTree.push(await this.completeNode(child));
            } catch (error: any) {
              this.logger.error(error);
            }
          } else {
            newTree.push(node);
          }
        }
      }
    } else {
      try {
        newTree.push(await this.completeNode(node));
      } catch (error: any) {
        this.logger.error(error);
      }
    }
    return newTree;
  }
}
