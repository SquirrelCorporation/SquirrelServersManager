import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnsibleConfigDto, DeleteAnsibleConfigDto } from '../dtos/ansible-config.dto';

export const ANSIBLE_CONFIG_TAG = 'AnsibleConfiguration';

export function GetAnsibleConfigDoc() {
  return applyDecorators(
    ApiTags(ANSIBLE_CONFIG_TAG),
    ApiOperation({ summary: 'Get the complete Ansible configuration' }),
    ApiOkResponse({
      description: 'Successfully retrieved Ansible configuration',
      schema: {
        properties: {
          status: { type: 'string', example: 'success' },
          message: { type: 'string', example: 'Got Ansible Configuration' },
          data: { type: 'object', description: 'Ansible configuration data' },
        },
      },
    }),
  );
}

export function CreateAnsibleConfigDoc() {
  return applyDecorators(
    ApiTags(ANSIBLE_CONFIG_TAG),
    ApiOperation({ summary: 'Create a new configuration entry' }),
    ApiBody({ type: AnsibleConfigDto }),
    ApiOkResponse({
      description: 'Successfully created configuration entry',
      schema: {
        properties: {
          status: { type: 'string', example: 'success' },
          message: { type: 'string', example: 'Wrote Ansible Configuration' },
        },
      },
    }),
  );
}

export function UpdateAnsibleConfigDoc() {
  return applyDecorators(
    ApiTags(ANSIBLE_CONFIG_TAG),
    ApiOperation({ summary: 'Update an existing configuration entry' }),
    ApiBody({ type: AnsibleConfigDto }),
    ApiOkResponse({
      description: 'Successfully updated configuration entry',
      schema: {
        properties: {
          status: { type: 'string', example: 'success' },
          message: { type: 'string', example: 'Updated Ansible Configuration' },
        },
      },
    }),
  );
}

export function DeleteAnsibleConfigDoc() {
  return applyDecorators(
    ApiTags(ANSIBLE_CONFIG_TAG),
    ApiOperation({ summary: 'Delete a configuration entry' }),
    ApiBody({ type: DeleteAnsibleConfigDto }),
    ApiOkResponse({
      description: 'Successfully deleted configuration entry',
      schema: {
        properties: {
          status: { type: 'string', example: 'success' },
          message: { type: 'string', example: 'Deleted Ansible Configuration' },
        },
      },
    }),
  );
}
