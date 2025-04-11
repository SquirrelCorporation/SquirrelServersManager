import { Injectable } from '@nestjs/common';
import { IDevice } from '../../domain/entities/device.entity';
import { UpdateDeviceDto } from '../dtos/device.dto';

@Injectable()
export class DeviceMapper {
  updateEntity(entity: IDevice, dto: UpdateDeviceDto): IDevice {
    // Create a copy of the entity
    const updated = { ...entity };

    // Update capabilities if provided
    if (dto.capabilities) {
      updated.capabilities = {
        containers: {
          docker: dto.capabilities.containers?.docker || entity.capabilities.containers.docker,
          proxmox: dto.capabilities.containers?.proxmox || entity.capabilities.containers.proxmox,
          lxd: dto.capabilities.containers?.lxd || entity.capabilities.containers.lxd,
        },
      };
    }

    // Update simple fields
    if (dto.disabled !== undefined) {
      updated.disabled = dto.disabled;
    }
    if (dto.configuration) {
      updated.configuration = dto.configuration;
    }
    if (dto.dockerVersion) {
      updated.dockerVersion = dto.dockerVersion;
    }
    if (dto.dockerId) {
      updated.dockerId = dto.dockerId;
    }
    if (dto.hostname) {
      updated.hostname = dto.hostname;
    }
    if (dto.fqdn) {
      updated.fqdn = dto.fqdn;
    }
    if (dto.status !== undefined) {
      updated.status = dto.status;
    }
    if (dto.ip) {
      updated.ip = dto.ip;
    }
    if (dto.agentVersion) {
      updated.agentVersion = dto.agentVersion;
    }
    if (dto.agentLogPath) {
      updated.agentLogPath = dto.agentLogPath;
    }
    if (dto.agentType) {
      updated.agentType = dto.agentType;
    }

    return updated;
  }
}
