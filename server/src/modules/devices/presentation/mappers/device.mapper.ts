import { Injectable } from '@nestjs/common';
import { IDevice } from '../../domain/entities/device.entity';
import { CreateDeviceDto, UpdateDeviceDto } from '../dtos/device.dto';

@Injectable()
export class DeviceMapper {
  toEntity(dto: CreateDeviceDto): IDevice {
    return {
      _id: '', // Will be generated by MongoDB
      uuid: dto.uuid,
      disabled: dto.disabled,
      capabilities: {
        containers: {
          docker: dto.capabilitie?.containers?.docker,
          proxmox: dto.capabilitie?.containers?.proxmox,
          lxd: dto.capabilitie?.containers?.lxd,
        }
      },
      configuration: dto.configuration,
      dockerVersion: dto.dockerVersion,
      dockerId: dto.dockerId,
      hostname: dto.hostname,
      fqdn: dto.fqdn,
      status: dto.status,
      ip: dto.ip,
      agentVersion: dto.agentVersion,
      agentLogPath: dto.agentLogPath,
      agentType: dto.agentType,
      systemInformation: {} // Initialize with empty object
    };
  }

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
        }
      };
    }

    // Update simple fields
    if (dto.disabled !== undefined) {updated.disabled = dto.disabled;}
    if (dto.configuration) {updated.configuration = dto.configuration;}
    if (dto.dockerVersion) {updated.dockerVersion = dto.dockerVersion;}
    if (dto.dockerId) {updated.dockerId = dto.dockerId;}
    if (dto.hostname) {updated.hostname = dto.hostname;}
    if (dto.fqdn) {updated.fqdn = dto.fqdn;}
    if (dto.status !== undefined) {updated.status = dto.status;}
    if (dto.ip) {updated.ip = dto.ip;}
    if (dto.agentVersion) {updated.agentVersion = dto.agentVersion;}
    if (dto.agentLogPath) {updated.agentLogPath = dto.agentLogPath;}
    if (dto.agentType) {updated.agentType = dto.agentType;}

    return updated;
  }
}