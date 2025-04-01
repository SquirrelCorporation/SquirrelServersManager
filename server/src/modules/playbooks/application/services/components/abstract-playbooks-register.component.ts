import { Logger } from '@nestjs/common';
import { EntityNotFoundException } from '@infrastructure/exceptions/app-exceptions';
import { IPlaybooksRegister } from '@modules/playbooks';
import { IPlaybook } from '@modules/playbooks';
import { IFileSystemService, IPlaybookFileService } from '@modules/shell';
import { directoryTree } from '@infrastructure/common/directory-tree/directory-tree.util';
import { SSM_DATA_PATH } from 'src/config';
import { IPlaybookRepository, IPlaybooksRegisterRepository } from '@modules/playbooks';
import { ITreeNodeService } from '@modules/playbooks';

// Using environment variable or default path
export const DIRECTORY_ROOT = SSM_DATA_PATH ? `${SSM_DATA_PATH}/playbooks` : '/tmp/playbooks';
export const FILE_PATTERN = /\.yml$/;

/**
 * Base class for all playbooks register components
 */
export default abstract class PlaybooksRegisterComponent {
  public name: string;
  public directory: string;
  public uuid: string;
  public childLogger: any;
  public rootPath: string;

  private static playbookRepository: IPlaybookRepository;
  private static playbooksRegisterRepository: IPlaybooksRegisterRepository;
  private static treeNodeService: ITreeNodeService;

  /**
   * Initialize static repositories
   * @param playbookRepo Playbook repository
   * @param playbooksRegisterRepo Playbooks register repository
   * @param treeNodeService Tree node service
   */
  public static initializeRepositories(
    playbookRepo: IPlaybookRepository,
    playbooksRegisterRepo: IPlaybooksRegisterRepository,
    treeNodeService: ITreeNodeService,
  ): void {
    PlaybooksRegisterComponent.playbookRepository = playbookRepo;
    PlaybooksRegisterComponent.playbooksRegisterRepository = playbooksRegisterRepo;
    PlaybooksRegisterComponent.treeNodeService = treeNodeService;
  }

  protected constructor(
    protected readonly fileSystemService: IFileSystemService,
    protected readonly playbookFileService: IPlaybookFileService,
    protected readonly playbookRepository: IPlaybookRepository,
    protected readonly playbooksRegisterRepository: IPlaybooksRegisterRepository,
    protected readonly treeNodeService: ITreeNodeService,
    uuid: string,
    name: string,
    rootPath: string,
  ) {
    this.rootPath = rootPath;
    const dir = `${rootPath}/${uuid}`;
    this.uuid = uuid;
    this.directory = dir;
    this.name = name;
    this.childLogger = Logger;
  }

  /**
   * Initialize the component
   */
  public abstract init(): Promise<void>;

  /**
   * Delete the component and its resources
   */
  public async delete() {
    await this.fileSystemService.deleteFiles(this.directory);
  }

  /**
   * Save a playbook content
   * @param playbookUuid UUID of the playbook to save
   * @param content Content to save
   */
  public async save(playbookUuid: string, content: string) {
    const playbook = await this.playbookRepository.findOneByUuid(playbookUuid);
    if (!playbook) {
      throw new EntityNotFoundException('Playbook', playbookUuid);
    }
    await this.fileSystemService.writeFile(playbook.path, content);
  }

