import { request } from '@umijs/max';

// --- Interfaces ---

// Response for getting MCP status
interface McpStatusResponse {
  enabled: boolean;
}

// Payload for updating MCP status
interface UpdateMcpStatusPayload {
  enabled: boolean;
}

// Response for getting allowed playbooks
interface AllowedPlaybooksResponse {
  allowed: string[] | 'all';
}

// Payload for updating allowed playbooks
interface UpdateAllowedPlaybooksPayload {
  allowed: string[] | 'all';
}

// Response structure for one available playbook from API
interface AvailablePlaybookFromApi {
  label: string;
  value: string; // UUID
  quickRef?: string;
}

// --- Service Functions ---

/**
 * Fetches the current MCP enabled status.
 * GET /api/settings/mcp/status
 */
export async function getMcpSetting(): Promise<McpStatusResponse> {
  // Return the data structure directly as expected by the caller component
  // The actual response likely wraps this in `data`, handle accordingly if needed.
  const response = await request<{ data: McpStatusResponse }>(
    '/api/settings/mcp/status',
    {
      method: 'GET',
    },
  );
  return response.data; // Assuming umijs/max request returns { data: ... }
}

/**
 * Updates the MCP enabled setting.
 * POST /api/settings/mcp/status
 * @param payload - The new setting value.
 */
export async function updateMcpSetting(
  payload: UpdateMcpStatusPayload,
): Promise<void> {
  // Assuming no specific response body is needed
  return request<void>('/api/settings/mcp/status', {
    method: 'POST', // Corrected to POST
    data: payload,
  });
}

/**
 * Fetches the list of allowed playbooks for MCP execution.
 * GET /api/settings/mcp/allowed-playbooks
 */
export async function getAllowedPlaybooks(): Promise<AllowedPlaybooksResponse> {
  const response = await request<{ data: AllowedPlaybooksResponse }>(
    '/api/settings/mcp/allowed-playbooks',
    {
      method: 'GET',
    },
  );
  return response.data; // Return the nested data object
}

/**
 * Updates the list of allowed playbooks for MCP execution.
 * PUT /api/settings/mcp/allowed-playbooks
 * @param payload - The new list or "all".
 */
export async function updateAllowedPlaybooks(
  payload: UpdateAllowedPlaybooksPayload,
): Promise<void> {
  // Assuming no specific response body is needed
  return request<void>('/api/settings/mcp/allowed-playbooks', {
    method: 'PUT',
    data: payload,
  });
}

/**
 * Fetches the list of all available playbooks.
 * GET /api/settings/mcp/available-playbooks
 */
export async function getAvailablePlaybooks(): Promise<
  AvailablePlaybookFromApi[]
> {
  const response = await request<{ data: AvailablePlaybookFromApi[] }>(
    '/api/settings/mcp/available-playbooks',
    {
      method: 'GET',
    },
  );
  return response.data; // Return the nested data array
}
