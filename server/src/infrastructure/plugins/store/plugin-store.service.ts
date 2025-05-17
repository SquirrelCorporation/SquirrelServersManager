import * as crypto from 'crypto';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model } from 'mongoose';
import * as tar from 'tar';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { isValidUrl } from '../../../utils/url-validation';
import { PluginSystem } from '../plugin-system';
import { RestartServerEvent } from '../../../core/events/restart-server.event';
import Events from '../../../core/events/events';
import { PluginStoreInfo } from './interfaces/plugin-store-info.interface';
import { PluginStoreConfig, PluginStoreConfigDocument } from './schemas/plugin-store-config.schema';

const AXIOS_TIMEOUT = 5000; // 5 seconds timeout for requests
const MAX_CONTENT_LENGTH = 1024 * 1024; // Max 1MB for repository JSON
const AXIOS_DOWNLOAD_TIMEOUT = 30000; // 30 seconds
const MAX_DOWNLOAD_SIZE = 50 * 1024 * 1024; // 50 MB limit for plugin packages

@Injectable()
export class PluginStoreService {
  private readonly logger = new Logger(PluginStoreService.name);

  constructor(
    private readonly configService: ConfigService<any>,
    @InjectModel(PluginStoreConfig.name)
    private readonly configModel: Model<PluginStoreConfigDocument>,
    @Inject('PLUGIN_SYSTEM') private readonly pluginSystem: PluginSystem,
    private eventEmitter: EventEmitter2,
  ) {}

  // Helper to get or create the single config document
  private async findOrCreateConfig(): Promise<PluginStoreConfigDocument> {
    let config = await this.configModel.findOne().exec();
    if (!config) {
      this.logger.log('No plugin store config found, creating one.');
      try {
        config = await this.configModel.create({}); // Create with default empty array
      } catch (error) {
        this.logger.error('Failed to create initial plugin store config', error);
        throw new InternalServerErrorException('Could not initialize plugin store configuration.');
      }
    }
    return config;
  }

  async getCustomRepositories(): Promise<string[]> {
    try {
      const config = await this.findOrCreateConfig();
      return config.customRepositories;
    } catch (error) {
      // Catch errors from findOrCreateConfig or potential read errors
      this.logger.error('Failed to get custom repositories from DB', error);
      throw new InternalServerErrorException('Could not retrieve custom repositories.');
    }
  }

  async addCustomRepository(url: string): Promise<string[]> {
    if (!isValidUrl(url)) {
      throw new BadRequestException('Invalid URL format provided.');
    }

    const config = await this.findOrCreateConfig();
    if (config.customRepositories.includes(url)) {
      this.logger.warn(`Repository URL already exists: ${url}`);
      return config.customRepositories;
    }

    // Add the new URL
    config.customRepositories.push(url);

    try {
      await config.save(); // Save the updated document
      this.logger.log(`Added custom repository: ${url}`);
      return config.customRepositories;
    } catch (error) {
      this.logger.error(
        `Failed to save updated repository list after adding ${url}: ${error}`,
        error,
      );
      throw new InternalServerErrorException('Failed to save repository list.');
    }
  }

  async removeCustomRepository(url: string): Promise<string[]> {
    if (!isValidUrl(url)) {
      this.logger.warn(`Attempting to remove a potentially invalid URL: ${url}`);
    }

    const config = await this.findOrCreateConfig();
    const initialLength = config.customRepositories.length;

    // Filter out the URL
    config.customRepositories = config.customRepositories.filter((repoUrl) => repoUrl !== url);

    if (config.customRepositories.length === initialLength) {
      this.logger.warn(`Repository URL not found for removal: ${url}`);
      // Optionally throw NotFoundException instead of returning the list
      // throw new NotFoundException(`Repository URL not found: ${url}`);
      return config.customRepositories;
    }

    try {
      await config.save(); // Save the updated document
      this.logger.log(`Removed custom repository: ${url}`);
      return config.customRepositories;
    } catch (error) {
      this.logger.error(
        `Failed to save updated repository list after removing ${url}: ${error}`,
        error,
      );
      throw new InternalServerErrorException('Failed to save repository list.');
    }
  }

