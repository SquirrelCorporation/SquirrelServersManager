import { IDevice, IDeviceAuth } from '../../../devices';

export interface IDiagnosticRepository {
  getDeviceById(uuid: string): Promise<IDevice | null>;
  getDeviceAuthByDevice(device: IDevice): Promise<IDeviceAuth | null>;
}