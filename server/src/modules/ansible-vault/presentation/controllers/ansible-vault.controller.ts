import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/strategies/jwt-auth.guard';
import { AnsibleVaultService } from '../../application/services/ansible-vault.service';
import { CreateVaultDto, UpdateVaultDto, VaultPasswordResponseDto } from '../dto/ansible-vault.dto';
import { Public } from '../../../../decorators/public.decorator';

@Controller('ansible/vaults')
@UseGuards(JwtAuthGuard)
export class AnsibleVaultController {
  constructor(private readonly ansibleVaultService: AnsibleVaultService) {}

  @Get()
  async getVaults() {
    const vaults = await this.ansibleVaultService.findAll();
    return {
      success: true,
      message: 'Vaults found',
      data: vaults,
    };
  }

  @Post()
  async createVault(@Body() createVaultDto: CreateVaultDto) {
    await this.ansibleVaultService.createVault(
      createVaultDto.vaultId,
      createVaultDto.password
    );
    return {
      success: true,
      message: 'Vault created',
    };
  }

  @Delete(':vaultId')
  async deleteVault(@Param('vaultId') vaultId: string) {
    await this.ansibleVaultService.deleteVault(vaultId);
    return {
      success: true,
      message: 'Vault deleted',
    };
  }

  @Post(':vaultId')
  async updateVault(
    @Param('vaultId') vaultId: string,
    @Body() updateVaultDto: UpdateVaultDto
  ) {
    await this.ansibleVaultService.updateVault(vaultId, updateVaultDto.password);
    return;
  }

  @Public()
  @Get(':vaultId/password')
  async getVaultPassword(@Param('vaultId') vaultId: string) {
    const password = await this.ansibleVaultService.getVaultPassword(vaultId);

    const response: VaultPasswordResponseDto = {
      pwd: password,
    };

    return response;
  }
}