  /**
   * Synchronize playbooks from file system to database
   */
  public async syncToDatabase() {
    this.childLogger.info('saving to database...');
    const playbooksRegister = await this.getPlaybooksRegister();
    this.childLogger.info(`getting directories tree...`);
    const filteredTree = await this.updateDirectoriesTree();
    if (!filteredTree) {
      this.childLogger.warn('No playbooks found in directory');
      return;
    }
    this.childLogger.info(`getting playbooks from database...`);
    const playbooksListFromDatabase =
      await this.playbookRepository.listAllByRepository(playbooksRegister);
    this.childLogger.info(
      `Found ${playbooksListFromDatabase?.length || 0} playbooks from database`,
    );
    const playbooksListFromDirectory = this.treeNodeService
      .recursivelyFlattenTree(filteredTree)
      .map((treeNode) => {
        if (treeNode && treeNode.extension?.match(FILE_PATTERN)) {
          this.childLogger.debug(`Found child : ${JSON.stringify(treeNode)}`);
          const { name, path } = treeNode;
          return { name, path } as IPlaybook;
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
            return this.playbookRepository.deleteByUuid(playbook.uuid);
          }
        }),
      );
    }
    const playbooksToSync = playbooksListFromDirectory?.filter((playbook) => {
      return playbook !== undefined;
    }) as IPlaybook[];
    this.childLogger.info(`Playbooks to sync : ${playbooksToSync.length}`);
    await Promise.all(
      playbooksToSync.map(async (playbook) => {
        return this.updateOrCreateAssociatedPlaybook(playbook, playbooksRegister);
      }),
    );
    this.childLogger.info(`Updating Playbooks Repository ${playbooksRegister.name}`);
    return playbooksToSync?.length;
  }

  /**
   * Get the playbooks repository
   */
  private async getPlaybooksRegister() {
    this.childLogger.info(`Getting playbooks register ${this.uuid}`);
    const playbooksRegister = await this.playbooksRegisterRepository.findByUuid(this.uuid);
    if (!playbooksRegister) {
      throw new EntityNotFoundException('PlaybooksRepository', this.uuid);
    }
    return playbooksRegister;
  }

  /**
   * Update the directory tree and save to database
   */
  public async updateDirectoriesTree() {
    this.childLogger.info(`Updating directories tree for ${this.uuid}`);
    const playbooksRegister = await this.getPlaybooksRegister();
    this.childLogger.info(`Getting directories tree... ${this.directory}`);
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
    playbooksRegister.tree = filteredTree;
    await this.playbooksRegisterRepository.update(playbooksRegister.uuid, playbooksRegister);
    return filteredTree;
  }

  /**
   * Update or create associated playbook
   */
  private async updateOrCreateAssociatedPlaybook(
    foundPlaybook: IPlaybook,
    playbooksRepository: IPlaybooksRegister,
  ): Promise<void> {
    const configurationFileContent = await this.playbookFileService.readConfigIfExists(
      foundPlaybook.path.replace('.yml', '.json'),
    );
    const isCustomPlaybook = !foundPlaybook.name.startsWith('_');
    const playbookFoundInDatabase = await this.playbookRepository.findOneByPath(foundPlaybook.path);
    if (!playbookFoundInDatabase) {
      throw new EntityNotFoundException('Playbook', `path: ${foundPlaybook.path}`);
    }
    const playbookData: IPlaybook = {
      path: foundPlaybook.path,
      name: foundPlaybook.name,
      custom: isCustomPlaybook,
      playbooksRepository: playbooksRepository,
      uuid: playbookFoundInDatabase?.uuid,
    };

    if (configurationFileContent) {
      this.childLogger.info(`playbook ${foundPlaybook.name} has configuration file`);

      try {
        const playbookConfiguration = JSON.parse(configurationFileContent);

        playbookData.playableInBatch = playbookConfiguration.playableInBatch;
        playbookData.extraVars = playbookConfiguration.extraVars;
        playbookData.uniqueQuickRef = playbookConfiguration.uniqueQuickRef;
      } catch (error: any) {
        this.childLogger.error(
          `Failed to parse configuration for ${foundPlaybook.name}: ${error.message}`,
        );
      }
    }
    this.childLogger.info(`Updating or creating playbook ${playbookData.name}`);
    try {
      await this.playbookRepository.updateOrCreate(playbookData);
    } catch (error: any) {
      this.childLogger.error(
        error,
        `Failed to update or create playbook ${playbookData.name}: ${error.message}`,
      );
    }
  }

  /**
   * Check if file belongs to repository
   */
  public fileBelongToRepository(path: string) {
    this.childLogger.info(
      `rootPath: ${this.directory?.split('/')[0]} versus ${path.split('/')[0]}`,
    );
    return this.directory?.split('/')[0] === path.split('/')[0];
  }

  /**
   * Get the component directory
   */
  public getDirectory() {
    return this.directory;
  }
}
