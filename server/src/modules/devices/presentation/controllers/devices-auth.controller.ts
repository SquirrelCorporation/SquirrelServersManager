import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { SsmAnsible } from 'ssm-shared-lib';
import { JwtAuthGuard } from '@modules/auth/strategies/jwt-auth.guard';
import { DevicesService } from '../../application/services/devices.service';
import { CreateDeviceAuthDto, UpdateDeviceAuthDto } from '../dtos/device-auth.dto';
import { UpdateDockerAuthDto } from '../dtos/update-docker-auth.dto';
import { UpdateProxmoxAuthDto } from '../dtos/update-proxmox-auth.dto';
import {
  ISensitiveInfoService,
  SENSITIVE_INFO_SERVICE,
} from '../../domain/services/sensitive-info.service.interface';

// Configure multer for file uploads
const fileFilter = (req: any, file: Express.Multer.File, callback: any) => {
  const allowedExtensions = /\.(pem|crt|key)$/;
  if (!file.originalname.match(allowedExtensions)) {
    return callback(
      new HttpException('Only .pem, .crt, or .key files are allowed', HttpStatus.BAD_REQUEST),
      false,
    );
  }
  callback(null, true);
};

@Controller('device-credentials')
@UseGuards(JwtAuthGuard)
export class DevicesAuthController {
  constructor(
    private readonly devicesService: DevicesService,
    @Inject(SENSITIVE_INFO_SERVICE)
    private readonly sensitiveInfoService: ISensitiveInfoService,
  ) {}

