import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ClientProxy } from '@nestjs/microservices';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

interface Dependencies {
  server: McpServer;
  coreServiceClient: ClientProxy;
  logger: Logger;
}

export function registerDeviceHandlers({ server, coreServiceClient, logger }: Dependencies) {
  // List all devices at devices://
  server.resource('devices', 'devices://', async (uri) => {
    logger.debug(`MCP Resource Read: Listing all devices for URI: ${uri.href}`);
    try {
      const devices = await firstValueFrom(
        coreServiceClient.send({ cmd: 'core_find_all_devices' }, {}),
      );
      logger.debug(`Returning ${devices?.length ?? 0} devices.`);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(devices || [], null, 2),
          }, // Ensure it's an array
        ],
      };
    } catch (err) {
      logger.error('Failed to fetch devices from core service:', err);
      throw new Error('Failed to retrieve devices'); // Throw standard error
    }
  });
  logger.log('Registered MCP Resource Handler: devices (devices://)');

  // Get individual device by UUID at devices://{uuid}
  server.resource(
    'device',
    new ResourceTemplate('devices://{uuid}', { list: undefined }),
    async (uri, { uuid }) => {
      logger.debug(`MCP Resource Read: Getting device with UUID: ${uuid} for URI: ${uri.href}`);
      try {
        const device = await firstValueFrom(
          coreServiceClient.send({ cmd: 'core_find_device_by_uuid' }, { deviceUuid: uuid }),
        );

        if (!device) {
          // Use HttpException for client errors like Not Found
          throw new HttpException(`Device with UUID ${uuid} not found.`, HttpStatus.NOT_FOUND);
        }

        return {
          contents: [
            {
              uri: uri.href,
              mimeType: 'application/json',
              text: JSON.stringify(device, null, 2),
            },
          ],
        };
      } catch (err) {
        if (err instanceof HttpException) {
          throw err;
        } // Re-throw known HTTP exceptions
        logger.error(`Failed to fetch device ${uuid} from core service:`, err);
        throw new Error(`Error retrieving device with UUID ${uuid}.`); // Throw standard error
      }
    },
  );
  logger.log('Registered MCP Resource Handler: device (devices://{uuid})');
}
