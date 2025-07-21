import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ClientProxy } from '@nestjs/microservices';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { ContainerAction } from '../../application/dto/container-action.payload.dto';

interface Dependencies {
  server: McpServer;
  coreServiceClient: ClientProxy;
  logger: Logger;
}

export function registerContainerHandlers({ server, coreServiceClient, logger }: Dependencies) {
  const findAllContainersAnnotations: ToolAnnotations = {
    title: 'Find All Containers',
    readOnlyHint: true,
    openWorldHint: false,
  };
  server.tool(
    'findAllContainers',
    'Get a list of running containers',
    {},
    findAllContainersAnnotations,
    async () => {
      try {
        const containers = await firstValueFrom(
          coreServiceClient.send({ cmd: 'core_find_all_containers' }, {}),
        );
        return { content: [{ type: 'text', text: JSON.stringify(containers || [], null, 2) }] };
      } catch (err) {
        logger.error('Failed to fetch containers from core service:', err);
        throw new Error('Failed to retrieve containers');
      }
    },
  );
  logger.log('Registered MCP Handler: findAllContainers');

  const findContainerByIdAnnotations: ToolAnnotations = {
    title: 'Find Container by ID',
    readOnlyHint: true,
    openWorldHint: false,
  };
  server.tool(
    'findContainerById',
    'Get details for a specific container',
    { containerId: z.string().describe('ID of the container to find') },
    findContainerByIdAnnotations,
    async (params) => {
      try {
        const container = await firstValueFrom(
          coreServiceClient.send({ cmd: 'core_find_container_by_id' }, params),
        );
        if (!container) {
          throw new HttpException(
            `Container ${params.containerId} not found.`,
            HttpStatus.NOT_FOUND,
          );
        }
        return { content: [{ type: 'text', text: JSON.stringify(container, null, 2) }] };
      } catch (err) {
        if (err instanceof HttpException) {
          throw err;
        }
        logger.error(`Failed to fetch container ${params.containerId} from core service:`, err);
        throw new Error(`Error retrieving container ${params.containerId}.`);
      }
    },
  );
  logger.log('Registered MCP Handler: findContainerById');

  const containerActionAnnotations: ToolAnnotations = {
    title: 'Container Action',
    readOnlyHint: false,
    openWorldHint: false,
  };
  server.tool(
    'containerAction',
    'Perform an action (start/stop/restart/pause/kill) on a container',
    {
      containerId: z.string().describe('ID of the container to perform action on'),
      action: z
        .enum([
          ContainerAction.START,
          ContainerAction.STOP,
          ContainerAction.RESTART,
          ContainerAction.PAUSE,
          ContainerAction.KILL,
        ])
        .describe('Action to perform on the container'),
    },
    containerActionAnnotations,
    async (params) => {
      try {
        await firstValueFrom(coreServiceClient.send({ cmd: 'core_container_action' }, params));
        return {
          content: [
            {
              type: 'text',
              text: `Successfully performed ${params.action} action on container ${params.containerId}`,
            },
          ],
        };
      } catch (err) {
        logger.error(
          `Failed to perform ${params.action} action on container ${params.containerId}:`,
          err,
        );
        throw new Error(
          `Failed to perform ${params.action} action on container ${params.containerId}`,
        );
      }
    },
  );
  logger.log('Registered MCP Handler: containerAction');
}
