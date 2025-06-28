/**
 * Container Filtering and Sorting Functions
 * Pure functions for filtering, searching, and organizing containers
 */

import { Container, ContainerFilters } from './types';
import { hasExposedPorts } from './container-ports';
import { hasVolumeMounts } from './container-volumes';

/**
 * Filters containers based on the provided criteria
 */
export function filterContainers(containers: Container[], filters: ContainerFilters): Container[] {
  return containers.filter(container => {
    // Search filter - matches name, image, or ID
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesName = container.name.toLowerCase().includes(searchLower);
      const matchesImage = container.image.toLowerCase().includes(searchLower);
      const matchesId = container.id.toLowerCase().includes(searchLower);
      
      if (!matchesName && !matchesImage && !matchesId) {
        return false;
      }
    }
    
    // Status filter
    if (filters.status?.length && !filters.status.includes(container.status)) {
      return false;
    }
    
    // Show stopped filter
    if (!filters.showStopped && container.status === 'stopped') {
      return false;
    }
    
    // Exposed ports filter
    if (filters.hasExposedPorts !== undefined) {
      if (filters.hasExposedPorts !== hasExposedPorts(container)) {
        return false;
      }
    }
    
    // Volumes filter
    if (filters.hasVolumes !== undefined) {
      if (filters.hasVolumes !== hasVolumeMounts(container)) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Sorts containers by the specified criteria
 */
export function sortContainers(
  containers: Container[], 
  sortBy: 'name' | 'status' | 'created' | 'cpu' | 'memory',
  sortOrder: 'asc' | 'desc' = 'asc'
): Container[] {
  const sorted = [...containers].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'created':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'cpu':
        const aCpu = a.stats?.cpu || 0;
        const bCpu = b.stats?.cpu || 0;
        comparison = aCpu - bCpu;
        break;
      case 'memory':
        const aMemory = a.stats?.memory || 0;
        const bMemory = b.stats?.memory || 0;
        comparison = aMemory - bMemory;
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
}

/**
 * Groups containers by their status
 */
export function groupContainersByStatus(containers: Container[]): Record<string, Container[]> {
  return containers.reduce((groups, container) => {
    const status = container.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(container);
    return groups;
  }, {} as Record<string, Container[]>);
}

/**
 * Groups containers by image
 */
export function groupContainersByImage(containers: Container[]): Record<string, Container[]> {
  return containers.reduce((groups, container) => {
    const image = container.image.split(':')[0]; // Group by image name without tag
    if (!groups[image]) {
      groups[image] = [];
    }
    groups[image].push(container);
    return groups;
  }, {} as Record<string, Container[]>);
}

/**
 * Searches containers by query
 */
export function searchContainers(containers: Container[], query: string): Container[] {
  if (!query || query.trim().length === 0) {
    return containers;
  }
  
  const searchLower = query.toLowerCase();
  
  return containers.filter(container => {
    const searchableFields = [
      container.name,
      container.id,
      container.image,
      container.status,
    ];
    
    return searchableFields.some(field => 
      field?.toLowerCase().includes(searchLower)
    );
  });
}