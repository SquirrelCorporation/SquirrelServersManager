import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Cache } from '@nestjs/cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IsBoolean } from 'class-validator';
import { Logger } from '@nestjs/common';
import { RestartServerEvent } from 'src/core/events/restart-server.event';
import Events from '../../../../core/events/events';
import { ACTIONS, RESOURCES, ResourceAction } from '../../../../infrastructure/security';

class UpdateMcpSettingDto {
  @IsBoolean()
  enabled!: boolean;
}

class McpSettingDto {
  @IsBoolean()
  enabled!: boolean;
}

@ApiTags('Settings - MCP')
@Controller('settings/mcp')
@ResourceAction(RESOURCES.SETTING, ACTIONS.READ) // Apply read permission to the whole controller
export class McpSettingsController {
  private readonly logger = new Logger(McpSettingsController.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private eventEmitter: EventEmitter2,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get MCP Enabled Setting' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'MCP setting retrieved successfully.',
    type: McpSettingDto,
  })
  async getMcpSetting(): Promise<McpSettingDto> {
    const enabled = await this.cacheManager.get<boolean>('mcp.enabled');
    return { enabled: !!enabled }; // Return true/false, default false if null/undefined
  }

  @Put()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update MCP Enabled Setting' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'MCP setting updated successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid payload.' })
  @ResourceAction(RESOURCES.SETTING, ACTIONS.UPDATE) // Override with update permission for PUT
  async updateMcpSetting(@Body() updateMcpSettingDto: UpdateMcpSettingDto): Promise<void> {
    this.logger.log(`Updating MCP enabled setting to: ${updateMcpSettingDto.enabled}`);
    await this.cacheManager.set('mcp.enabled', updateMcpSettingDto.enabled);
    this.logger.log('Emitting server restart request event...');
    this.eventEmitter.emit(Events.SERVER_RESTART_REQUEST, new RestartServerEvent());
    this.logger.log('Server restart request event emitted.');
  }
}