  @Get(':uuid')
  async getDeviceAuth(@Param('uuid') uuid: string) {
    try {
      const device = await this.devicesService.findOneByUuid(uuid);
      if (!device) {
        throw new HttpException(`Device with UUID ${uuid} not found`, HttpStatus.NOT_FOUND);
      }

      const deviceAuth = await this.devicesService.findDeviceAuthByDevice(device);
      if (!deviceAuth) {
        throw new HttpException(
          `Device Auth for device with UUID ${uuid} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return deviceAuth;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error instanceof Error ? error.message : 'An unknown error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':uuid')
  async createDeviceAuth(
    @Param('uuid') uuid: string,
    @Body() createDeviceAuthDto: CreateDeviceAuthDto,
  ) {
    try {
      const device = await this.devicesService.findOneByUuid(uuid);
      if (!device) {
        throw new HttpException(`Device with UUID ${uuid} not found`, HttpStatus.NOT_FOUND);
      }

      const deviceAuth = {
        ...createDeviceAuthDto,
        authType: createDeviceAuthDto.authType,
        becomeMethod: createDeviceAuthDto.becomeMethod as unknown as SsmAnsible.AnsibleBecomeMethod,
        device,
      };

      const result = await this.devicesService.updateOrCreateDeviceAuth(deviceAuth as any);

      return { type: result.authType };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error instanceof Error ? error.message : 'Error creating device auth',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':uuid')
  async updateDeviceAuth(
    @Param('uuid') uuid: string,
    @Body() updateDeviceAuthDto: UpdateDeviceAuthDto,
  ) {
    try {
      const device = await this.devicesService.findOneByUuid(uuid);
      if (!device) {
        throw new HttpException(`Device with UUID ${uuid} not found`, HttpStatus.NOT_FOUND);
      }

      const deviceAuth = await this.devicesService.findDeviceAuthByDevice(device);
      if (!deviceAuth) {
        throw new HttpException(
          `Device Auth for device with UUID ${uuid} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Handle sensitive information
      if (updateDeviceAuthDto.sshPwd) {
        updateDeviceAuthDto.sshPwd = await this.sensitiveInfoService.prepareSensitiveInfoForWrite(
          updateDeviceAuthDto.sshPwd,
          deviceAuth.sshPwd,
        );
      }

      if (updateDeviceAuthDto.sshKey) {
        updateDeviceAuthDto.sshKey = await this.sensitiveInfoService.prepareSensitiveInfoForWrite(
          updateDeviceAuthDto.sshKey,
          deviceAuth.sshKey,
        );
      }

      if (updateDeviceAuthDto.sshKeyPass) {
        updateDeviceAuthDto.sshKeyPass =
          await this.sensitiveInfoService.prepareSensitiveInfoForWrite(
            updateDeviceAuthDto.sshKeyPass,
            deviceAuth.sshKeyPass,
          );
      }

      if (updateDeviceAuthDto.becomePass) {
        updateDeviceAuthDto.becomePass =
          await this.sensitiveInfoService.prepareSensitiveInfoForWrite(
            updateDeviceAuthDto.becomePass,
            deviceAuth.becomePass,
          );
      }

      const updatedDeviceAuth = await this.devicesService.updateDeviceAuth(
        deviceAuth,
        updateDeviceAuthDto,
      );
      return updatedDeviceAuth;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error instanceof Error ? error.message : 'An unknown error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':uuid')
  async removeDeviceAuth(@Param('uuid') uuid: string) {
    try {
      const device = await this.devicesService.findOneByUuid(uuid);
      if (!device) {
        throw new HttpException(`Device with UUID ${uuid} not found`, HttpStatus.NOT_FOUND);
      }

      await this.devicesService.deleteDeviceAuthByDevice(device);

      return;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error instanceof Error ? error.message : 'An unknown error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':uuid/docker')
  async updateDockerAuth(
    @Param('uuid') uuid: string,
    @Body() updateDockerAuthDto: UpdateDockerAuthDto,
  ) {
    try {
      const device = await this.devicesService.findOneByUuid(uuid);
      if (!device) {
        throw new HttpException(`Device with UUID ${uuid} not found`, HttpStatus.NOT_FOUND);
      }

      const deviceAuth = await this.devicesService.findDeviceAuthByDevice(device);
      if (!deviceAuth) {
        throw new HttpException(
          `Device Auth for device with UUID ${uuid} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Handle sensitive information
      if (updateDockerAuthDto.dockerCustomSshPwd) {
        updateDockerAuthDto.dockerCustomSshPwd =
          await this.sensitiveInfoService.prepareSensitiveInfoForWrite(
            updateDockerAuthDto.dockerCustomSshPwd,
            deviceAuth.dockerCustomSshPwd,
          );
      }

      if (updateDockerAuthDto.dockerCustomSshKey) {
        updateDockerAuthDto.dockerCustomSshKey =
          await this.sensitiveInfoService.prepareSensitiveInfoForWrite(
            updateDockerAuthDto.dockerCustomSshKey,
            deviceAuth.dockerCustomSshKey,
          );
      }

      if (updateDockerAuthDto.dockerCustomSshKeyPass) {
        updateDockerAuthDto.dockerCustomSshKeyPass =
          await this.sensitiveInfoService.prepareSensitiveInfoForWrite(
            updateDockerAuthDto.dockerCustomSshKeyPass,
            deviceAuth.dockerCustomSshKeyPass,
          );
      }

      const updatedDeviceAuth = await this.devicesService.updateDockerAuth(
        deviceAuth,
        updateDockerAuthDto,
      );
      return updatedDeviceAuth;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error instanceof Error ? error.message : 'An unknown error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':uuid/docker/certs/:type')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 1024 * 1024, // 1MB
      },
      fileFilter,
    }),
  )
  async uploadDockerAuthCerts(
    @Param('uuid') uuid: string,
    @Param('type') type: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!['ca', 'cert', 'key'].includes(type)) {
        throw new HttpException('Invalid certificate type', HttpStatus.BAD_REQUEST);
      }

      if (!file) {
        throw new HttpException('File not provided', HttpStatus.BAD_REQUEST);
      }

      const device = await this.devicesService.findOneByUuid(uuid);
      if (!device) {
        throw new HttpException(`Device with UUID ${uuid} not found`, HttpStatus.NOT_FOUND);
      }

      const deviceAuth = await this.devicesService.findDeviceAuthByDevice(device);
      if (!deviceAuth) {
        throw new HttpException(
          `Device Auth for device with UUID ${uuid} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Update the appropriate certificate
      switch (type) {
        case 'ca':
          deviceAuth.dockerCa = file.buffer;
          break;
        case 'cert':
          deviceAuth.dockerCert = file.buffer;
          break;
        case 'key':
          deviceAuth.dockerKey = file.buffer;
          break;
      }

      await this.devicesService.updateDeviceAuth(deviceAuth);

      return;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error uploading docker certificate',
        error instanceof HttpException ? error.getStatus() : HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':uuid/docker/certs/:type')
  async deleteDockerAuthCerts(@Param('uuid') uuid: string, @Param('type') type: string) {
    try {
      if (!['ca', 'cert', 'key'].includes(type)) {
        throw new HttpException('Invalid certificate type', HttpStatus.BAD_REQUEST);
      }

      const device = await this.devicesService.findOneByUuid(uuid);
      if (!device) {
        throw new HttpException(`Device with UUID ${uuid} not found`, HttpStatus.NOT_FOUND);
      }

      const deviceAuth = await this.devicesService.findDeviceAuthByDevice(device);
      if (!deviceAuth) {
        throw new HttpException(
          `Device Auth for device with UUID ${uuid} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Delete the appropriate certificate
      switch (type) {
        case 'ca':
          await this.devicesService.deleteDeviceAuthCa(deviceAuth);
          break;
        case 'cert':
          await this.devicesService.deleteDeviceAuthCert(deviceAuth);
          break;
        case 'key':
          await this.devicesService.deleteDeviceAuthKey(deviceAuth);
          break;
      }

      return;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error deleting docker certificate',
        error instanceof HttpException ? error.getStatus() : HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':uuid/proxmox')
  async updateProxmoxAuth(
    @Param('uuid') uuid: string,
    @Body() updateProxmoxAuthDto: UpdateProxmoxAuthDto,
  ) {
    try {
      const device = await this.devicesService.findOneByUuid(uuid);
      if (!device) {
        throw new HttpException(`Device with UUID ${uuid} not found`, HttpStatus.NOT_FOUND);
      }

      const deviceAuth = await this.devicesService.findDeviceAuthByDevice(device);
      if (!deviceAuth) {
        throw new HttpException(
          `Device Auth for device with UUID ${uuid} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Handle sensitive information
      if (updateProxmoxAuthDto.tokens?.tokenSecret) {
        updateProxmoxAuthDto.tokens.tokenSecret =
          await this.sensitiveInfoService.prepareSensitiveInfoForWrite(
            updateProxmoxAuthDto.tokens.tokenSecret,
            deviceAuth.proxmoxAuth?.tokens?.tokenSecret,
          );
      }

      if (updateProxmoxAuthDto.userPwd?.password) {
        updateProxmoxAuthDto.userPwd.password =
          await this.sensitiveInfoService.prepareSensitiveInfoForWrite(
            updateProxmoxAuthDto.userPwd.password,
            deviceAuth.proxmoxAuth?.userPwd?.password,
          );
      }

      const updatedDeviceAuth = await this.devicesService.updateProxmoxAuth(
        deviceAuth,
        updateProxmoxAuthDto,
      );
      return updatedDeviceAuth;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error instanceof Error ? error.message : 'An unknown error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
