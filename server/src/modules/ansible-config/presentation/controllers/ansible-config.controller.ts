import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnsibleConfigService } from '../../application/services/ansible-config.service';
import { AnsibleConfigDto, DeleteAnsibleConfigDto } from '../dtos/ansible-config.dto';
import {
  ANSIBLE_CONFIG_TAG,
  CreateAnsibleConfigDoc,
  DeleteAnsibleConfigDoc,
  GetAnsibleConfigDoc,
  UpdateAnsibleConfigDoc,
} from '../decorators/ansible-config.decorators';

/**
 * Controller for managing Ansible configuration
 */
@ApiTags(ANSIBLE_CONFIG_TAG)
@Controller('ansible-config')
export class AnsibleConfigController {
  constructor(private readonly ansibleConfigService: AnsibleConfigService) {}

  /**
   * Get the complete Ansible configuration
   */
  @Get()
  @GetAnsibleConfigDoc()
  getConfiguration() {
    return this.ansibleConfigService.readConfig();
  }

  /**
   * Create a new configuration entry
   */
  @Post()
  @CreateAnsibleConfigDoc()
  createConfigEntry(@Body() configDto: AnsibleConfigDto) {
    const { section, key, value, deactivated, description } = configDto;
    this.ansibleConfigService.createConfigEntry(section, key, value, deactivated, description);
    return;
  }

  /**
   * Update an existing configuration entry
   */
  @Put()
  @UpdateAnsibleConfigDoc()
  updateConfigEntry(@Body() configDto: AnsibleConfigDto) {
    const { section, key, value, deactivated, description } = configDto;
    this.ansibleConfigService.updateConfigEntry(section, key, value, deactivated, description);
    return;
  }

  /**
   * Delete a configuration entry
   */
  @Delete()
  @DeleteAnsibleConfigDoc()
  deleteConfigEntry(@Body() deleteDto: DeleteAnsibleConfigDto) {
    const { section, key } = deleteDto;
    this.ansibleConfigService.deleteConfigEntry(section, key);
    return;
  }
}
