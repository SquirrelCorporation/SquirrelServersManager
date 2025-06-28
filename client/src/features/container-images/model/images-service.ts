/**
 * Container Images Service - Pure Business Logic
 * Isolated, testable business rules for image operations
 */

export interface ContainerImage {
  id: string;
  repository: string;
  tag: string;
  size: number;
  created: Date;
  deviceUuid: string;
  digest?: string;
  labels?: Record<string, string>;
  architecture?: string;
  os?: string;
  inUse: boolean;
  containers?: Array<{
    id: string;
    name: string;
    status: string;
  }>;
}

export interface ImageFilters {
  search?: string;
  repository?: string;
  tag?: string;
  inUse?: boolean;
  architecture?: string;
  size?: {
    min?: number;
    max?: number;
  };
}

// ============================================================================
// BUSINESS LOGIC - PURE FUNCTIONS
// ============================================================================

/**
 * Formats image size as human-readable string
 */
export function formatImageSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Gets the full image name (repository:tag)
 */
export function getFullImageName(image: ContainerImage): string {
  return `${image.repository}:${image.tag}`;
}

/**
 * Determines if an image is safe to delete
 */
export function isSafeToDelete(image: ContainerImage): boolean {
  return !image.inUse;
}

/**
 * Gets the age of an image in days
 */
