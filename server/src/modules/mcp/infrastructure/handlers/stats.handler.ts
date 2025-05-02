import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ClientProxy } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

interface Dependencies {
  server: McpServer;
  coreServiceClient: ClientProxy;
  logger: Logger;
}

export function registerStatsHandlers({ server, coreServiceClient, logger }: Dependencies) {
  const getTimeseriesStatsAnnotations: ToolAnnotations = {
    title: 'Get Timeseries Stats',
    readOnlyHint: true,
    openWorldHint: false,
  };
  server.tool(
    'getTimeseriesStats',
    'Get time-based statistics for metrics',
    {
      metric: z.string().describe('The metric to query (e.g., cpu_usage)'),
      deviceId: z.string().uuid().optional().describe('Optional device UUID filter'),
      containerId: z.string().optional().describe('Optional container ID filter'),
      start: z
        .string()
        .datetime({ message: 'Invalid datetime format for start, use ISO 8601' })
        .optional()
        .describe('Optional start time (ISO 8601)'),
      end: z
        .string()
        .datetime({ message: 'Invalid datetime format for end, use ISO 8601' })
        .optional()
        .describe('Optional end time (ISO 8601)'),
      step: z.string().optional().describe('Optional query step (e.g., 1m, 1h)'),
    },
    getTimeseriesStatsAnnotations,
    async (params) => {
      try {
        const stats = await firstValueFrom(
          coreServiceClient.send({ cmd: 'core_get_timeseries_stats' }, params),
        );
        return {
          content: [
            {
              type: 'text',
              text: `System Stats:
${JSON.stringify(stats || {}, null, 2)}`,
            },
          ],
        }; // Ensure stats is an object
      } catch (err) {
        logger.error('Failed to fetch timeseries stats from core service:', err);
        throw new Error('Failed to retrieve timeseries statistics');
      }
    },
  );
  logger.log('Registered MCP Handler: getTimeseriesStats');
}
