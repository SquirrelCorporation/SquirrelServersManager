import { Module } from '@nestjs/common';
import { AnsibleModule } from '../ansible/ansible.module';
import { ShellModule } from '../shell/shell.module';
import { AnsibleConfigController } from './controllers/ansible-config.controller';
import { AnsibleConfigService } from './services/ansible-config.service';

/**
 * AnsibleConfigModule provides functionality for managing Ansible configuration
 */
@Module({
  imports: [AnsibleModule, ShellModule],
  controllers: [AnsibleConfigController],
  providers: [AnsibleConfigService],
  exports: [AnsibleConfigService],
})
export class AnsibleConfigModule {}