export function getImageAge(image: ContainerImage): number {
  const now = new Date();
  const created = new Date(image.created);
  const diffMs = now.getTime() - created.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Determines if an image is considered old (>30 days)
 */
export function isImageOld(image: ContainerImage): boolean {
  return getImageAge(image) > 30;
}

/**
 * Determines if an image is considered large (>1GB)
 */
export function isImageLarge(image: ContainerImage): boolean {
  return image.size > 1024 * 1024 * 1024; // 1GB in bytes
}

/**
 * Gets image security risk level based on various factors
 */
export function getImageRiskLevel(image: ContainerImage): 'low' | 'medium' | 'high' {
  let riskFactors = 0;
  
  // Age factor
  if (getImageAge(image) > 365) riskFactors += 2; // Very old
  else if (getImageAge(image) > 180) riskFactors += 1; // Old
  
  // Usage factor
  if (!image.inUse) riskFactors += 1; // Unused images are riskier
  
  // Tag factor
  if (image.tag === 'latest') riskFactors += 1; // Latest tag is less secure
  
  // Repository factor
  if (!image.repository.includes('/')) riskFactors += 1; // Official images are safer
  
  if (riskFactors >= 3) return 'high';
  if (riskFactors >= 2) return 'medium';
  return 'low';
}

/**
 * Extracts registry information from image repository
 */
export function getImageRegistry(image: ContainerImage): {
  registry: string;
  namespace?: string;
  name: string;
} {
  const parts = image.repository.split('/');
  
  if (parts.length === 1) {
    // Official Docker Hub image (e.g., "nginx")
    return {
      registry: 'docker.io',
      name: parts[0],
    };
  } else if (parts.length === 2 && !parts[0].includes('.')) {
    // Docker Hub user image (e.g., "library/nginx")
    return {
      registry: 'docker.io',
      namespace: parts[0],
      name: parts[1],
    };
  } else {
    // Custom registry (e.g., "gcr.io/project/image")
    return {
      registry: parts[0],
      namespace: parts.length > 2 ? parts.slice(1, -1).join('/') : undefined,
      name: parts[parts.length - 1],
    };
  }
}

/**
 * Filters images based on the provided criteria
 */
export function filterImages(images: ContainerImage[], filters: ImageFilters): ContainerImage[] {
  return images.filter(image => {
    // Search filter - matches repository, tag, or ID
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesRepo = image.repository.toLowerCase().includes(searchLower);
      const matchesTag = image.tag.toLowerCase().includes(searchLower);
      const matchesId = image.id.toLowerCase().includes(searchLower);
      
      if (!matchesRepo && !matchesTag && !matchesId) {
        return false;
      }
    }
    
    // Repository filter
    if (filters.repository && !image.repository.includes(filters.repository)) {
      return false;
    }
    
    // Tag filter
    if (filters.tag && image.tag !== filters.tag) {
      return false;
    }
    
    // In use filter
    if (filters.inUse !== undefined && image.inUse !== filters.inUse) {
      return false;
    }
    
    // Architecture filter
    if (filters.architecture && image.architecture !== filters.architecture) {
      return false;
    }
    
    // Size filter
    if (filters.size) {
      if (filters.size.min && image.size < filters.size.min) {
        return false;
      }
      if (filters.size.max && image.size > filters.size.max) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Sorts images by the specified criteria
 */
export function sortImages(
  images: ContainerImage[], 
  sortBy: 'name' | 'size' | 'created' | 'repository' | 'tag' | 'usage',
  sortOrder: 'asc' | 'desc' = 'asc'
): ContainerImage[] {
  const sorted = [...images].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = getFullImageName(a).localeCompare(getFullImageName(b));
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'created':
        comparison = new Date(a.created).getTime() - new Date(b.created).getTime();
        break;
      case 'repository':
        comparison = a.repository.localeCompare(b.repository);
        break;
      case 'tag':
        comparison = a.tag.localeCompare(b.tag);
        break;
      case 'usage':
        // Sort by usage: in-use first, then by number of containers
        if (a.inUse !== b.inUse) {
          comparison = b.inUse ? 1 : -1;
        } else {
          const aContainers = a.containers?.length || 0;
          const bContainers = b.containers?.length || 0;
          comparison = aContainers - bContainers;
        }
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
}

/**
 * Groups images by repository
 */
export function groupImagesByRepository(images: ContainerImage[]): Record<string, ContainerImage[]> {
  return images.reduce((groups, image) => {
    const repo = image.repository;
    if (!groups[repo]) {
      groups[repo] = [];
    }
    groups[repo].push(image);
    return groups;
  }, {} as Record<string, ContainerImage[]>);
}

/**
 * Groups images by registry
 */
export function groupImagesByRegistry(images: ContainerImage[]): Record<string, ContainerImage[]> {
  return images.reduce((groups, image) => {
    const registry = getImageRegistry(image).registry;
    if (!groups[registry]) {
      groups[registry] = [];
    }
    groups[registry].push(image);
    return groups;
  }, {} as Record<string, ContainerImage[]>);
}

/**
 * Calculates aggregate statistics for a list of images
 */
export function calculateImageStats(images: ContainerImage[]) {
  const stats = {
    total: images.length,
    inUse: 0,
    unused: 0,
    totalSize: 0,
    averageSize: 0,
    oldImages: 0,
    largeImages: 0,
    repositories: new Set<string>(),
    registries: new Set<string>(),
    architectures: new Set<string>(),
    riskDistribution: {
      low: 0,
      medium: 0,
      high: 0,
    },
  };
  
  images.forEach(image => {
    // Usage counts
    if (image.inUse) {
      stats.inUse++;
    } else {
      stats.unused++;
    }
    
    // Size calculations
    stats.totalSize += image.size;
    
    // Age and size classifications
    if (isImageOld(image)) {
      stats.oldImages++;
    }
    
    if (isImageLarge(image)) {
      stats.largeImages++;
    }
    
    // Unique collections
    stats.repositories.add(image.repository);
    stats.registries.add(getImageRegistry(image).registry);
    if (image.architecture) {
      stats.architectures.add(image.architecture);
    }
    
    // Risk distribution
    const risk = getImageRiskLevel(image);
    stats.riskDistribution[risk]++;
  });
  
  // Calculate averages
  if (images.length > 0) {
    stats.averageSize = stats.totalSize / images.length;
  }
  
  return {
    ...stats,
    repositories: Array.from(stats.repositories),
    registries: Array.from(stats.registries),
    architectures: Array.from(stats.architectures),
  };
}

/**
 * Identifies duplicate images (same repository but different tags)
 */
export function findDuplicateImages(images: ContainerImage[]): Record<string, ContainerImage[]> {
  const duplicates: Record<string, ContainerImage[]> = {};
  
  const groupedByRepo = groupImagesByRepository(images);
  
  Object.entries(groupedByRepo).forEach(([repo, repoImages]) => {
    if (repoImages.length > 1) {
      duplicates[repo] = repoImages;
    }
  });
  
  return duplicates;
}

/**
 * Suggests images that can be safely cleaned up
 */
export function suggestImageCleanup(images: ContainerImage[]): {
  safeToDelete: ContainerImage[];
  oldUnused: ContainerImage[];
  largeUnused: ContainerImage[];
  potentialSavings: number;
} {
  const unusedImages = images.filter(img => !img.inUse);
  
  const safeToDelete = unusedImages.filter(img => 
    getImageAge(img) > 7 && // Older than a week
    getImageRiskLevel(img) !== 'high'
  );
  
  const oldUnused = unusedImages.filter(img => isImageOld(img));
  const largeUnused = unusedImages.filter(img => isImageLarge(img));
  
  const potentialSavings = safeToDelete.reduce((total, img) => total + img.size, 0);
  
  return {
    safeToDelete,
    oldUnused,
    largeUnused,
    potentialSavings,
  };
}

/**
 * Validates image pull configuration
 */
export function validateImagePullConfig(config: {
  repository: string;
  tag?: string;
  registry?: string;
  auth?: {
    username: string;
    password: string;
  };
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Repository validation
  if (!config.repository || config.repository.trim().length === 0) {
    errors.push('Repository name is required');
  } else if (!/^[a-z0-9._/-]+$/.test(config.repository)) {
    errors.push('Repository name contains invalid characters');
  }
  
  // Tag validation
  if (config.tag && !/^[a-zA-Z0-9._-]+$/.test(config.tag)) {
    errors.push('Tag contains invalid characters');
  }
  
  // Registry validation
  if (config.registry && !/^[a-z0-9.-]+$/.test(config.registry)) {
    errors.push('Registry URL contains invalid characters');
  }
  
  // Authentication validation
  if (config.auth) {
    if (!config.auth.username) {
      errors.push('Username is required when using authentication');
    }
    if (!config.auth.password) {
      errors.push('Password is required when using authentication');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}