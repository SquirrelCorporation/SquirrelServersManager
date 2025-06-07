import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';

export function GetInventoryDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get Ansible inventory' }),
    ApiQuery({ name: 'execUuid', type: String, required: true }),
    ApiQuery({ name: 'target', type: String, required: false }),
  );
}
