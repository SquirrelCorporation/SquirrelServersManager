/**
 * Simplified Query Keys Factory
 * Provides a clean, maintainable approach to query key management
 */

// ============================================================================
// CORE QUERY KEY BUILDER
// ============================================================================

/**
 * Generic query key builder that follows consistent patterns
 */
class QueryKeyBuilder {
  constructor(private baseKey: readonly string[]) {}

  /**
   * Get the base key (e.g., ['devices'])
   */
  get all() {
    return this.baseKey;
  }

  /**
   * Create a list key with optional filters
   */
  list(filters?: Record<string, any>) {
    return filters && Object.keys(filters).length > 0
      ? [...this.baseKey, 'list', filters] as const
      : [...this.baseKey, 'list'] as const;
  }

  /**
   * Create a detail key for a specific item
   */
  detail(id: string) {
    return [...this.baseKey, 'detail', id] as const;
  }

  /**
   * Create a nested key under detail
   */
  detailNested(id: string, nested: string, params?: Record<string, any>) {
    const baseKey = [...this.baseKey, 'detail', id, nested];
    return params && Object.keys(params).length > 0
      ? [...baseKey, params] as const
      : baseKey as const;
  }

  /**
   * Create an arbitrary nested key
   */
  nested(path: string[], params?: Record<string, any>) {
    const baseKey = [...this.baseKey, ...path];
    return params && Object.keys(params).length > 0
      ? [...baseKey, params] as const
      : baseKey as const;
  }

  /**
   * Create a stats key
   */
  stats(id?: string, filters?: Record<string, any>) {
    const baseKey = id 
      ? [...this.baseKey, 'detail', id, 'stats']
      : [...this.baseKey, 'stats'];
    
    return filters && Object.keys(filters).length > 0
      ? [...baseKey, filters] as const
      : baseKey as const;
  }
}

// ============================================================================
// QUERY KEY FACTORIES
// ============================================================================

/**
 * Create a query key builder for a domain
 */
function createQueryKeyBuilder(domain: string) {
  return new QueryKeyBuilder([domain] as const);
}

// ============================================================================
// DOMAIN-SPECIFIC QUERY KEYS
// ============================================================================

export const queryKeys = {
  // Core domains
  devices: createQueryKeyBuilder('devices'),
  containers: createQueryKeyBuilder('containers'),
  images: createQueryKeyBuilder('images'),
  volumes: createQueryKeyBuilder('volumes'),
  networks: createQueryKeyBuilder('networks'),
  playbooks: createQueryKeyBuilder('playbooks'),
  automations: createQueryKeyBuilder('automations'),
  
  // Admin domains
  admin: {
    logs: createQueryKeyBuilder('admin-logs'),
    settings: createQueryKeyBuilder('admin-settings'),
    inventory: createQueryKeyBuilder('admin-inventory'),
  },
  
  // Dashboard domain
  dashboard: createQueryKeyBuilder('dashboard'),
  
  // User domain
  users: createQueryKeyBuilder('users'),
  
  // Statistics domain
  statistics: createQueryKeyBuilder('statistics'),
} as const;

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Common query key patterns as convenience functions
 */
export const QueryKeyPatterns = {
  /**
   * Container-related keys with device context
   */
  containersForDevice: (deviceUuid: string, filters?: Record<string, any>) =>
    queryKeys.containers.list({ deviceUuid, ...filters }),

  containerDetail: (containerId: string) =>
    queryKeys.containers.detail(containerId),

  containerLogs: (containerId: string, filters?: Record<string, any>) =>
    queryKeys.containers.detailNested(containerId, 'logs', filters),

  containerStats: (containerId: string, timeRange?: string) =>
    queryKeys.containers.detailNested(containerId, 'stats', timeRange ? { timeRange } : undefined),

  /**
   * Image-related keys with device context
   */
  imagesForDevice: (deviceUuid: string, filters?: Record<string, any>) =>
    queryKeys.images.list({ deviceUuid, ...filters }),

  imageDetail: (imageId: string) =>
    queryKeys.images.detail(imageId),

  /**
   * Volume-related keys with device context
   */
  volumesForDevice: (deviceUuid: string, filters?: Record<string, any>) =>
    queryKeys.volumes.list({ deviceUuid, ...filters }),

  volumeDetail: (volumeId: string) =>
    queryKeys.volumes.detail(volumeId),

  /**
   * Network-related keys with device context
   */
  networksForDevice: (deviceUuid: string, filters?: Record<string, any>) =>
    queryKeys.networks.list({ deviceUuid, ...filters }),

  networkDetail: (networkId: string) =>
    queryKeys.networks.detail(networkId),

  /**
   * Dashboard keys
   */
  dashboardStats: (timeRange?: string) =>
    queryKeys.dashboard.stats(undefined, timeRange ? { timeRange } : undefined),

  dashboardPerformance: (timeRange?: string) =>
    queryKeys.dashboard.nested(['performance'], timeRange ? { timeRange } : undefined),

  /**
   * Device-related keys
   */
  deviceDetail: (deviceUuid: string) =>
    queryKeys.devices.detail(deviceUuid),

  deviceStats: (deviceUuid: string, timeRange?: string) =>
    queryKeys.devices.stats(deviceUuid, timeRange ? { timeRange } : undefined),

  /**
   * Playbook-related keys
   */
  playbooksForDevice: (deviceUuid: string, filters?: Record<string, any>) =>
    queryKeys.playbooks.list({ deviceUuid, ...filters }),

  playbookDetail: (playbookId: string) =>
    queryKeys.playbooks.detail(playbookId),

  playbookExecutions: (playbookId: string, filters?: Record<string, any>) =>
    queryKeys.playbooks.detailNested(playbookId, 'executions', filters),

  /**
   * Automation-related keys
   */
  automationDetail: (automationUuid: string) =>
    queryKeys.automations.detail(automationUuid),

  automationExecutions: (automationUuid: string, filters?: Record<string, any>) =>
    queryKeys.automations.detailNested(automationUuid, 'executions', filters),

  automationLogs: (automationUuid: string, executionId?: string) =>
    executionId 
      ? queryKeys.automations.detailNested(automationUuid, 'logs', { executionId })
      : queryKeys.automations.detailNested(automationUuid, 'logs'),

  automationTemplates: () =>
    queryKeys.automations.nested(['templates']),

  automationTemplate: (templateId: number) =>
    queryKeys.automations.nested(['templates', String(templateId)]),
} as const;

