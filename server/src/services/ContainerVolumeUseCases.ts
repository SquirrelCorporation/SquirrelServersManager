import os from 'node:os';
import { SsmContainer } from 'ssm-shared-lib';
import { SSM_DATA_PATH } from '../config';
import ContainerVolume from '../data/database/model/ContainerVolume';
import { Kind } from '../modules/containers/core/Component';
import { WATCHERS } from '../modules/containers/core/conf';
import WatcherEngine from '../modules/containers/core/WatcherEngine';
import Docker from '../modules/containers/watchers/providers/docker/Docker';

const FILESYSTEM_BACKUP_PATH = SSM_DATA_PATH + '/backup/volumes/';
const BROWSER_BACKUP_PATH = os.tmpdir() + '/';

async function backupVolume(
  volume: ContainerVolume,
  mode: SsmContainer.VolumeBackupMode,
  asyncResult = false,
) {
  const registeredComponent = WatcherEngine.getStates().watcher[
    WatcherEngine.buildId(Kind.WATCHER, WATCHERS.DOCKER, volume.watcher)
  ] as Docker;
  if (!registeredComponent) {
    throw new Error('Watcher is not registered');
  }
  const filePath =
    mode === SsmContainer.VolumeBackupMode.FILE_SYSTEM
      ? FILESYSTEM_BACKUP_PATH
      : BROWSER_BACKUP_PATH;
  const fileName = `${volume.name}_${Date.now()}.tar`;
  if (asyncResult) {
    void registeredComponent.backupVolume(volume.name, filePath, fileName, true);
  } else {
    await registeredComponent.backupVolume(volume.name, filePath, fileName, false);
  }
  return { filePath, fileName };
}

export default {
  backupVolume,
};
