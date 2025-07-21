import { DEFAULT_VAULT_ID } from '@modules/ansible-vaults';
import { IsNotEmpty, IsString, NotEquals } from 'class-validator';

export class CreateVaultDto {
  @IsString()
  @IsNotEmpty()
  @NotEquals(DEFAULT_VAULT_ID, { message: `VaultId must be different than "${DEFAULT_VAULT_ID}"` })
  vaultId!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class UpdateVaultDto {
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class VaultResponseDto {
  vaultId!: string;

  // Password will be excluded in the mapper
  createdAt?: Date;
  updatedAt?: Date;
}

export class VaultPasswordResponseDto {
  pwd!: string;
}
