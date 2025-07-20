import React, { createContext, useContext, useState, useCallback } from 'react';

interface DebugData {
  componentName?: string;
  fileName?: string;
  rawApiData?: Record<string, unknown>;
  processedData?: Record<string, unknown>;
  config?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  props?: Record<string, unknown>;
}

interface DebugDataContextType {
  debugData: Record<string, DebugData>;
  setDebugData: (widgetId: string, data: DebugData) => void;
  getDebugData: (widgetId: string) => DebugData | undefined;
}

const DebugDataContext = createContext<DebugDataContextType | undefined>(undefined);

export const useDebugData = () => {
  const context = useContext(DebugDataContext);
  if (!context) {
    throw new Error('useDebugData must be used within a DebugDataProvider');
  }
  return context;
};

export const DebugDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [debugData, setDebugDataState] = useState<Record<string, DebugData>>({});

  const setDebugData = useCallback((widgetId: string, data: DebugData) => {
    setDebugDataState(prev => ({
      ...prev,
      [widgetId]: data
    }));
  }, []);

  const getDebugData = useCallback((widgetId: string) => {
    return debugData[widgetId];
  }, [debugData]);

  return (
    <DebugDataContext.Provider value={{ debugData, setDebugData, getDebugData }}>
      {children}
    </DebugDataContext.Provider>
  );
};

// Hook for widgets to register their debug data
export const useRegisterDebugData = (widgetId: string | undefined) => {
  const { setDebugData } = useDebugData();
  
  const updateDebugData = React.useCallback((data: Partial<DebugData>) => {
    if (widgetId) {
      setDebugData(widgetId, data as DebugData);
    }
  }, [widgetId, setDebugData]);
  
  return updateDebugData;
};