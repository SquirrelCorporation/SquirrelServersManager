import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiErrorResponse, ApiSuccessResponse } from '@infrastructure/models/api-response.model';
import { CreateVaultDto, UpdateVaultDto, VaultPasswordResponseDto } from '../dto/ansible-vault.dto';

export const ANSIBLE_VAULTS_TAG = 'AnsibleVaults';

export function GetVaultsDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all ansible vaults' }),
    ApiOkResponse({
      description: 'List of all ansible vaults',
      schema: {
        type: 'array',
        items: { $ref: '#/components/schemas/AnsibleVault' },
      },
    }),
  );
}

export function CreateVaultDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new ansible vault' }),
    ApiBody({ type: CreateVaultDto }),
    ApiOkResponse({
      description: 'Vault created successfully',
      type: ApiSuccessResponse,
    }),
    ApiBadRequestResponse({
      description: 'Bad request - Invalid vault data',
      type: ApiErrorResponse,
    }),
  );
}

export function DeleteVaultDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete an ansible vault' }),
    ApiParam({ name: 'vaultId', description: 'ID of the vault to delete' }),
    ApiOkResponse({
      description: 'Vault deleted successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Vault not found',
      type: ApiErrorResponse,
    }),
  );
}

export function UpdateVaultDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Update an ansible vault password' }),
    ApiParam({ name: 'vaultId', description: 'ID of the vault to update' }),
    ApiBody({ type: UpdateVaultDto }),
    ApiOkResponse({
      description: 'Vault password updated successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Vault not found',
      type: ApiErrorResponse,
    }),
  );
}

export function GetVaultPasswordDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get an ansible vault password' }),
    ApiParam({ name: 'vaultId', description: 'ID of the vault to get password for' }),
    ApiOkResponse({
      description: 'Vault password retrieved successfully',
      type: VaultPasswordResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Vault not found',
      type: ApiErrorResponse,
    }),
  );
}
