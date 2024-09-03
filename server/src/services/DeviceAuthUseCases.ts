import DeviceAuthRepo from '../data/database/repository/DeviceAuthRepo';
import Shell from '../modules/shell';

async function saveAllDeviceAuthSshKeys() {
  const devicesAuth = (await DeviceAuthRepo.findAllPopWithSshKey()) || [];
  for (const deviceAuth of devicesAuth) {
    await Shell.SshPrivateKeyFileManager.saveSshKey(
      deviceAuth.sshKey as string,
      deviceAuth.device.uuid,
    );
  }
}

export default {
  saveAllDeviceAuthSshKeys,
};
