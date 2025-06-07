import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ClientProxy } from '@nestjs/microservices';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { Cache } from 'cache-manager';
import { UsersService } from '@modules/users/application/services/users.service';
import { MCP_ALLOWED_PLAYBOOKS_CACHE_KEY } from '../../application/constants/mcp.constants';

interface Dependencies {
  server: McpServer;
  coreServiceClient: ClientProxy;
  cacheManager: Cache;
  usersService: UsersService;
  logger: Logger;
}

export function registerPlaybookHandlers({
  server,
  coreServiceClient,
  cacheManager,
  usersService,
  logger,
}: Dependencies) {
  // Get Playbook Status Tool
  const getPlaybookStatusAnnotations: ToolAnnotations = {
    title: 'Get Playbook Execution Status',
    readOnlyHint: true,
    openWorldHint: false,
  };
  server.tool(
    'getPlaybookExecutionStatus',
    'Check the status of a playbook execution job',
    { execId: z.string().describe('ID of the playbook execution job') },
    getPlaybookStatusAnnotations,
    async (params) => {
      try {
        const status = await firstValueFrom(
          coreServiceClient.send({ cmd: 'core_get_playbook_status' }, params),
        );
        if (!status) {
          throw new HttpException(
            `Playbook execution ${params.execId} not found.`,
            HttpStatus.NOT_FOUND,
          );
        }
        return { content: [{ type: 'text', text: JSON.stringify(status, null, 2) }] };
      } catch (err) {
        if (err instanceof HttpException) {
          throw err;
        }
        logger.error(`Failed to fetch playbook status for ${params.execId}:`, err);
        throw new Error(`Failed to retrieve status for playbook execution ${params.execId}.`);
      }
    },
  );
  logger.log('Registered MCP Handler: getPlaybookExecutionStatus');

  // Execute Playbook Tool (with Permissions Check)
  const executePlaybookAnnotations: ToolAnnotations = {
    title: 'Execute Playbook',
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: true,
  };
  server.tool(
    'executePlaybook',
    'Run an Ansible playbook on target devices (subject to allowed playbooks setting)',
    {
      playbookUuid: z
        .string()
        .uuid()
        .optional()
        .describe('UUID of the playbook (required if quickRef not provided)'),
      playbookQuickRef: z
        .string()
        .optional()
        .describe('Quick reference of the playbook (required if UUID not provided)'),
      target: z.array(z.string().uuid()).optional().describe('Target device UUIDs for execution'),
      // Add other playbook execution params as needed (e.g., extra vars)
    },
    executePlaybookAnnotations,
    async (params) => {
      logger.log(`Received executePlaybook request: ${JSON.stringify(params)}`);

      // --- Playbook Permission Check ---
      const allowedPlaybooksSetting = await cacheManager.get<string[] | 'all'>(
        MCP_ALLOWED_PLAYBOOKS_CACHE_KEY,
      );
      logger.debug(
        `Current mcp.allowed_playbooks setting: ${JSON.stringify(allowedPlaybooksSetting)}`,
      );

      const requestedPlaybookIdentifier = params.playbookUuid ?? params.playbookQuickRef;

      if (!requestedPlaybookIdentifier) {
        // Use HttpException for bad client input
        throw new HttpException(
          'Either playbookUuid or playbookQuickRef must be provided.',
          HttpStatus.BAD_REQUEST,
        );
      }

      let isAllowed = false;
      if (allowedPlaybooksSetting === 'all') {
        isAllowed = true;
        logger.log(`Playbook execution allowed: 'all' setting enabled.`);
      } else if (Array.isArray(allowedPlaybooksSetting)) {
        // A more robust solution would fetch playbook details to check both identifiers.
        if (allowedPlaybooksSetting.includes(requestedPlaybookIdentifier)) {
          isAllowed = true;
          logger.log(
            `Playbook execution allowed: ${requestedPlaybookIdentifier} is in the allowed list.`,
          );
        }
      }

      if (!isAllowed) {
        logger.warn(
          `Playbook execution denied: ${requestedPlaybookIdentifier} is not in the allowed list (${JSON.stringify(
            allowedPlaybooksSetting,
          )}).`,
        );
        // Use HttpException for permissions failure
        throw new HttpException(
          `Execution of playbook '${requestedPlaybookIdentifier}' is not permitted by current settings.`,
          HttpStatus.FORBIDDEN,
        );
      }
      // --- End Permission Check ---

      // Proceed with execution if allowed
      const user = await usersService.getFirstUser(); // Or get user from request context if available
      if (!user) {
        // Use HttpException for internal server issues
        throw new HttpException(
          'Could not identify user for playbook execution.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      try {
        const result = await firstValueFrom(
          coreServiceClient.send({ cmd: 'core_execute_playbook' }, { ...params, user: user }), // Pass user object
        );

        logger.log(`Playbook execution initiated. Result from core: ${JSON.stringify(result)}`);
        // Assuming result contains the execution ID
        const execId = result?.execId ?? result; // Adapt based on actual core response
        if (!execId) {
          throw new Error('Failed to get execution ID from core service response.'); // Internal error
        }

        return { content: [{ type: 'text', text: JSON.stringify({ execId: execId }) }] };
      } catch (err) {
        if (err instanceof HttpException) {
          throw err;
        } // Re-throw known HTTP exceptions from above checks
        logger.error(
          `Core service error during playbook execution for ${requestedPlaybookIdentifier}:`,
          err,
        );
        // Use HttpException for errors communicating with other services if appropriate
        throw new HttpException(
          `Failed to initiate playbook execution for '${requestedPlaybookIdentifier}'. Check core service logs.`,
          HttpStatus.FAILED_DEPENDENCY,
        );
      }
    },
  );
  logger.log('Registered MCP Handler: executePlaybook');
}
