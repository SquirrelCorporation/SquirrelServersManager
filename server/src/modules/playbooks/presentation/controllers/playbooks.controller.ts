import { PlaybookRepository, PlaybookService } from '@modules/playbooks';
import { PlaybookFileService } from '@modules/shell';
import { Body, Controller, Delete, Get, Logger, Param, Patch, Post } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { SsmAnsible } from 'ssm-shared-lib';
import { ApiTags } from '@nestjs/swagger';
import {
  AddExtraVarDto,
  EditPlaybookDto,
  ExecutePlaybookDto,
  ExecutePlaybookOnInventoryDto,
  PlaybookActionResponseDto,
  PlaybookExecutionResponseDto,
  PlaybookLogsResponseDto,
  PlaybookStatusResponseDto,
} from '../dtos/playbook-operations.dto';
import { UserDto } from '../../../users/presentation/dtos/user.dto';
import { IUser, Role } from '../../../users/domain/entities/user.entity';
import {
  AddExtraVarToPlaybookDoc,
  DeleteExtraVarFromPlaybookDoc,
  DeletePlaybookDoc,
  EditPlaybookDoc,
  ExecPlaybookByQuickRefDoc,
  ExecPlaybookDoc,
  ExecPlaybookOnInventoryDoc,
  GetExecLogsDoc,
  GetExecStatusDoc,
  GetPlaybookDoc,
  GetPlaybooksDoc,
  PLAYBOOKS_TAG,
} from '../decorators/playbook.decorators';

@ApiTags(PLAYBOOKS_TAG)
@Controller('playbooks')
export class PlaybooksController {
  private readonly logger = new Logger(PlaybooksController.name);

  constructor(
    private readonly playbookService: PlaybookService,
    private readonly playbookRepository: PlaybookRepository,
    private readonly playbookFileService: PlaybookFileService,
  ) {}

  private mapUserDtoToUser(userDto: UserDto): IUser {
    return {
      _id: userDto.id,
      email: userDto.email,
      role: userDto.role as Role,
      name: userDto.email, // Using email as name since UserDto doesn't have name
      avatar: '', // Default empty avatar
      password: '', // Password not available in UserDto
    };
  }

  @GetPlaybooksDoc()
  @Get()
  async getPlaybooks() {
    return this.playbookRepository.findAllWithActiveRepositories();
  }

  @GetPlaybookDoc()
  @Get(':uuid')
  async getPlaybook(@Param('uuid') uuid: string) {
    const playbook = await this.playbookRepository.findOneByUuid(uuid);
    if (!playbook) {
      throw new Error('Playbook not found');
    }

    return this.playbookFileService.readPlaybook(playbook.path);
  }

  @EditPlaybookDoc()
  @Patch(':uuid')
  async editPlaybook(@Param('uuid') uuid: string, @Body() editDto: EditPlaybookDto) {
    const playbook = await this.playbookRepository.findOneByUuid(uuid);
    if (!playbook) {
      throw new Error('Playbook not found');
    }

    return this.playbookFileService.editPlaybook(playbook.path, editDto.content);
  }

  @DeletePlaybookDoc()
  @Delete(':uuid')
  async deletePlaybook(@Param('uuid') uuid: string): Promise<PlaybookActionResponseDto> {
    await this.playbookRepository.deleteByUuid(uuid);
    return { success: true };
  }

  @AddExtraVarToPlaybookDoc()
  @Post(':uuid/extravars')
  async addExtraVarToPlaybook(
    @Param('uuid') uuid: string,
    @Body() addExtraVarDto: AddExtraVarDto,
  ): Promise<PlaybookActionResponseDto> {
    const playbook = await this.playbookRepository.findOneByUuid(uuid);
    if (!playbook) {
      throw new Error('Playbook not found');
    }
    this.logger.log(
      `Adding extra var to playbook ${playbook.path} (extraVar: ${JSON.stringify(addExtraVarDto.extraVar)})`,
    );
    await this.playbookService.addExtraVarToPlaybook(playbook, addExtraVarDto.extraVar);
    return { success: true };
  }

  @DeleteExtraVarFromPlaybookDoc()
  @Delete(':uuid/extravars/:varname')
  async deleteExtraVarFromPlaybook(
    @Param('uuid') uuid: string,
    @Param('varname') varname: string,
  ): Promise<PlaybookActionResponseDto> {
    const playbook = await this.playbookRepository.findOneByUuid(uuid);
    if (!playbook) {
      throw new Error('Playbook not found');
    }

    await this.playbookService.deleteExtraVarFromPlaybook(playbook, varname);
    return { success: true };
  }

  @ExecPlaybookDoc()
  @Post('exec/:uuid')
  async execPlaybook(
    @Param('uuid') uuid: string,
    @Body() execDto: ExecutePlaybookDto,
    @User() user: UserDto,
  ): Promise<PlaybookExecutionResponseDto> {
    const playbook = await this.playbookRepository.findOneByUuid(uuid);
    if (!playbook) {
      throw new Error('Playbook not found');
    }

    const result = await this.playbookService.executePlaybook(
      playbook,
      this.mapUserDtoToUser(user),
      execDto.target,
      execDto.extraVars,
      execDto.mode || SsmAnsible.ExecutionMode.APPLY,
    );
    return { execId: result };
  }

  @ExecPlaybookByQuickRefDoc()
  @Post('exec/quick-ref/:quickRef')
  async execPlaybookByQuickRef(
    @Param('quickRef') quickRef: string,
    @Body() execDto: ExecutePlaybookDto,
    @User() user: UserDto,
  ): Promise<PlaybookExecutionResponseDto> {
    const playbook = await this.playbookRepository.findOneByUniqueQuickReference(quickRef);
    if (!playbook) {
      throw new Error('Playbook not found');
    }

    const result = await this.playbookService.executePlaybook(
      playbook,
      this.mapUserDtoToUser(user),
      execDto.target,
      execDto.extraVars,
      execDto.mode || SsmAnsible.ExecutionMode.APPLY,
    );
    return { execId: result };
  }

  @ExecPlaybookOnInventoryDoc()
  @Post('exec/inventory/:uuid')
  async execPlaybookOnInventory(
    @Param('uuid') uuid: string,
    @Body() execDto: ExecutePlaybookOnInventoryDto,
    @User() user: UserDto,
  ) {
    const playbook = await this.playbookRepository.findOneByUuid(uuid);
    if (!playbook) {
      throw new Error('Playbook not found');
    }

    return await this.playbookService.executePlaybookOnInventory(
      playbook,
      this.mapUserDtoToUser(user),
      execDto.inventoryTargets,
      execDto.extraVars,
      execDto.execUuid,
    );
  }

  @GetExecLogsDoc()
  @Get('exec/:uuid/logs')
  async getExecLogs(@Param('uuid') uuid: string): Promise<PlaybookLogsResponseDto> {
    const execLogs = await this.playbookService.getExecLogs(uuid);
    return {
      execId: uuid,
      execLogs: execLogs,
    };
  }

  @GetExecStatusDoc()
  @Get('exec/:uuid/status')
  async getExecStatus(@Param('uuid') uuid: string): Promise<PlaybookStatusResponseDto> {
    const taskStatuses = await this.playbookService.getExecStatus(uuid);
    return {
      execId: uuid,
      execStatuses: taskStatuses,
    };
  }
}
