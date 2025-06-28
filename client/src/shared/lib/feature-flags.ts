import React from 'react';

/**
 * Feature flags for controlling FSD migration rollout
 */
export interface FeatureFlags {
  // Container features
  containerImagesFSD: boolean;
  containerVolumesFSD: boolean;
  containerNetworksFSD: boolean;
  containerMainFSD: boolean;
  
  // Dashboard features  
  dashboardFSD: boolean;
  
  // Admin features
  adminLogsFSD: boolean;
  
  // Automation features
  automationsFSD: boolean;
}

/**
 * Default feature flags configuration
 * Set to true to enable FSD features, false to use legacy
 */
const defaultFlags: FeatureFlags = {
  // Containers - gradually rolling out
  containerImagesFSD: true, // ✅ Ready for testing
  containerVolumesFSD: true, // ✅ Ready for testing
  containerNetworksFSD: false, // 🚧 Not implemented yet
  containerMainFSD: false, // 🚧 Not implemented yet
  
  // Dashboard - complete
  dashboardFSD: true, // ✅ Production ready
  
  // Admin - complete  
  adminLogsFSD: true, // ✅ Production ready
  
  // Automations - new implementation
  automationsFSD: false, // 🚧 Under development
};

/**
 * Get feature flags from environment or use defaults
 */
export function getFeatureFlags(): FeatureFlags {
  // In development, allow override via localStorage
  if (process.env.NODE_ENV === 'development') {
    try {
      const stored = localStorage.getItem('ssm-feature-flags');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultFlags, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to parse feature flags from localStorage:', error);
    }
  }

  // In production, use environment variables with defaults
  return {
    containerImagesFSD: process.env.REACT_APP_CONTAINER_IMAGES_FSD === 'true' ?? defaultFlags.containerImagesFSD,
    containerVolumesFSD: process.env.REACT_APP_CONTAINER_VOLUMES_FSD === 'true' ?? defaultFlags.containerVolumesFSD,
    containerNetworksFSD: process.env.REACT_APP_CONTAINER_NETWORKS_FSD === 'true' ?? defaultFlags.containerNetworksFSD,
    containerMainFSD: process.env.REACT_APP_CONTAINER_MAIN_FSD === 'true' ?? defaultFlags.containerMainFSD,
    dashboardFSD: process.env.REACT_APP_DASHBOARD_FSD === 'true' ?? defaultFlags.dashboardFSD,
    adminLogsFSD: process.env.REACT_APP_ADMIN_LOGS_FSD === 'true' ?? defaultFlags.adminLogsFSD,
  };
}

/**
 * React hook for accessing feature flags
 */
export function useFeatureFlags(): FeatureFlags {
  const [flags, setFlags] = React.useState<FeatureFlags>(getFeatureFlags);

  // Re-check flags when localStorage changes (dev only)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const handleStorageChange = () => {
        setFlags(getFeatureFlags());
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  return flags;
}

/**
 * Hook for checking a specific feature flag
 */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  const flags = useFeatureFlags();
  return flags[flag];
}

/**
 * Development helper to toggle feature flags in localStorage
 */
export function toggleFeatureFlag(flag: keyof FeatureFlags, enabled?: boolean) {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Feature flag toggling is only available in development');
    return;
  }

  try {
    const current = getFeatureFlags();
    const newValue = enabled ?? !current[flag];
    const updated = { ...current, [flag]: newValue };
    
    localStorage.setItem('ssm-feature-flags', JSON.stringify(updated));
    console.log(`Feature flag '${flag}' set to:`, newValue);
    
    // Trigger storage event to update other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'ssm-feature-flags',
      newValue: JSON.stringify(updated),
    }));
  } catch (error) {
    console.error('Failed to toggle feature flag:', error);
  }
}

// Make available on window for easy dev console access
if (process.env.NODE_ENV === 'development') {
  (window as any).toggleFeatureFlag = toggleFeatureFlag;
  (window as any).getFeatureFlags = getFeatureFlags;
}