import ssh from 'ssh2';
import DeviceAuthRepo from '../../data/database/repository/DeviceAuthRepo';
import DeviceRepo from '../../data/database/repository/DeviceRepo';
import SSHCredentialsHelper from '../../helpers/ssh/SSHCredentialsHelper';
import { NotFoundError } from '../../middlewares/api/ApiError';

export default class SSHConnectionInstance {
  public ssh = new ssh.Client();
  private readonly deviceUuid: string;

  constructor(deviceUuid: string) {
    this.deviceUuid = deviceUuid;
  }

  async connect() {
    const { device, deviceAuth } = await this.fetchDeviceAndAuth();
    const sshCredentials = await SSHCredentialsHelper.getSShConnection(device, deviceAuth);

    this.ssh.connect(sshCredentials);
  }

  private async fetchDeviceAndAuth() {
    const device = await DeviceRepo.findOneByUuid(this.deviceUuid);
    if (!device) {
      throw new NotFoundError(`Device $${this.deviceUuid} not found`);
    }
    const deviceAuth = await DeviceAuthRepo.findOneByDevice(device);
    if (!deviceAuth) {
      throw new NotFoundError(`Device Auth $${this.deviceUuid} not found`);
    }
    return { device, deviceAuth };
  }
}
