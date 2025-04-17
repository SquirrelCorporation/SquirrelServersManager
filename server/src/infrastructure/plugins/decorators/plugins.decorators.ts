import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export const PLUGINS_TAG = 'Plugins';

export function GetPluginsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all plugins',
      description: 'Retrieves a list of all installed plugins and their manifests',
    }),
    ApiOkResponse({
      description: 'List of plugin manifests retrieved successfully',
      schema: {
        type: 'array',
        items: { $ref: 'PluginManifest' },
      },
    }),
  );
}
