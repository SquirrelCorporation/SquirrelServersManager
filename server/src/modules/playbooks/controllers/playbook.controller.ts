import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { API, SsmAnsible } from 'ssm-shared-lib';
import { PlaybookService } from '../services/playbook.service';
import { PlaybookRepository } from '../repositories/playbook.repository';
import { Playbook } from '../schemas/playbook.schema';
import { User } from '../../../decorators/user.decorator';
import { Playbooks } from '../../../types/typings';

@Controller('playbooks')
@UseGuards(JwtAuthGuard)
export class PlaybookController {
  constructor(
    private readonly playbookService: PlaybookService,
    private readonly playbookRepository: PlaybookRepository,
  ) {}

  @Get()
  async getPlaybooks() {
    return this.playbookRepository.findAllWithActiveRepositories();
  }

  @Get(':uuid')
  async getPlaybook(@Param('uuid') uuid: string) {
    return this.playbookRepository.findOneByUuid(uuid);
  }

  @Patch(':uuid')
  async editPlaybook(@Param('uuid') uuid: string, @Body() updateData: Partial<Playbook>) {
    const playbook = await this.playbookRepository.findOneByUuid(uuid);
    if (!playbook) {
      throw new Error('Playbook not found');
    }
    
    return this.playbookRepository.updateOrCreate({
      ...playbook,
      ...updateData,
    });
  }

  @Delete(':uuid')
  async deletePlaybook(@Param('uuid') uuid: string) {
    await this.playbookRepository.deleteByUuid(uuid);
    return { success: true };
  }

  @Post(':uuid/extravars')
  async addExtraVarToPlaybook(
    @Param('uuid') uuid: string,
    @Body() extraVar: API.ExtraVar,
  ) {
    const playbook = await this.playbookRepository.findOneByUuid(uuid);
    if (!playbook) {
      throw new Error('Playbook not found');
    }
    
    await this.playbookService.addExtraVarToPlaybook(playbook, extraVar);
    return { success: true };
  }

  @Delete(':uuid/extravars/:varname')
  async deleteExtraVarFromPlaybook(
    @Param('uuid') uuid: string,
    @Param('varname') varname: string,
  ) {
    const playbook = await this.playbookRepository.findOneByUuid(uuid);
    if (!playbook) {
      throw new Error('Playbook not found');
    }
    
    await this.playbookService.deleteExtraVarFromPlaybook(playbook, varname);
    return { success: true };
  }

  @Post('exec/:uuid')
  async execPlaybook(
    @Param('uuid') uuid: string,
    @Body() execData: { target?: string[]; extraVars?: API.ExtraVars; mode?: SsmAnsible.ExecutionMode },
    @User() user: any,
  ) {
    const playbook = await this.playbookRepository.findOneByUuid(uuid);
    if (!playbook) {
      throw new Error('Playbook not found');
    }
    
    const result = await this.playbookService.executePlaybook(
      playbook,
      user,
      execData.target,
      execData.extraVars,
      execData.mode || SsmAnsible.ExecutionMode.APPLY,
    );
    
    return result;
  }

  @Post('exec/quick-ref/:quickRef')
  async execPlaybookByQuickRef(
    @Param('quickRef') quickRef: string,
    @Body() execData: { target?: string[]; extraVars?: API.ExtraVars; mode?: SsmAnsible.ExecutionMode },
    @User() user: any,
  ) {
    const playbook = await this.playbookRepository.findOneByUniqueQuickReference(quickRef);
    if (!playbook) {
      throw new Error('Playbook not found');
    }
    
    const result = await this.playbookService.executePlaybook(
      playbook,
      user,
      execData.target,
      execData.extraVars,
      execData.mode || SsmAnsible.ExecutionMode.APPLY,
    );
    
    return result;
  }

  @Post('exec/inventory/:uuid')
  async execPlaybookOnInventory(
    @Param('uuid') uuid: string,
    @Body() execData: { 
      inventoryTargets?: Playbooks.All & Playbooks.HostGroups;
      extraVars?: API.ExtraVars;
      execUuid?: string;
    },
    @User() user: any,
  ) {
    const playbook = await this.playbookRepository.findOneByUuid(uuid);
    if (!playbook) {
      throw new Error('Playbook not found');
    }
    
    const result = await this.playbookService.executePlaybookOnInventory(
      playbook,
      user,
      execData.inventoryTargets,
      execData.extraVars,
      execData.execUuid,
    );
    
    return result;
  }
} 