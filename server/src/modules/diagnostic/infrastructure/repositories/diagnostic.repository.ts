import { Inject, Injectable } from '@nestjs/common';
import { IDevice, IDeviceAuth } from '../../../devices';
import { IDiagnosticRepository } from '../../domain/repositories/diagnostic-repository.interface';

@Injectable()
export class DiagnosticRepository implements IDiagnosticRepository {
  constructor(
    @Inject('IDeviceRepository') private deviceRepository: any,
    @Inject('IDeviceAuthRepository') private deviceAuthRepository: any
  ) {}

  async getDeviceById(uuid: string): Promise<IDevice | null> {
    return this.deviceRepository.findByUuid(uuid);
  }

  async getDeviceAuthByDevice(device: IDevice): Promise<IDeviceAuth | null> {
    return this.deviceAuthRepository.findByDevice(device);
  }
}