// ============================================================================
// QUERY KEY UTILITIES
// ============================================================================

/**
 * Utilities for working with query keys
 */
export const QueryKeyUtils = {
  /**
   * Check if a query key matches a pattern
   */
  matches: (queryKey: readonly unknown[], pattern: readonly unknown[]): boolean => {
    if (pattern.length > queryKey.length) return false;
    
    return pattern.every((segment, index) => {
      const keySegment = queryKey[index];
      
      // Handle object matching (for filters/params)
      if (typeof segment === 'object' && typeof keySegment === 'object') {
        return JSON.stringify(segment) === JSON.stringify(keySegment);
      }
      
      return segment === keySegment;
    });
  },

  /**
   * Extract device UUID from query key if present
   */
  extractDeviceUuid: (queryKey: readonly unknown[]): string | null => {
    for (const segment of queryKey) {
      if (typeof segment === 'object' && segment !== null) {
        const obj = segment as Record<string, unknown>;
        if ('deviceUuid' in obj && typeof obj.deviceUuid === 'string') {
          return obj.deviceUuid;
        }
      }
    }
    return null;
  },

  /**
   * Get all query keys for a specific device
   */
  getDeviceQueryKeys: (deviceUuid: string) => [
    ...QueryKeyPatterns.containersForDevice(deviceUuid),
    ...QueryKeyPatterns.imagesForDevice(deviceUuid),
    ...QueryKeyPatterns.volumesForDevice(deviceUuid),
    ...QueryKeyPatterns.networksForDevice(deviceUuid),
    ...QueryKeyPatterns.playbooksForDevice(deviceUuid),
    ...QueryKeyPatterns.deviceDetail(deviceUuid),
    ...QueryKeyPatterns.deviceStats(deviceUuid),
  ],

  /**
   * Create invalidation pattern for all device-related data
   */
  createDeviceInvalidationPattern: (deviceUuid: string) => ({
    predicate: (query: any) => {
      const extractedUuid = QueryKeyUtils.extractDeviceUuid(query.queryKey);
      return extractedUuid === deviceUuid;
    },
  }),

  /**
   * Create invalidation pattern for a specific domain
   */
  createDomainInvalidationPattern: (domain: string) => ({
    queryKey: [domain],
  }),

  /**
   * Serialize query key for debugging
   */
  serialize: (queryKey: readonly unknown[]): string => {
    return queryKey.map(segment => {
      if (typeof segment === 'object') {
        return JSON.stringify(segment);
      }
      return String(segment);
    }).join(' → ');
  },
} as const;

// ============================================================================
// TYPE HELPERS
// ============================================================================

/**
 * Type helper for query key inference
 */
export type QueryKey<T extends (...args: any[]) => readonly unknown[]> = ReturnType<T>;

/**
 * Extract the return type of query key functions
 */
export type ExtractQueryKey<T> = T extends (...args: any[]) => infer R ? R : never;

// ============================================================================
// DEVELOPMENT UTILITIES
// ============================================================================

if (process.env.NODE_ENV === 'development') {
  // Global access for debugging
  (window as any).queryKeys = queryKeys;
  (window as any).QueryKeyPatterns = QueryKeyPatterns;
  (window as any).QueryKeyUtils = QueryKeyUtils;
  
  // Debug helper
  (window as any).debugQueryKey = (queryKey: readonly unknown[]) => {
    console.log('Query Key Debug:', {
      serialized: QueryKeyUtils.serialize(queryKey),
      deviceUuid: QueryKeyUtils.extractDeviceUuid(queryKey),
      structure: queryKey,
    });
  };
}