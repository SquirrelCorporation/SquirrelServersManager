import pino from 'pino';
import shell from 'shelljs';
import { NotFoundError } from '../../middlewares/api/ApiError';
import Playbook from '../../data/database/model/Playbook';
import PlaybooksRepository from '../../data/database/model/PlaybooksRepository';
import PlaybookRepo from '../../data/database/repository/PlaybookRepo';
import PlaybooksRepositoryRepo from '../../data/database/repository/PlaybooksRepositoryRepo';
import directoryTree from '../../helpers/directory-tree/directory-tree';
import { Playbooks } from '../../types/typings';
import Shell from '../shell';
import { recursivelyFlattenTree } from './tree-utils';

export const DIRECTORY_ROOT = '/playbooks';
export const FILE_PATTERN = /\.yml$/;

abstract class PlaybooksRepositoryComponent {
  public name: string;
  public directory: string;
  public uuid: string;
  public childLogger: pino.Logger<never>;
  public rootPath: string;

  protected constructor(uuid: string, name: string, rootPath: string) {
    this.rootPath = rootPath;
    const dir = `${rootPath}/${uuid}`;
    this.uuid = uuid;
    this.directory = dir;
    this.name = name;
    // @ts-expect-error mock
    this.childLogger = () => {};
  }

  public async delete() {
    Shell.FileSystemManager.deleteFiles(this.directory);
  }

  public async save(playbookUuid: string, content: string) {
    const playbook = await PlaybookRepo.findOneByUuid(playbookUuid);
    if (!playbook) {
      throw new NotFoundError(`Playbook ${playbookUuid} not found`);
    }
    shell.ShellString(content).to(playbook.path);
  }

  public async syncToDatabase() {
    this.childLogger.info('saving to database...');
    const playbooksRepository = await this.getPlaybookRepository();
    const filteredTree = await this.updateDirectoriesTree();
    if (!filteredTree) {
      return;
    }
    const playbooksListFromDatabase = await PlaybookRepo.listAllByRepository(playbooksRepository);
    this.childLogger.info(
      `Found ${playbooksListFromDatabase?.length || 0} playbooks from database`,
    );
    const playbooksListFromDirectory = recursivelyFlattenTree(filteredTree).map((treeNode) => {
      if (treeNode && treeNode.extension?.match(FILE_PATTERN)) {
        this.childLogger.debug(`Found child : ${JSON.stringify(treeNode)}`);
        const { name, path } = treeNode;
        return { name, path } as Playbook;
      }
    });
    this.childLogger.debug(playbooksListFromDirectory);
    this.childLogger.info(
      `Found ${playbooksListFromDirectory?.length || 0} playbooks from directory`,
    );
    const playbooksListToDelete = playbooksListFromDatabase?.filter((playbook) => {
      return !playbooksListFromDirectory?.some((p) => p?.path === playbook.path);
    });
    if (playbooksListToDelete && playbooksListToDelete.length > 0) {
      await Promise.all(
        playbooksListToDelete?.map((playbook) => {
          if (playbook && playbook.uuid) {
            return PlaybookRepo.deleteByUuid(playbook.uuid);
          }
        }),
      );
    }
    const playbooksToSync = playbooksListFromDirectory?.filter((playbook) => {
      return playbook !== undefined;
    }) as Playbook[];
    this.childLogger.info(`Playbooks to sync : ${playbooksToSync.length}`);
    await Promise.all(
      playbooksToSync.map(async (playbook) => {
        return this.updateOrCreateAssociatedPlaybook(playbook, playbooksRepository);
      }),
    );
    this.childLogger.info(
      `Updating Playbooks Repository ${playbooksRepository.name} - ${playbooksRepository._id}`,
    );
  }

  private async getPlaybookRepository() {
    const playbooksRepository = await PlaybooksRepositoryRepo.findByUuid(this.uuid);
    if (!playbooksRepository) {
      throw new NotFoundError(`Playbooks repository ${this.uuid} not found`);
    }
    return playbooksRepository;
  }

  public async updateDirectoriesTree() {
    const playbooksRepository = await this.getPlaybookRepository();
    const filteredTree = directoryTree(this.directory, {
      extensions: FILE_PATTERN,
      attributes: ['type', 'extension'],
      exclude: /\.git/,
    });
    if (!filteredTree) {
      this.childLogger.error(`No playbooks found in directory ${this.directory}`);
      return;
    }
    this.childLogger.debug(JSON.stringify(filteredTree));
    await PlaybooksRepositoryRepo.saveTree(playbooksRepository, filteredTree);
    return filteredTree;
  }

  private async updateOrCreateAssociatedPlaybook(
    foundPlaybook: Playbook,
    playbooksRepository: PlaybooksRepository,
  ): Promise<void> {
    const configurationFileContent = Shell.PlaybookFileManager.readConfigIfExists(
      foundPlaybook.path.replace('.yml', '.json'),
    );
    const isCustomPlaybook = !foundPlaybook.name.startsWith('_');
    const playbookFoundInDatabase = await PlaybookRepo.findOneByPath(foundPlaybook.path);
    const playbookData: Playbook = {
      path: foundPlaybook.path,
      name: foundPlaybook.name,
      custom: isCustomPlaybook,
      playbooksRepository: playbooksRepository,
      uuid: playbookFoundInDatabase?.uuid,
    };

    if (configurationFileContent) {
      this.childLogger.info(`playbook ${foundPlaybook.name} has configuration file`);

      const playbookConfiguration = JSON.parse(
        configurationFileContent,
      ) as Playbooks.PlaybookConfigurationFile;

      playbookData.playableInBatch = playbookConfiguration.playableInBatch;
      playbookData.extraVars = playbookConfiguration.extraVars;
      playbookData.uniqueQuickRef = playbookConfiguration.uniqueQuickRef;
    }

    await PlaybookRepo.updateOrCreate(playbookData);
  }

  public fileBelongToRepository(path: string) {
    this.childLogger.info(
      `rootPath: ${this.directory?.split('/')[0]} versus ${path.split('/')[0]}`,
    );
    return this.directory?.split('/')[0] === path.split('/')[0];
  }

  getDirectory() {
    return this.directory;
  }
}

export interface AbstractComponent extends PlaybooksRepositoryComponent {
  save(playbookUuid: string, content: string): Promise<void>;
  init(): Promise<void>;
  delete(): Promise<void>;
  syncFromRepository(): Promise<void>;
}

export default PlaybooksRepositoryComponent;
