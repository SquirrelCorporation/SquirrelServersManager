import { JwtAuthGuard } from '@modules/auth/strategies/jwt-auth.guard';
import { IPlaybook, PlaybookRepository, PlaybookService } from '@modules/playbooks';
import { PlaybookFileService } from '@modules/shell';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { Playbooks } from 'src/types/typings';
import { API, SsmAnsible } from 'ssm-shared-lib';


@Controller('playbooks')
@UseGuards(JwtAuthGuard)
export class PlaybookController {
  constructor(
    private readonly playbookService: PlaybookService,
    private readonly playbookRepository: PlaybookRepository,
    private readonly playbookFileService: PlaybookFileService,
  ) {}

  @Get()
  async getPlaybooks() {
    return this.playbookRepository.findAllWithActiveRepositories();
  }

  @Get(':uuid')
  async getPlaybook(@Param('uuid') uuid: string) {
     const playbook = await this.playbookRepository.findOneByUuid(uuid);
    if (!playbook) {
      throw new Error('Playbook not found');
    }

    return this.playbookFileService.readPlaybook(playbook.path)
  }

  @Patch(':uuid')
  async editPlaybook(@Param('uuid') uuid: string, @Body() updateData: { content: string }) {
    const playbook = await this.playbookRepository.findOneByUuid(uuid);
    if (!playbook) {
      throw new Error('Playbook not found');
    }

    return this.playbookFileService.editPlaybook(playbook.path, updateData.content)
  }

  @Delete(':uuid')
  async deletePlaybook(@Param('uuid') uuid: string) {
    await this.playbookRepository.deleteByUuid(uuid);
    return { success: true };
  }

  @Post(':uuid/extravars')
  async addExtraVarToPlaybook(@Param('uuid') uuid: string, @Body() extraVar: API.ExtraVar) {
    const playbook = await this.playbookRepository.findOneByUuid(uuid);
    if (!playbook) {
      throw new Error('Playbook not found');
    }

    await this.playbookService.addExtraVarToPlaybook(playbook, extraVar);
    return { success: true };
  }

  @Delete(':uuid/extravars/:varname')
  async deleteExtraVarFromPlaybook(@Param('uuid') uuid: string, @Param('varname') varname: string) {
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
    @Body()
    execData: { target?: string[]; extraVars?: API.ExtraVars; mode?: SsmAnsible.ExecutionMode },
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
    return { execId: result };
  }

  @Post('exec/quick-ref/:quickRef')
  async execPlaybookByQuickRef(
    @Param('quickRef') quickRef: string,
    @Body()
    execData: { target?: string[]; extraVars?: API.ExtraVars; mode?: SsmAnsible.ExecutionMode },
    @User() user: any,
  ) {
    const playbook = await this.playbookRepository.findOneByUniqueQuickReference(quickRef);
    if (!playbook) {
      throw new Error('Playbook not found');
    }

    const result =  await this.playbookService.executePlaybook(
      playbook,
      user,
      execData.target,
      execData.extraVars,
      execData.mode || SsmAnsible.ExecutionMode.APPLY,
    );
    return { execId: result };
  }

  @Post('exec/inventory/:uuid')
  async execPlaybookOnInventory(
    @Param('uuid') uuid: string,
    @Body()
    execData: {
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

    return await this.playbookService.executePlaybookOnInventory(
      playbook,
      user,
      execData.inventoryTargets,
      execData.extraVars,
      execData.execUuid,
    );
  }

  @Get('exec/:uuid/logs')
  async getExecLogs(@Param('uuid') uuid: string) {
    const execLogs = await this.playbookService.getExecLogs(uuid);
    return {
      execId: uuid,
      execLogs: execLogs,
    }
  }

  @Get('exec/:uuid/status')
  async getExecStatus(@Param('uuid') uuid: string) {
    const taskStatuses = await this.playbookService.getExecStatus(uuid);
    return {
    execId: uuid,
    execStatuses: taskStatuses,
  }
  }
}
