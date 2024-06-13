import DeviceAuthRepo from '../data/database/repository/DeviceAuthRepo';
import Shell from '../integrations/shell';

async function saveAllDeviceAuthSshKeys() {
  const devicesAuth = (await DeviceAuthRepo.findAllPopWithSshKey()) || [];
  for (const deviceAuth of devicesAuth) {
    await Shell.saveSshKey(deviceAuth.sshKey as string, deviceAuth.device.uuid);
  }
}

export default {
  saveAllDeviceAuthSshKeys,
};
