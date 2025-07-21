import { ApiProperty } from '@nestjs/swagger';
import { API } from 'ssm-shared-lib';

export class PlaybookDto implements API.PlaybookFile {
  @ApiProperty({ description: 'Unique identifier of the playbook', example: '1' })
  uuid: string;

  @ApiProperty({ description: 'Name of the playbook', example: 'setup-nginx' })
  name: string;

  @ApiProperty({
    description: 'Description of what the playbook does',
    example: 'Sets up and configures NGINX server',
  })
  description: string;

  @ApiProperty({ description: 'Path to the playbook file', example: '/playbooks/nginx/setup.yml' })
  path: string;

  @ApiProperty({ description: 'Whether the playbook is active', example: true })
  active: boolean;

  constructor() {
    this.uuid = '';
    this.name = '';
    this.description = '';
    this.path = '';
    this.active = false;
  }
}
