import { Module } from '@nestjs/common';
import { AnsibleModule } from '../ansible/ansible.module';
import { ShellModule } from '../shell/shell.module';
import { AnsibleConfigController } from './presentation/controllers/ansible-config.controller';
import { AnsibleConfigService } from './application/services/ansible-config.service';

/**
 * AnsibleConfigModule provides functionality for managing Ansible configuration
 *
 * This module follows the Clean Architecture pattern with the following layers:
 * - Presentation: Controllers, DTOs, and interfaces for handling HTTP requests
 * - Application: Services that implement business logic
 * - Domain: Entities and repository interfaces (core business logic)
 * - Infrastructure: Repository implementations and external services
 */
@Module({
  imports: [AnsibleModule, ShellModule],
  controllers: [AnsibleConfigController],
  providers: [AnsibleConfigService],
  exports: [AnsibleConfigService],
})
export class AnsibleConfigModule {}
