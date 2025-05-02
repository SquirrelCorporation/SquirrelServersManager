import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import { Logger } from '@nestjs/common';
import { z } from 'zod';

export function registerEchoHandler(server: McpServer, logger: Logger) {
  const echoAnnotations: ToolAnnotations = {
    title: 'Echo Message',
    readOnlyHint: true,
    openWorldHint: false,
  };
  server.tool(
    'echo',
    'Echo back the provided message',
    { message: z.string().describe('Message to echo back') },
    echoAnnotations,
    async (params) => {
      logger.debug(`Executing echo tool with message: "${params.message}"`);
      return { content: [{ type: 'text', text: params.message }] };
    },
  );
  logger.log('Registered MCP Handler: echo');
}
