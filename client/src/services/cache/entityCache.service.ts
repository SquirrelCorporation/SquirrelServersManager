import { getAllDevices } from '@/services/rest/devices/devices';
import { getContainers as getAllContainers } from '@/services/rest/containers/containers';
import { API } from 'ssm-shared-lib';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class EntityCacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private getCacheKey(type: 'devices' | 'containers'): string {
    return `entities_${type}`;
  }

  async getDevices(): Promise<API.Device[]> {
    const cacheKey = this.getCacheKey('devices');
    const cached = this.cache.get(cacheKey);

    if (cached && !this.isExpired(cached)) {
      console.log('📦 EntityCache: Returning cached devices');
      return cached.data;
    }

    console.log('📦 EntityCache: Fetching fresh devices data');
    const response = await getAllDevices();
    const devices = response.data || [];

    this.cache.set(cacheKey, {
      data: devices,
      timestamp: Date.now(),
      ttl: this.DEFAULT_TTL,
    });

    return devices;
  }

  async getContainers(): Promise<API.Container[]> {
    const cacheKey = this.getCacheKey('containers');
    const cached = this.cache.get(cacheKey);

    if (cached && !this.isExpired(cached)) {
      console.log('📦 EntityCache: Returning cached containers');
      return cached.data;
    }

    console.log('📦 EntityCache: Fetching fresh containers data');
    const response = await getAllContainers();
    const containers = response.data || [];

    this.cache.set(cacheKey, {
      data: containers,
      timestamp: Date.now(),
      ttl: this.DEFAULT_TTL,
    });

    return containers;
  }

  async getEntityName(type: 'device' | 'container', id: string): Promise<string> {
    if (type === 'device') {
      const devices = await this.getDevices();
      const device = devices.find(d => d.uuid === id);
      return device?.fqdn || device?.ip || device?.name || id;
    } else {
      const containers = await this.getContainers();
      const container = containers.find(c => c.id === id);
      return container?.name || id;
    }
  }

  async getEntitiesByIds(type: 'device' | 'container', ids: string[]): Promise<Map<string, string>> {
    const nameMap = new Map<string, string>();
    
    if (type === 'device') {
      const devices = await this.getDevices();
      ids.forEach(id => {
        const device = devices.find(d => d.uuid === id);
        nameMap.set(id, device?.fqdn || device?.ip || device?.name || id);
      });
    } else {
      const containers = await this.getContainers();
      ids.forEach(id => {
        const container = containers.find(c => c.id === id);
        nameMap.set(id, container?.name || id);
      });
    }
    
    return nameMap;
  }

  clearCache(): void {
    this.cache.clear();
    console.log('📦 EntityCache: Cache cleared');
  }

  clearDevices(): void {
    this.cache.delete(this.getCacheKey('devices'));
    console.log('📦 EntityCache: Devices cache cleared');
  }

  clearContainers(): void {
    this.cache.delete(this.getCacheKey('containers'));
    console.log('📦 EntityCache: Containers cache cleared');
  }
}

// Export singleton instance
export const entityCacheService = new EntityCacheService();