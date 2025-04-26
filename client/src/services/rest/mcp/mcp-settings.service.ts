import { request } from '@umijs/max';

// Define the expected response structure for getting the setting
interface McpSettingResponse {
  data: {
    enabled: boolean;
  };
}

// Define the payload structure for updating the setting
interface UpdateMcpSettingPayload {
  enabled: boolean;
}

/**
 * Fetches the current MCP enabled setting.
 * GET /api/settings/mcp
 */
export async function getMcpSetting(): Promise<McpSettingResponse> {
  return request<McpSettingResponse>('/api/settings/mcp', {
    method: 'GET',
  });
}

/**
 * Updates the MCP enabled setting.
 * PUT /api/settings/mcp
 * @param payload - The new setting value.
 */
export async function updateMcpSetting(
  payload: UpdateMcpSettingPayload,
): Promise<void> {
  return request<void>('/api/settings/mcp', {
    method: 'PUT',
    data: payload,
  });
}
