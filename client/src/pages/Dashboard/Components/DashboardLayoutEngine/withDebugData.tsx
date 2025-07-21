import React, { useRef, useEffect } from 'react';

export interface DebugDataRef {
  getDebugData: () => any;
}

interface WithDebugDataProps {
  debugRef?: React.RefObject<DebugDataRef>;
}

export function withDebugData<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return React.forwardRef<DebugDataRef, P & WithDebugDataProps>((props, ref) => {
    const debugDataRef = useRef<any>({});
    const { debugRef, ...componentProps } = props;

    // Create a wrapped component that captures debug data
    const ComponentWithDebugCapture = (innerProps: P) => {
      // Capture props for debug
      debugDataRef.current.props = innerProps;
      
      return <WrappedComponent {...innerProps} />;
    };

    // Expose debug data getter
    useEffect(() => {
      if (debugRef) {
        debugRef.current = {
          getDebugData: () => debugDataRef.current
        };
      }
    }, [debugRef]);

    return <ComponentWithDebugCapture {...(componentProps as P)} />;
  });
}

// Helper function to collect debug data from components
export const collectDebugData = (component: React.ReactNode, componentName: string, fileName: string): any => {
  // Extract props from component if it's a React element
  if (React.isValidElement(component)) {
    const props = component.props || {};
    
    // Filter out sensitive or large data
    const { children, ...safeProps } = props;
    
    return {
      componentName,
      fileName,
      props: safeProps,
      config: props.config || {},
      settings: props.widgetSettings || {}
    };
  }
  
  return {
    componentName,
    fileName
  };
};