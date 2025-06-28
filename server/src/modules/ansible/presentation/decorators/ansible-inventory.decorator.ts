import { applyDecorators } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';

export const ANSIBLE_INVENTORY_TAG = 'AnsibleInventory';

export const AnsibleInventoryControllerDocs = () => applyDecorators(ApiTags(ANSIBLE_INVENTORY_TAG));

export function GetInventoryDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get Ansible inventory' }),
    ApiQuery({ name: 'execUuid', type: String, required: true }),
    ApiQuery({ name: 'target', type: String, required: false }),
  );
}
