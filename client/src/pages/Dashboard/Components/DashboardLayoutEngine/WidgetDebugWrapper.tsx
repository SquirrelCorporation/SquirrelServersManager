import React, { useRef, useEffect } from 'react';

interface WidgetDebugWrapperProps {
  children: React.ReactNode;
  onDebugData?: (data: any) => void;
  componentName?: string;
  fileName?: string;
}

const WidgetDebugWrapper: React.FC<WidgetDebugWrapperProps> = ({ 
  children, 
  onDebugData,
  componentName,
  fileName 
}) => {
  const debugDataRef = useRef<any>({});

  useEffect(() => {
    // When component mounts or updates, collect debug data
    if (onDebugData && React.isValidElement(children)) {
      const props = children.props || {};
      const { children: childComponents, ...safeProps } = props;
      
      const debugData = {
        componentName,
        fileName,
        props: safeProps,
        rawApiData: props.rawApiData,
        processedData: props.processedData,
        config: props.config || {
          dataType: props.dataType,
          source: props.source,
          metric: props.metric || props.metrics,
          dateRangePreset: props.dateRangePreset,
          colorPalette: props.colorPalette
        },
        settings: props.widgetSettings || props.settings || {}
      };
      
      debugDataRef.current = debugData;
      onDebugData(debugData);
    }
  }, [children, onDebugData, componentName, fileName]);

  return <>{children}</>;
};

// HOC to wrap components with debug data collection
export const withWidgetDebug = (componentName: string, fileName: string) => {
  return (WrappedComponent: React.ComponentType<any>) => {
    return React.forwardRef<any, any>((props, ref) => {
      const [debugData, setDebugData] = React.useState<any>({});
      
      // Create a wrapper that exposes debug data
      const ComponentWithDebug = React.forwardRef<any, any>((innerProps: any, innerRef) => {
        // Store the latest props as debug data
        React.useEffect(() => {
          const { children, ...safeProps } = innerProps;
          setDebugData({
            componentName,
            fileName,
            props: safeProps,
            config: {
              dataType: innerProps.dataType,
              source: innerProps.source,
              metric: innerProps.metric || innerProps.metrics,
              dateRangePreset: innerProps.dateRangePreset,
              colorPalette: innerProps.colorPalette
            },
            settings: innerProps.widgetSettings || innerProps.settings || {}
          });
        }, [innerProps]);
        
        return <WrappedComponent {...innerProps} ref={innerRef} />;
      });
      
      ComponentWithDebug.displayName = `WithDebug(${componentName})`;
      
      // Attach debug data to the component instance
      (ComponentWithDebug as any).debugData = debugData;
      
      return <ComponentWithDebug {...props} ref={ref} />;
    });
  };
};

export default WidgetDebugWrapper;