import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnsibleVaultService } from '../../application/services/ansible-vault.service';
import { CreateVaultDto, UpdateVaultDto, VaultPasswordResponseDto } from '../dto/ansible-vault.dto';
import { Public } from '../../../../decorators/public.decorator';
import {
  CreateVaultDoc,
  DeleteVaultDoc,
  GetVaultPasswordDoc,
  GetVaultsDoc,
  UpdateVaultDoc,
} from '../decorators/ansible-vaults.decorators';
import { ANSIBLE_VAULTS_TAG } from '../decorators/ansible-vaults.decorators';

@ApiTags(ANSIBLE_VAULTS_TAG)
@Controller('ansible-vaults')
export class AnsibleVaultsController {
  constructor(private readonly ansibleVaultService: AnsibleVaultService) {}

  @Get()
  @GetVaultsDoc()
  async getVaults() {
    const vaults = await this.ansibleVaultService.findAll();
    return vaults;
  }

  @Post()
  @CreateVaultDoc()
  async createVault(@Body() createVaultDto: CreateVaultDto) {
    await this.ansibleVaultService.createVault(createVaultDto.vaultId, createVaultDto.password);
    return;
  }

  @Delete(':vaultId')
  @DeleteVaultDoc()
  async deleteVault(@Param('vaultId') vaultId: string) {
    await this.ansibleVaultService.deleteVault(vaultId);
    return;
  }

  @Post(':vaultId')
  @UpdateVaultDoc()
  async updateVault(@Param('vaultId') vaultId: string, @Body() updateVaultDto: UpdateVaultDto) {
    await this.ansibleVaultService.updateVault(vaultId, updateVaultDto.password);
    return;
  }

  @Public()
  @Get(':vaultId/password')
  @GetVaultPasswordDoc()
  async getVaultPassword(@Param('vaultId') vaultId: string) {
    const password = await this.ansibleVaultService.getVaultPassword(vaultId);

    const response: VaultPasswordResponseDto = {
      pwd: password,
    };

    return response;
  }
}
