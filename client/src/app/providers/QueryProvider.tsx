import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@app/store';
import { CacheOptimizer, createDevCacheUtils } from '@app/cache/cache-config';
import { useSelectedDevice } from '@shared/store/ui-state';

interface QueryProviderProps {
  children: React.ReactNode;
}

// Cache optimizer singleton
let cacheOptimizer: CacheOptimizer | null = null;

function CacheOptimization() {
  const { uuid: deviceUuid } = useSelectedDevice();
  
  useEffect(() => {
    if (!cacheOptimizer) {
      cacheOptimizer = new CacheOptimizer(queryClient);
    }
    
    // Optimize cache when device changes
    if (deviceUuid) {
      cacheOptimizer.optimizeForContainers(deviceUuid);
    }
  }, [deviceUuid]);
  
  // Memory optimization on interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (cacheOptimizer) {
        cacheOptimizer.optimizeMemory();
      }
    }, 10 * 60 * 1000); // Every 10 minutes
    
    return () => clearInterval(interval);
  }, []);
  
  return null;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize dev utilities in development
    if (process.env.NODE_ENV === 'development') {
      (window as any).cacheUtils = createDevCacheUtils(queryClient);
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <CacheOptimization />
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          toggleButtonProps={{
            style: {
              marginLeft: '5px',
              transform: 'none',
              position: 'fixed',
              bottom: '10px',
              right: '10px',
              zIndex: 99999,
            },
          }}
        />
      )}
    </QueryClientProvider>
  );
};