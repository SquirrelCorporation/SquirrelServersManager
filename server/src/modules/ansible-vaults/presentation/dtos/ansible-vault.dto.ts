import { IsNotEmpty, IsString, NotEquals } from 'class-validator';
import { DEFAULT_VAULT_ID } from '../../application/services/vault-crypto.service';

/**
 * DTO for creating a vault
 */
export class CreateVaultDto {
  @IsString()
  @IsNotEmpty()
  @NotEquals(DEFAULT_VAULT_ID, { message: `VaultId must be different than "${DEFAULT_VAULT_ID}"` })
  vaultId!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

/**
 * DTO for updating a vault
 */
export class UpdateVaultDto {
  @IsString()
  @IsNotEmpty()
  password!: string;
}

/**
 * DTO for vault response
 */
export class GetVaultResponseDto {
  vaultId!: string;

  // Password will be excluded in the mapper
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * DTO for vault password response
 */
export class GetVaultPasswordResponseDto {
  pwd!: string;
}

// For backward compatibility
export type VaultResponseDto = GetVaultResponseDto;
export type VaultPasswordResponseDto = GetVaultPasswordResponseDto;