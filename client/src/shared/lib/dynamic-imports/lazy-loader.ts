/**
 * Dynamic Import Utilities for Bundle Optimization
 * Implements code splitting and lazy loading for better performance
 */

import React, { Suspense } from 'react';
import { Spin } from 'antd';

// ============================================================================
// LAZY LOADING UTILITIES
// ============================================================================

export interface LazyLoadOptions {
  fallback?: React.ComponentType;
  errorBoundary?: React.ComponentType<{ error: Error; retry: () => void }>;
  preload?: boolean;
  timeout?: number;
}

/**
 * Enhanced lazy loading with error boundaries and preloading
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): React.ComponentType<React.ComponentProps<T>> {
  const {
    fallback: Fallback = DefaultFallback,
    errorBoundary: ErrorBoundary = DefaultErrorBoundary,
    preload = false,
    timeout = 10000,
  } = options;

  // Create lazy component
  const LazyComponent = React.lazy(() => {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Component loading timeout')), timeout)
    );

    return Promise.race([importFn(), timeoutPromise]);
  });

  // Preload if requested
  if (preload) {
    importFn().catch(() => {
      // Ignore preload errors - component will retry when actually needed
    });
  }

  // Wrapped component with error boundary and suspense
  const WrappedComponent = React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
    <ErrorBoundary>
      <Suspense fallback={<Fallback />}>
        <LazyComponent {...props} ref={ref} />
      </Suspense>
    </ErrorBoundary>
  ));

  WrappedComponent.displayName = `Lazy(${LazyComponent.displayName || 'Component'})`;

  // Add preload method to component
  (WrappedComponent as any).preload = importFn;

  return WrappedComponent;
}

/**
 * Default loading fallback
 */
function DefaultFallback() {
  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
      }}
    >
      <Spin size="large" tip="Loading..." />
    </div>
  );
}

/**
 * Default error boundary
 */
class DefaultErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h3>Failed to load component</h3>
          <p>{this.state.error?.message}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined })}
            style={{
              padding: '8px 16px',
              background: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// FEATURE-BASED LAZY LOADING
// ============================================================================

/**
 * Lazy load FSD features with intelligent preloading
 */
export function createFeatureLazyLoader() {
  const loadedFeatures = new Set<string>();
  const preloadPromises = new Map<string, Promise<any>>();

  return {
    /**
     * Load a feature lazily
     */
    loadFeature<T>(
      featureName: string,
      importFn: () => Promise<T>,
      options: LazyLoadOptions = {}
    ) {
      const lazyComponent = createLazyComponent(
        importFn as () => Promise<{ default: any }>,
        options
      );

      // Track loaded features
      importFn().then(() => {
        loadedFeatures.add(featureName);
      });

      return lazyComponent;
    },

    /**
     * Preload related features based on user behavior
     */
    preloadRelatedFeatures(currentFeature: string, relatedFeatures: string[]) {
      if (!loadedFeatures.has(currentFeature)) {
        return;
      }

      relatedFeatures.forEach(feature => {
        if (!loadedFeatures.has(feature) && !preloadPromises.has(feature)) {
          // This would need to be configured with actual import functions
          console.log(`Preloading related feature: ${feature}`);
        }
      });
    },

    /**
     * Get loading statistics
     */
    getStats() {
      return {
        loadedFeatures: Array.from(loadedFeatures),
        preloadingFeatures: Array.from(preloadPromises.keys()),
      };
    },
  };
}

// ============================================================================
// PROGRESSIVE LOADING STRATEGIES
// ============================================================================

/**
 * Progressive loading for large datasets
 */
export class ProgressiveLoader<T> {
  private batchSize: number;
  private loadedBatches = new Set<number>();
  private data: T[] = [];

  constructor(batchSize = 50) {
    this.batchSize = batchSize;
  }

  async loadBatch(
    batchIndex: number,
    loadFn: (offset: number, limit: number) => Promise<T[]>
  ): Promise<T[]> {
    if (this.loadedBatches.has(batchIndex)) {
      const start = batchIndex * this.batchSize;
      const end = start + this.batchSize;
      return this.data.slice(start, end);
    }

    const offset = batchIndex * this.batchSize;
    const batchData = await loadFn(offset, this.batchSize);

    // Insert data at correct position
    const start = batchIndex * this.batchSize;
    this.data.splice(start, this.batchSize, ...batchData);
    this.loadedBatches.add(batchIndex);

    return batchData;
  }

  async loadNextBatch(loadFn: (offset: number, limit: number) => Promise<T[]>): Promise<T[]> {
    const nextBatch = Math.max(0, ...Array.from(this.loadedBatches), -1) + 1;
    return this.loadBatch(nextBatch, loadFn);
  }

  getAllLoadedData(): T[] {
    return this.data.filter(item => item !== undefined);
  }

  getLoadedBatches(): number[] {
    return Array.from(this.loadedBatches).sort((a, b) => a - b);
  }

  reset() {
    this.loadedBatches.clear();
    this.data = [];
  }
}

// ============================================================================
// BUNDLE ANALYSIS UTILITIES
// ============================================================================

/**
 * Runtime bundle size monitoring
 */
export class BundleMonitor {
  private chunkSizes = new Map<string, number>();
  private loadTimes = new Map<string, number>();

  recordChunkLoad(chunkName: string, size: number, loadTime: number) {
    this.chunkSizes.set(chunkName, size);
    this.loadTimes.set(chunkName, loadTime);
  }

  getChunkStats() {
    const chunks = Array.from(this.chunkSizes.keys());
    return chunks.map(chunk => ({
      name: chunk,
      size: this.chunkSizes.get(chunk) || 0,
      loadTime: this.loadTimes.get(chunk) || 0,
      efficiency: this.calculateEfficiency(chunk),
    }));
  }

  private calculateEfficiency(chunkName: string): number {
    const size = this.chunkSizes.get(chunkName) || 0;
    const loadTime = this.loadTimes.get(chunkName) || 0;
    
    if (loadTime === 0) return 0;
    
    // Size in KB per second
    return (size / 1024) / (loadTime / 1000);
  }

  getTotalSize(): number {
    return Array.from(this.chunkSizes.values()).reduce((sum, size) => sum + size, 0);
  }

  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getChunkStats();
    
    // Large chunks
    const largeChunks = stats.filter(chunk => chunk.size > 500 * 1024); // > 500KB
    if (largeChunks.length > 0) {
      recommendations.push(
        `Consider splitting large chunks: ${largeChunks.map(c => c.name).join(', ')}`
      );
    }
    
    // Slow loading chunks
    const slowChunks = stats.filter(chunk => chunk.loadTime > 3000); // > 3s
    if (slowChunks.length > 0) {
      recommendations.push(
        `Optimize slow-loading chunks: ${slowChunks.map(c => c.name).join(', ')}`
      );
    }
    
    // Low efficiency chunks
    const inefficientChunks = stats.filter(chunk => chunk.efficiency < 100); // < 100 KB/s
    if (inefficientChunks.length > 0) {
      recommendations.push(
        `Review inefficient chunks: ${inefficientChunks.map(c => c.name).join(', ')}`
      );
    }
    
    return recommendations;
  }
}

// ============================================================================
// INTELLIGENT PRELOADING
// ============================================================================

/**
 * Intelligent preloading based on user behavior patterns
 */
export class IntelligentPreloader {
  private accessPatterns = new Map<string, number>();
  private transitions = new Map<string, Map<string, number>>();
  private preloadThreshold = 3;

  recordAccess(route: string) {
    const count = this.accessPatterns.get(route) || 0;
    this.accessPatterns.set(route, count + 1);
  }

  recordTransition(from: string, to: string) {
    if (!this.transitions.has(from)) {
      this.transitions.set(from, new Map());
    }
    
    const fromTransitions = this.transitions.get(from)!;
    const count = fromTransitions.get(to) || 0;
    fromTransitions.set(to, count + 1);
  }

  getPredictedRoutes(currentRoute: string, limit = 3): string[] {
    const transitions = this.transitions.get(currentRoute);
    if (!transitions) return [];

    return Array.from(transitions.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([route]) => route);
  }

  shouldPreload(route: string): boolean {
    const accessCount = this.accessPatterns.get(route) || 0;
    return accessCount >= this.preloadThreshold;
  }

  getHotRoutes(limit = 5): string[] {
    return Array.from(this.accessPatterns.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([route]) => route);
  }

  exportData() {
    return {
      accessPatterns: Object.fromEntries(this.accessPatterns),
      transitions: Object.fromEntries(
        Array.from(this.transitions.entries()).map(([from, toMap]) => [
          from,
          Object.fromEntries(toMap),
        ])
      ),
    };
  }

  importData(data: any) {
    if (data.accessPatterns) {
      this.accessPatterns = new Map(Object.entries(data.accessPatterns));
    }
    if (data.transitions) {
      this.transitions = new Map(
        Object.entries(data.transitions).map(([from, toObj]: [string, any]) => [
          from,
          new Map(Object.entries(toObj)),
        ])
      );
    }
  }
}

// Singleton instances
export const bundleMonitor = new BundleMonitor();
export const intelligentPreloader = new IntelligentPreloader();
export const featureLazyLoader = createFeatureLazyLoader();

// Development utilities
if (process.env.NODE_ENV === 'development') {
  (window as any).bundleMonitor = bundleMonitor;
  (window as any).intelligentPreloader = intelligentPreloader;
  (window as any).featureLazyLoader = featureLazyLoader;
}