/**
 * Lazy-loaded Components for Bundle Optimization
 * Implements code splitting for major application features
 */

import { createLazyComponent, featureLazyLoader } from '@shared/lib/dynamic-imports/lazy-loader';

// ============================================================================
// FEATURE COMPONENTS (FSD Features)
// ============================================================================

/**
 * Dashboard Feature - Usually accessed first, preload
 */
export const LazyDashboard = createLazyComponent(
  () => import('@features/dashboard/ui/DashboardPage'),
  { preload: true }
);

/**
 * Admin Logs Feature - Heavy component, load on demand
 */
export const LazyAdminLogs = createLazyComponent(
  () => import('@pages/Admin/Logs'),
  { preload: false }
);

/**
 * Container Images Feature - Load on demand
 */
export const LazyContainerImages = createLazyComponent(
  () => import('@features/container-images/ui/ImagesPage'),
  { preload: false }
);

/**
 * Container Volumes Feature - Load on demand
 */
export const LazyContainerVolumes = createLazyComponent(
  () => import('@features/container-volumes/ui/VolumesPage'),
  { preload: false }
);

/**
 * Container Networks Feature - Load on demand
 */
export const LazyContainerNetworks = createLazyComponent(
  () => import('@features/container-networks/ui/NetworksPage'),
  { preload: false }
);

// ============================================================================
// PAGE COMPONENTS (Heavy Pages)
// ============================================================================

/**
 * Main Containers Page - High usage, consider preloading
 */
export const LazyContainersPage = createLazyComponent(
  () => import('@pages/Containers'),
  { preload: true }
);

/**
 * Playbooks Page - Complex page, load on demand
 */
export const LazyPlaybooksPage = createLazyComponent(
  () => import('@pages/Playbooks'),
  { preload: false }
);

/**
 * Device Settings Page - Load on demand
 */
export const LazyDeviceSettingsPage = createLazyComponent(
  () => import('@pages/DeviceSettings'),
  { preload: false }
);

/**
 * Analytics/Reports Page - Heavy, load on demand
 */
export const LazyAnalyticsPage = createLazyComponent(
  () => import('@pages/Analytics'),
  { preload: false }
);

// ============================================================================
// COMPONENT WRAPPERS (Heavy UI Components)
// ============================================================================

/**
 * Advanced Data Table - Heavy component for large datasets
 */
export const LazyAdvancedDataTable = createLazyComponent(
  () => import('@shared/ui/AdvancedDataTable'),
  { preload: false }
);

/**
 * Code Editor - Heavy component with syntax highlighting
 */
export const LazyCodeEditor = createLazyComponent(
  () => import('@shared/ui/CodeEditor'),
  { preload: false }
);

/**
 * Chart Components - Heavy visualization library
 */
export const LazyChartDashboard = createLazyComponent(
  () => import('@shared/ui/ChartDashboard'),
  { preload: false }
);

/**
 * File Browser - Complex file management component
 */
export const LazyFileBrowser = createLazyComponent(
  () => import('@shared/ui/FileBrowser'),
  { preload: false }
);

/**
 * Terminal Emulator - Heavy component for shell access
 */
export const LazyTerminalEmulator = createLazyComponent(
  () => import('@shared/ui/TerminalEmulator'),
  { preload: false }
);

// ============================================================================
// MODAL COMPONENTS (Load on demand)
// ============================================================================

/**
 * Container Creation Modal - Complex form, load on demand
 */
export const LazyContainerCreateModal = createLazyComponent(
  () => import('@features/containers/ui/CreateContainerModal'),
  { preload: false }
);

/**
 * Image Pull Modal - Load on demand
 */
export const LazyImagePullModal = createLazyComponent(
  () => import('@features/container-images/ui/PullImageModal'),
  { preload: false }
);

/**
 * Playbook Execution Modal - Complex, load on demand
 */
export const LazyPlaybookExecutionModal = createLazyComponent(
  () => import('@features/playbooks/ui/ExecutionModal'),
  { preload: false }
);

