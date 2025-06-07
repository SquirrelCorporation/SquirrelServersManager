import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllowedPlaybooksDto, McpSettingDto } from '../dtos/mcp-settings.dto';

export const MCP_SETTINGS_TAG = 'Settings - MCP';

// Decorator for the Controller Class
export const McpSettingsControllerDocs = () =>
  applyDecorators(
    ApiTags(MCP_SETTINGS_TAG),
    ApiBearerAuth(), // Apply BearerAuth to the whole controller via Swagger
    // Add any other controller-level decorators here
  );

// Decorators for GET /status
export const GetMcpStatusDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get MCP Enabled Setting' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'MCP setting retrieved successfully.',
      type: McpSettingDto,
    }),
    // Add specific error responses if needed
  );

// Decorators for PUT /status
export const UpdateMcpStatusDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update MCP Enabled Setting (requires server restart)' }),
  );

// Decorators for GET /allowed-playbooks
export const GetAllowedPlaybooksDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get the list of allowed playbooks for MCP execution' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns the current setting.',
      type: AllowedPlaybooksDto,
    }),
  );

// Decorators for PUT /allowed-playbooks
export const UpdateAllowedPlaybooksDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update the list of allowed playbooks for MCP execution' }),
  );

// Note: Detailed ApiResponse decorators (especially for complex types like AllowedPlaybooksDto
// and error statuses like 400, 401, 403, 500) can be added here for more thorough documentation.
// For simplicity, I've focused on ApiOperation for now.
