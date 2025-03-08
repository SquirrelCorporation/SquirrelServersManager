import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DirectoryTree } from 'ssm-shared-lib';
import { ExtraVarsService } from '../../ansible';
import { Playbook, PlaybookDocument } from '../components/playbooks-repository.component';

/**
 * Service for tree node operations
 */
@Injectable()
export class TreeNodeService {
  private readonly logger = new Logger(TreeNodeService.name);

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
    this.logger.debug(`Completing node for path: ${path}`);

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