/**
 * Device Configuration Modal - Load on demand
 */
export const LazyDeviceConfigModal = createLazyComponent(
  () => import('@features/devices/ui/ConfigurationModal'),
  { preload: false }
);

// ============================================================================
// FEATURE FLAG WRAPPER
// ============================================================================

import React from 'react';
import { useFeatureFlags } from '@shared/store/ui-state';

interface LazyFeatureWrapperProps {
  featureFlag: string;
  fallbackComponent: React.ComponentType;
  lazyComponent: React.ComponentType;
  children?: React.ReactNode;
}

/**
 * Wrapper that switches between FSD and legacy components based on feature flags
 */
export const LazyFeatureWrapper: React.FC<LazyFeatureWrapperProps> = ({
  featureFlag,
  fallbackComponent: FallbackComponent,
  lazyComponent: LazyComponent,
  children,
}) => {
  const { flags } = useFeatureFlags();
  const isEnabled = flags[featureFlag];

  if (isEnabled) {
    return <LazyComponent>{children}</LazyComponent>;
  }

  return <FallbackComponent>{children}</FallbackComponent>;
};

// ============================================================================
// PRELOADING HOOKS
// ============================================================================

/**
 * Hook to preload components based on user behavior
 */
export function useIntelligentPreloading() {
  const { flags } = useFeatureFlags();

  React.useEffect(() => {
    // Preload dashboard components if FSD is enabled
    if (flags.dashboardFSD) {
      LazyDashboard.preload?.();
    }

    // Preload container components if user is likely to use them
    if (flags.containerImagesFSD || flags.containerVolumesFSD) {
      LazyContainersPage.preload?.();
    }
  }, [flags]);

  return {
    preloadContainerFeatures: () => {
      LazyContainerImages.preload?.();
      LazyContainerVolumes.preload?.();
      LazyContainerNetworks.preload?.();
    },
    preloadAdminFeatures: () => {
      LazyAdminLogs.preload?.();
      LazyDeviceSettingsPage.preload?.();
    },
    preloadPlaybookFeatures: () => {
      LazyPlaybooksPage.preload?.();
      LazyPlaybookExecutionModal.preload?.();
    },
  };
}

// ============================================================================
// ROUTE-BASED LAZY LOADING
// ============================================================================

export const LAZY_ROUTE_COMPONENTS = {
  // Main pages
  '/dashboard': LazyDashboard,
  '/containers': LazyContainersPage,
  '/playbooks': LazyPlaybooksPage,
  '/admin/logs': LazyAdminLogs,
  '/analytics': LazyAnalyticsPage,
  '/device-settings': LazyDeviceSettingsPage,

  // Feature components
  '/containers/images': LazyContainerImages,
  '/containers/volumes': LazyContainerVolumes,
  '/containers/networks': LazyContainerNetworks,
} as const;

/**
 * Get lazy component for route
 */
export function getLazyComponent(route: string) {
  return LAZY_ROUTE_COMPONENTS[route as keyof typeof LAZY_ROUTE_COMPONENTS];
}

/**
 * Preload components for routes
 */
export function preloadRoutes(routes: string[]) {
  routes.forEach(route => {
    const component = getLazyComponent(route);
    if (component && 'preload' in component) {
      (component as any).preload?.();
    }
  });
}

// ============================================================================
// DEVELOPMENT UTILITIES
// ============================================================================

if (process.env.NODE_ENV === 'development') {
  (window as any).lazyComponents = {
    LazyDashboard,
    LazyAdminLogs,
    LazyContainerImages,
    LazyContainerVolumes,
    LazyContainerNetworks,
    LazyContainersPage,
    LazyPlaybooksPage,
    LazyDeviceSettingsPage,
    LazyAnalyticsPage,
    LAZY_ROUTE_COMPONENTS,
    preloadRoutes,
    getLazyComponent,
  };
}