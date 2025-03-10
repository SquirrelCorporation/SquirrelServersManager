import { Inject, Injectable, Logger } from '@nestjs/common';
import { DirectoryTree } from 'ssm-shared-lib';
import { ExtraVarsService } from '@modules/ansible';
import { IPlaybookRepository, PLAYBOOK_REPOSITORY } from '@modules/playbooks/domain/repositories/playbook-repository.interface';

/**
 * Service for tree node operations
 */
@Injectable()
export class TreeNodeService {
  private readonly logger = new Logger(TreeNodeService.name);

  constructor(
    @Inject(PLAYBOOK_REPOSITORY)
    private readonly playbookRepository: IPlaybookRepository,
    private readonly extraVarsService: ExtraVarsService,
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
