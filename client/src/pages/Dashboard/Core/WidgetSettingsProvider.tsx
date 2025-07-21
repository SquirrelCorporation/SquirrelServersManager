/**
 * Widget Settings Provider
 * React context and hooks for widget settings management
 */

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { widgetSettingsManager } from './WidgetSettingsManager';
import {
  WidgetSettingsSchema,
  WidgetConfiguration,
  ValidationResult,
} from './WidgetSettings.types';

interface WidgetSettingsContextValue {
  getSchema: (widgetType: string) => WidgetSettingsSchema | undefined;
  validateConfiguration: (widgetType: string, config: WidgetConfiguration) => ValidationResult;
  getDefaultConfiguration: (widgetType: string) => WidgetConfiguration;
  mergeWithDefaults: (widgetType: string, config: Partial<WidgetConfiguration>) => WidgetConfiguration;
  getVisibleFields: (widgetType: string, config: WidgetConfiguration) => string[];
}

const WidgetSettingsContext = createContext<WidgetSettingsContextValue | undefined>(undefined);

interface WidgetSettingsProviderProps {
  children: React.ReactNode;
}

export const WidgetSettingsProvider: React.FC<WidgetSettingsProviderProps> = ({ children }) => {
  const getSchema = useCallback((widgetType: string) => {
    return widgetSettingsManager.getSchema(widgetType);
  }, []);

  const validateConfiguration = useCallback((widgetType: string, config: WidgetConfiguration) => {
    return widgetSettingsManager.validateConfiguration(widgetType, config);
  }, []);

  const getDefaultConfiguration = useCallback((widgetType: string) => {
    return widgetSettingsManager.getDefaultConfiguration(widgetType);
  }, []);

  const mergeWithDefaults = useCallback((widgetType: string, config: Partial<WidgetConfiguration>) => {
    return widgetSettingsManager.mergeWithDefaults(widgetType, config);
  }, []);

  const getVisibleFields = useCallback((widgetType: string, config: WidgetConfiguration) => {
    return widgetSettingsManager.getVisibleFields(widgetType, config);
  }, []);

  const value = useMemo(() => ({
    getSchema,
    validateConfiguration,
    getDefaultConfiguration,
    mergeWithDefaults,
    getVisibleFields,
  }), [getSchema, validateConfiguration, getDefaultConfiguration, mergeWithDefaults, getVisibleFields]);

  return (
    <WidgetSettingsContext.Provider value={value}>
      {children}
    </WidgetSettingsContext.Provider>
  );
};

/**
 * Hook to access widget settings functionality
 */
export const useWidgetSettings = () => {
  const context = useContext(WidgetSettingsContext);
  if (!context) {
    throw new Error('useWidgetSettings must be used within a WidgetSettingsProvider');
  }
  return context;
};

/**
 * Hook to manage a specific widget's configuration
 */
export const useWidgetConfiguration = (
  widgetType: string,
  initialConfig?: Partial<WidgetConfiguration>
) => {
  const { getDefaultConfiguration, validateConfiguration, mergeWithDefaults } = useWidgetSettings();
  
  const [configuration, setConfiguration] = React.useState<WidgetConfiguration>(() => {
    return mergeWithDefaults(widgetType, initialConfig || {});
  });

  const [validation, setValidation] = React.useState<ValidationResult>(() => {
    return validateConfiguration(widgetType, configuration);
  });

  const updateConfiguration = useCallback((updates: Partial<WidgetConfiguration>) => {
    setConfiguration(prev => {
      const newConfig = { ...prev, ...updates };
      const validationResult = validateConfiguration(widgetType, newConfig);
      setValidation(validationResult);
      return newConfig;
    });
  }, [widgetType, validateConfiguration]);

  const resetConfiguration = useCallback(() => {
    const defaultConfig = getDefaultConfiguration(widgetType);
    setConfiguration(defaultConfig);
    setValidation(validateConfiguration(widgetType, defaultConfig));
  }, [widgetType, getDefaultConfiguration, validateConfiguration]);

  return {
    configuration,
    validation,
    updateConfiguration,
    resetConfiguration,
    isValid: validation.valid,
  };
};