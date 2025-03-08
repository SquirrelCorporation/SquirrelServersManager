import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
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
import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { DevicesService } from '../../application/services/devices.service';
import { CreateDeviceAuthDto, UpdateDeviceAuthDto } from '../dtos/device-auth.dto';
import { UpdateDockerAuthDto } from '../dtos/update-docker-auth.dto';
import { UpdateProxmoxAuthDto } from '../dtos/update-proxmox-auth.dto';
import { preWriteSensitiveInfos } from '../../../../helpers/sensitive/handle-sensitive-info';

// Configure multer for file uploads
const fileFilter = (req: any, file: Express.Multer.File, callback: any) => {
  const allowedExtensions = /\.(pem|crt|key)$/;
  if (!file.originalname.match(allowedExtensions)) {
    return callback(new HttpException('Only .pem, .crt, or .key files are allowed', HttpStatus.BAD_REQUEST), false);
  }
  callback(null, true);
};

@Controller('api/devices')
@UseGuards(JwtAuthGuard)
export class DevicesAuthController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get(':uuid/auth')
  async getDeviceAuth(@Param('uuid') uuid: string) {
    try {
      const device = await this.devicesService.findOneByUuid(uuid);
      if (!device) {
        throw new HttpException(`Device with UUID ${uuid} not found`, HttpStatus.NOT_FOUND);
      }

      const deviceAuth = await this.devicesService.findDeviceAuthByDevice(device);
      if (!deviceAuth) {
        throw new HttpException(`Device Auth for device with UUID ${uuid} not found`, HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        message: 'Device auth retrieved successfully',
        data: deviceAuth,
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error retrieving device auth',
        error instanceof HttpException ? error.getStatus() : HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':uuid/auth')
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

      return {
        success: true,
        message: 'Device auth created successfully',
        data: { type: result.authType },
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error creating device auth',
        error instanceof HttpException ? error.getStatus() : HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':uuid/auth')
  async updateDeviceAuth(
    @Param('uuid') uuid: string,
    @Body() updateDeviceAuthDto: UpdateDeviceAuthDto,
  ) {
    try {
      const device = await this.devicesService.findOneByUuid(uuid);
      if (!device) {
        throw new HttpException(`Device with UUID ${uuid} not found`, HttpStatus.NOT_FOUND);
      }

      const deviceAuthList = await this.devicesService.findDeviceAuthByDeviceUuid(uuid);
      if (!deviceAuthList || deviceAuthList.length === 0) {
        throw new HttpException(`Device Auth for device with UUID ${uuid} not found`, HttpStatus.NOT_FOUND);
      }

      const deviceAuth = deviceAuthList[0];

      // Process sensitive information
      if (updateDeviceAuthDto.sshPwd) {
        updateDeviceAuthDto.sshPwd = await preWriteSensitiveInfos(
          updateDeviceAuthDto.sshPwd,
          deviceAuth.sshPwd
        );
      }

      if (updateDeviceAuthDto.sshKey) {
        updateDeviceAuthDto.sshKey = await preWriteSensitiveInfos(
          updateDeviceAuthDto.sshKey,
          deviceAuth.sshKey
        );
      }

      if (updateDeviceAuthDto.sshKeyPass) {
        updateDeviceAuthDto.sshKeyPass = await preWriteSensitiveInfos(
          updateDeviceAuthDto.sshKeyPass,
          deviceAuth.sshKeyPass
        );
      }

      if (updateDeviceAuthDto.becomePass) {
        updateDeviceAuthDto.becomePass = await preWriteSensitiveInfos(
          updateDeviceAuthDto.becomePass,
          deviceAuth.becomePass
        );
      }

      const updatedDeviceAuth = {
        ...deviceAuth,
        ...updateDeviceAuthDto,
        // Keep the original authType from device auth
        authType: deviceAuth.authType,
        // Cast becomeMethod to the appropriate enum if it exists
        becomeMethod: updateDeviceAuthDto.becomeMethod ?
          updateDeviceAuthDto.becomeMethod as unknown as SsmAnsible.AnsibleBecomeMethod :
          deviceAuth.becomeMethod
      };

      const result = await this.devicesService.updateDeviceAuth(updatedDeviceAuth as any);

      return {
        success: true,
        message: 'Device auth updated successfully',
        data: result,
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error updating device auth',
        error instanceof HttpException ? error.getStatus() : HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':uuid/auth')
  async removeDeviceAuth(@Param('uuid') uuid: string) {
    try {
      const device = await this.devicesService.findOneByUuid(uuid);
      if (!device) {
        throw new HttpException(`Device with UUID ${uuid} not found`, HttpStatus.NOT_FOUND);
      }

      await this.devicesService.deleteDeviceAuthByDevice(device);

      return {
        success: true,
        message: 'Device auth deleted successfully',
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error deleting device auth',
        error instanceof HttpException ? error.getStatus() : HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':uuid/auth/docker')
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
        throw new HttpException(`Device Auth for device with UUID ${uuid} not found`, HttpStatus.NOT_FOUND);
      }

      // Process sensitive information
      if (updateDockerAuthDto.dockerCustomSshPwd) {
        updateDockerAuthDto.dockerCustomSshPwd = await preWriteSensitiveInfos(
          updateDockerAuthDto.dockerCustomSshPwd,
          deviceAuth.dockerCustomSshPwd
        );
      }

      if (updateDockerAuthDto.dockerCustomSshKey) {
        updateDockerAuthDto.dockerCustomSshKey = await preWriteSensitiveInfos(
          updateDockerAuthDto.dockerCustomSshKey,
          deviceAuth.dockerCustomSshKey
        );
      }

      if (updateDockerAuthDto.dockerCustomSshKeyPass) {
        updateDockerAuthDto.dockerCustomSshKeyPass = await preWriteSensitiveInfos(
          updateDockerAuthDto.dockerCustomSshKeyPass,
          deviceAuth.dockerCustomSshKeyPass
        );
      }

      // Cast Docker auth type if needed
      if (updateDockerAuthDto.dockerCustomAuthType) {
        const typedDockerAuthDto = {
          ...updateDockerAuthDto,
          // Map dockerCustomAuthType to SSHType or whatever is appropriate
          dockerCustomAuthType: updateDockerAuthDto.dockerCustomAuthType as any
        };

        const updatedDeviceAuth = {
          ...deviceAuth,
          ...typedDockerAuthDto
        };

        const result = await this.devicesService.updateDeviceAuth(updatedDeviceAuth);

        return {
          success: true,
          message: 'Docker auth updated successfully',
          data: {
            dockerCustomAuthType: result.dockerCustomAuthType,
          },
        };
      }
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error updating docker auth',
        error instanceof HttpException ? error.getStatus() : HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':uuid/auth/docker/certs/:type')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 1024 * 1024, // 1MB
      },
      fileFilter,
    })
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
        throw new HttpException(`Device Auth for device with UUID ${uuid} not found`, HttpStatus.NOT_FOUND);
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

      return {
        success: true,
        message: 'Docker certificate uploaded successfully',
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error uploading docker certificate',
        error instanceof HttpException ? error.getStatus() : HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':uuid/auth/docker/certs/:type')
  async deleteDockerAuthCerts(
    @Param('uuid') uuid: string,
    @Param('type') type: string,
  ) {
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
        throw new HttpException(`Device Auth for device with UUID ${uuid} not found`, HttpStatus.NOT_FOUND);
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

      return {
        success: true,
        message: 'Docker certificate deleted successfully',
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error deleting docker certificate',
        error instanceof HttpException ? error.getStatus() : HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':uuid/auth/proxmox')
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
        throw new HttpException(`Device Auth for device with UUID ${uuid} not found`, HttpStatus.NOT_FOUND);
      }

      // Process sensitive information
      if (updateProxmoxAuthDto.tokens?.tokenSecret) {
        updateProxmoxAuthDto.tokens.tokenSecret = await preWriteSensitiveInfos(
          updateProxmoxAuthDto.tokens.tokenSecret,
          deviceAuth.proxmoxAuth?.tokens?.tokenSecret
        );
      }

      if (updateProxmoxAuthDto.userPwd?.password) {
        updateProxmoxAuthDto.userPwd.password = await preWriteSensitiveInfos(
          updateProxmoxAuthDto.userPwd.password,
          deviceAuth.proxmoxAuth?.userPwd?.password
        );
      }

      // Convert the connection methods to the proper types
      const proxmoxAuth = {
        ...deviceAuth.proxmoxAuth || {},
        remoteConnectionMethod: updateProxmoxAuthDto.remoteConnectionMethod as any,
        connectionMethod: updateProxmoxAuthDto.connectionMethod as any,
        port: updateProxmoxAuthDto.port,
        ignoreSslErrors: updateProxmoxAuthDto.ignoreSslErrors,
        tokens: {
          tokenId: updateProxmoxAuthDto.tokens?.tokenId || deviceAuth.proxmoxAuth?.tokens?.tokenId,
          tokenSecret: updateProxmoxAuthDto.tokens?.tokenSecret || deviceAuth.proxmoxAuth?.tokens?.tokenSecret,
        },
        userPwd: {
          username: updateProxmoxAuthDto.userPwd?.username || deviceAuth.proxmoxAuth?.userPwd?.username,
          password: updateProxmoxAuthDto.userPwd?.password || deviceAuth.proxmoxAuth?.userPwd?.password,
        },
      };

      const updatedDeviceAuth = {
        ...deviceAuth,
        proxmoxAuth
      };

      await this.devicesService.updateDeviceAuth(updatedDeviceAuth);

      return {
        success: true,
        message: 'Proxmox auth updated successfully',
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error updating proxmox auth',
        error instanceof HttpException ? error.getStatus() : HttpStatus.BAD_REQUEST,
      );
    }
  }
}