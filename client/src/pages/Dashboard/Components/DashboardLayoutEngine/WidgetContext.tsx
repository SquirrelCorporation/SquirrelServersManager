import React, { createContext, useContext } from 'react';

interface WidgetContextType {
  widgetId: string;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export const useWidgetContext = () => {
  const context = useContext(WidgetContext);
  return context;
};

interface WidgetProviderProps {
  widgetId: string;
  children: React.ReactNode;
}

export const WidgetProvider: React.FC<WidgetProviderProps> = ({ widgetId, children }) => {
  return (
    <WidgetContext.Provider value={{ widgetId }}>
      {children}
    </WidgetContext.Provider>
  );
};