import { Body, Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/strategies/jwt-auth.guard';
import { AnsibleConfigService } from '../services/ansible-config.service';
import { AnsibleConfigDto, DeleteAnsibleConfigDto } from '../dto/ansible-config.dto';

/**
 * Controller for managing Ansible configuration
 */
@Controller('ansible/config')
@UseGuards(JwtAuthGuard)
export class AnsibleConfigController {
  constructor(private readonly ansibleConfigService: AnsibleConfigService) {}

  /**
   * Get the complete Ansible configuration
   */
  @Get()
  getConfiguration() {
    return {
      status: 'success',
      message: 'Got Ansible Configuration',
      data: this.ansibleConfigService.readConfig(),
    };
  }

  /**
   * Create a new configuration entry
   */
  @Post()
  createConfigEntry(@Body() configDto: AnsibleConfigDto) {
    const { section, key, value, deactivated, description } = configDto;
    this.ansibleConfigService.createConfigEntry(section, key, value, deactivated, description);
    return {
      status: 'success',
      message: 'Wrote Ansible Configuration',
    };
  }

  /**
   * Update an existing configuration entry
   */
  @Put()
  updateConfigEntry(@Body() configDto: AnsibleConfigDto) { 
    const { section, key, value, deactivated, description } = configDto;
    this.ansibleConfigService.updateConfigEntry(section, key, value, deactivated, description);
    return {
      status: 'success',
      message: 'Updated Ansible Configuration',
    };
  }

  /**
   * Delete a configuration entry
   */
  @Delete()
  deleteConfigEntry(@Body() deleteDto: DeleteAnsibleConfigDto) {
    const { section, key } = deleteDto;
    this.ansibleConfigService.deleteConfigEntry(section, key);
    return {
      status: 'success',
      message: 'Deleted Ansible Configuration',
    };
  }
}
