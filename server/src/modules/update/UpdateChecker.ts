import axios from 'axios';
import * as semver from 'semver';
import { SettingsKeys } from 'ssm-shared-lib';
import { setToCache } from '../../data/cache';
import pinoLogger from '../../logger';
import { version } from '../../../package.json';

class UpdateChecker {
  private childLogger = pinoLogger.child(
    { module: `UpdateChecker` },
    { msgPrefix: '[SSM_UPDATE_CHECKER] - ' },
  );
  private readonly RELEASE_URL =
    'https://raw.githubusercontent.com/SquirrelCorporation/SquirrelServersManager/refs/heads/master/release.json';

  private async getRemoteVersion() {
    const release = await axios.get(this.RELEASE_URL);
    return release?.data?.version;
  }

  private compareVersions(localVersion: string, remoteVersion: string): number | null {
    if (!semver.valid(localVersion)) {
      this.childLogger.error('Invalid local version format');
      return null;
    }

    if (!semver.valid(remoteVersion)) {
      this.childLogger.error('Invalid remote version format');
      return null;
    }

    return semver.compare(localVersion, remoteVersion);
  }

  public async checkVersion() {
    const localVersion = version;
    const remoteVersion = await this.getRemoteVersion();
    if (remoteVersion) {
      const comparison = this.compareVersions(localVersion, remoteVersion);

      if (comparison === 0) {
        this.childLogger.info(
          'SSM remote and current versions are identical, no update available.',
        );
        await setToCache(SettingsKeys.GeneralSettingsKeys.UPDATE_AVAILABLE, '');
      } else if (comparison === 1) {
        this.childLogger.info(
          `The SSM local version (${localVersion}) is newer than the remote version (${remoteVersion}).`,
        );
        await setToCache(SettingsKeys.GeneralSettingsKeys.UPDATE_AVAILABLE, '');
      } else if (comparison === -1) {
        this.childLogger.info(
          `The SSM local version ${localVersion} is older than the remote version (${remoteVersion}).`,
        );
        await setToCache(SettingsKeys.GeneralSettingsKeys.UPDATE_AVAILABLE, remoteVersion);
      }
    } else {
      this.childLogger.error("Couldn't determine the latest remote version.");
    }
  }
}

export default new UpdateChecker();
