import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  Optional,
  Post,
  Put,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientProxy } from '@nestjs/microservices';
import { RestartServerEvent } from '../../../../core/events/restart-server.event';
import Events from '../../../../core/events/events';
import { ACTIONS, RESOURCES, ResourceAction } from '../../../../infrastructure/security';
import {
  AllowedPlaybooksDto,
  McpSettingDto,
  UpdateAllowedPlaybooksDto,
  UpdateMcpSettingDto,
} from '../dtos/mcp-settings.dto';
import {
  GetAllowedPlaybooksDocs,
  GetMcpStatusDocs,
  McpSettingsControllerDocs,
  UpdateAllowedPlaybooksDocs,
  UpdateMcpStatusDocs,
} from '../decorators/mcp-settings.decorators';
import {
  MCP_ALLOWED_PLAYBOOKS_CACHE_KEY,
  MCP_ENABLED_CACHE_KEY,
} from '../../application/constants/mcp.constants';

@McpSettingsControllerDocs()
@Controller('settings/mcp')
@ResourceAction(RESOURCES.SETTING, ACTIONS.READ) // Apply read permission to the whole controller by default
export class McpSettingsController {
  private readonly logger = new Logger(McpSettingsController.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private eventEmitter: EventEmitter2,
    @Optional() @Inject('CORE_SERVICE_CLIENT') private readonly coreServiceClient: ClientProxy,
  ) {}

  // --- MCP Enabled Status ---
  @Get('status')
  @GetMcpStatusDocs()
  async getMcpStatus(): Promise<McpSettingDto> {
    const enabled = await this.cacheManager.get<boolean>(MCP_ENABLED_CACHE_KEY);
    this.logger.log(`MCP enabled status requested: ${enabled}`);
    return { enabled: !!enabled };
  }

  @Post('status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UpdateMcpStatusDocs()
  @ResourceAction(RESOURCES.SETTING, ACTIONS.UPDATE)
  async updateMcpStatus(@Body() updateMcpSettingDto: UpdateMcpSettingDto): Promise<void> {
    this.logger.log(`Updating MCP enabled setting to: ${updateMcpSettingDto.enabled}`);
    await this.cacheManager.set(MCP_ENABLED_CACHE_KEY, updateMcpSettingDto.enabled);
    this.logger.log('Emitting server restart request event...');
    this.eventEmitter.emit(Events.SERVER_RESTART_REQUEST, new RestartServerEvent());
    this.logger.log('Server restart request event emitted.');
  }

  // --- Allowed Playbooks ---
  @Get('allowed-playbooks')
  @GetAllowedPlaybooksDocs()
  async getAllowedPlaybooks(): Promise<AllowedPlaybooksDto> {
    try {
      const allowed = await this.cacheManager.get<string[] | 'all'>(
        MCP_ALLOWED_PLAYBOOKS_CACHE_KEY,
      );
      this.logger.log(`Allowed playbooks requested: ${JSON.stringify(allowed)}`);
      return { allowed: allowed ?? [] };
    } catch (error) {
      this.logger.error(error, 'Failed to get allowed playbooks setting:');
      throw new HttpException(
        'Failed to retrieve allowed playbooks setting',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('allowed-playbooks')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UpdateAllowedPlaybooksDocs()
  @ResourceAction(RESOURCES.SETTING, ACTIONS.UPDATE)
  async updateAllowedPlaybooks(
    @Body() updateAllowedPlaybooksDto: UpdateAllowedPlaybooksDto,
  ): Promise<void> {
    const allowedValue = updateAllowedPlaybooksDto.allowed;

    try {
      await this.cacheManager.set(MCP_ALLOWED_PLAYBOOKS_CACHE_KEY, allowedValue);
      this.logger.log(`Updated mcp.allowed_playbooks setting to: ${JSON.stringify(allowedValue)}`);
    } catch (error) {
      this.logger.error('Failed to update allowed playbooks setting:', error);
      throw new HttpException(
        'Failed to update allowed playbooks setting',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
