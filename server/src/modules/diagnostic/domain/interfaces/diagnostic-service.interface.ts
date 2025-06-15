import { IDevice, IDeviceAuth } from '../../../devices';
import { DiagnosticReport } from '../../domain/entities/diagnostic.entity';

export interface IDiagnosticService {
  run(device: IDevice, deviceAuth: IDeviceAuth): Promise<DiagnosticReport>;
}