  // --- Fetch Available Plugins Logic ---

  async getAvailablePlugins(): Promise<PluginStoreInfo[]> {
    // Ensure defaultRepoUrl is a string, even if missing in config
    const defaultRepoUrl = this.configService.get<string>(
      'pluginStore.defaultRepository',
      '', // Provide an empty string as default if not found
    );
    const customRepoUrls = await this.getCustomRepositories();

    // Combine URLs and filter out invalid/empty ones
    const allUrls = [
      defaultRepoUrl,
      ...customRepoUrls,
      'https://raw.githubusercontent.com/SquirrelCorporation/SquirrelServersManager-Plugins/refs/heads/master/plugins.json',
    ].filter((url): url is string => typeof url === 'string' && url.length > 0 && isValidUrl(url));

    if (allUrls.length === 0) {
      this.logger.warn('No valid plugin repository URLs configured.');
      return [];
    }

    this.logger.log(`Fetching plugins from ${allUrls.length} repositories...`);

    const results = await Promise.allSettled(allUrls.map((url) => this.fetchRepository(url)));

    const allPlugins: PluginStoreInfo[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        allPlugins.push(...result.value);
      } else if (result.status === 'rejected') {
        this.logger.warn(`Failed to fetch or parse repository ${allUrls[index]}: ${result.reason}`);
      }
    });

    // Deduplicate plugins based on ID, keeping the highest version? (Or just first seen?)
    // Simple deduplication by ID (first seen wins):
    const uniquePlugins = new Map<string, PluginStoreInfo>();
    for (const plugin of allPlugins) {
      if (!uniquePlugins.has(plugin.id)) {
        uniquePlugins.set(plugin.id, plugin);
      }
      // TODO: Add version comparison logic if needed to keep latest?
    }

    this.logger.log(`Found ${uniquePlugins.size} unique available plugins.`);
    return Array.from(uniquePlugins.values());
  }

  private async fetchRepository(url: string): Promise<PluginStoreInfo[] | null> {
    this.logger.debug(`Fetching repository from ${url}`);
    try {
      const response = await axios.get(url, {
        timeout: AXIOS_TIMEOUT,
        maxBodyLength: MAX_CONTENT_LENGTH,
        responseType: 'json',
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.status !== 200) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = response.data;

      // Basic validation of the response structure
      if (!Array.isArray(data)) {
        throw new Error('Repository data is not a JSON array.');
      }

      // Further validation could be added here to check each plugin object
      // against the PluginInfo interface structure.
      const validPlugins = data.filter((item: any) => {
        // Simple check for required fields
        return item && item.id && item.name && item.version && item.packageUrl;
      });

      this.logger.debug(`Successfully fetched ${validPlugins.length} plugins from ${url}`);
      return validPlugins as PluginStoreInfo[];
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        this.logger.warn(
          `Axios error fetching repository ${url}: ${error.message} (Status: ${error.response?.status})`,
        );
      } else {
        this.logger.warn(`Error fetching or parsing repository ${url}: ${error.message}`);
      }
      // Don't rethrow, just return null or empty to allow others to succeed
      return null;
    }
  }

  // --- End Fetch Available Plugins Logic ---

  // --- Install Plugin Logic ---

  async installPlugin(packageUrl: string, providedChecksum?: string): Promise<void> {
    this.logger.log(`Starting installation process for package: ${packageUrl}`);

    if (!isValidUrl(packageUrl)) {
      throw new BadRequestException('Invalid package URL provided.');
    }

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ssm-plugin-'));
    const downloadPath = path.join(tempDir, 'plugin.tar.gz');
    this.logger.debug(`Created temporary directory: ${tempDir}`);

    try {
      // 2. Download Package File
      this.logger.debug(`Downloading package from ${packageUrl} to ${downloadPath}`);
      const writer = fs.createWriteStream(downloadPath);
      const response = await axios.get(packageUrl, {
        responseType: 'stream',
        timeout: AXIOS_DOWNLOAD_TIMEOUT,
        maxBodyLength: MAX_DOWNLOAD_SIZE,
      });

      if (response.status !== 200) {
        throw new Error(`Download failed with status ${response.status}`);
      }
      response.data.pipe(writer);
      await new Promise<void>((resolve, reject) => {
        writer.on('finish', () => resolve());
        writer.on('error', reject);
      });
      this.logger.debug(`Package downloaded successfully to ${downloadPath}`);

      // 2b. Verify Checksum (use providedChecksum directly)
      if (providedChecksum) {
        this.logger.log(`Verifying checksum: ${providedChecksum}`);
        const fileBuffer = await fs.readFile(downloadPath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const calculatedChecksum = hashSum.digest('hex');
        if (calculatedChecksum !== providedChecksum) {
          throw new Error(
            `Checksum mismatch! Expected ${providedChecksum}, calculated ${calculatedChecksum}`,
          );
        }
        this.logger.log('Checksum verified successfully.');
      } else {
        this.logger.debug('No checksum provided, skipping verification.');
      }

      // 3. Extract Package File
      const extractDir = path.join(tempDir, 'extracted');
      await fs.ensureDir(extractDir);
      this.logger.debug(`Extracting ${downloadPath} to ${extractDir}`);
      await tar.x({
        file: downloadPath, // Extract from the downloaded file
        C: extractDir,
      });
      this.logger.log(`Package extracted successfully to ${extractDir}`);

      // 4. Validate Manifest
      const manifestPath = path.join(extractDir, 'manifest.json');
      this.logger.log(`Manifest path: ${manifestPath}`);
      if (!(await fs.pathExists(manifestPath))) {
        throw new Error('manifest.json not found in package root.');
      }
      const manifest = await fs.readJson(manifestPath);
      if (
        !manifest ||
        !manifest.id ||
        !manifest.name ||
        !manifest.version ||
        !manifest.entryPoint
      ) {
        throw new Error('Invalid manifest.json content. Missing required fields.');
      }
      this.logger.log(`Validated manifest for plugin: ${manifest.id} v${manifest.version}`);

      // 5. Determine Destination Path
      const pluginId = manifest.id;
      if (!/^[a-z0-9-]+$/.test(pluginId)) {
        throw new Error(`Invalid plugin ID format in manifest: ${pluginId}`);
      }
      // Use static path
      const pluginsDir = '/data/plugins';
      const destinationPath = path.join(pluginsDir, pluginId);
      this.logger.debug(`Destination path: ${destinationPath}`);

      // 6. Remove Existing Plugin Directory (if any)
      if (await fs.pathExists(destinationPath)) {
        this.logger.log(`Removing existing plugin directory: ${destinationPath}`);
        await fs.rm(destinationPath, { recursive: true, force: true });
      }

      // 7. Create Destination Directory (Parent needs to exist)
      await fs.ensureDir(pluginsDir);

      // 8. Move Extracted Files to Destination
      await fs.move(extractDir, destinationPath);
      this.logger.log(`Moved plugin files to ${destinationPath}`);

      // 9. Log completion and Emit Restart Event
      this.logger.log(
        `Plugin ${manifest.id} installed successfully. Server restart is required to load it.`,
      );
      this.logger.log('Plugin installation successful. Emitting restart request event...');
      this.eventEmitter.emit(Events.SERVER_RESTART_REQUEST, new RestartServerEvent());

      // Return control to the controller immediately so it can send the response
    } catch (error: any) {
      this.logger.error(error, `Installation failed: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Plugin installation failed: ${error.message}`);
    } finally {
      // 10. Cleanup Temporary Directory
      if (await fs.pathExists(tempDir)) {
        this.logger.debug(`Cleaning up temporary directory: ${tempDir}`);
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
          this.logger.error(`Failed to cleanup temporary directory ${tempDir}`, cleanupError);
        }
      }
    }
  }
  // --- End Install Plugin Logic ---
}
