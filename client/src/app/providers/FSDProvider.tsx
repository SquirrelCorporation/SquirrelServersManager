import React, { createContext, useContext, useEffect } from 'react';
import { containerSocketService } from '@shared/lib/socket/containers-socket';
import { useDeviceStore } from '@shared/store/device-store';

interface FSDContextValue {
  initialized: boolean;
}

const FSDContext = createContext<FSDContextValue>({ initialized: false });

export const useFSDContext = () => useContext(FSDContext);

interface FSDProviderProps {
  children: React.ReactNode;
}

/**
 * Provider for FSD architecture features
 * Ensures sockets and stores are initialized once at app level
 */
export const FSDProvider: React.FC<FSDProviderProps> = ({ children }) => {
  const [initialized, setInitialized] = React.useState(false);

  useEffect(() => {
    // Initialize socket connections once
    containerSocketService.initContainerSocket();
    
    // Initialize device store with any necessary setup
    // Device data will be loaded by specific components as needed
    
    // Mark as initialized
    setInitialized(true);
    
    // Prevent duplicate initialization warnings in development
    if (process.env.NODE_ENV === 'development') {
      console.log('FSD Provider initialized - sockets and stores ready');
    }

    // Cleanup on unmount
    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('FSD Provider cleanup - disconnecting sockets');
      }
      containerSocketService.disconnect();
    };
  }, []);

  const contextValue: FSDContextValue = {
    initialized,
  };

  return (
    <FSDContext.Provider value={contextValue}>
      {children}
    </FSDContext.Provider>
  );
};

/**
 * Hook to ensure FSD services are initialized before use
 */
export const useFSDInitialized = () => {
  const { initialized } = useFSDContext();
  
  if (!initialized) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('FSD services not yet initialized. Ensure FSDProvider is mounted at app root.');
    }
  }
  
  return initialized;
};