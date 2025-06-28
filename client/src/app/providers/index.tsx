import React from 'react';
import { QueryProvider } from './QueryProvider';
import { NotificationProvider } from './NotificationProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Combined providers for the application
 * Provides React Query, Zustand stores, and notification system
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </QueryProvider>
  );
};