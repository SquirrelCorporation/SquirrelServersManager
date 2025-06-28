/**
 * Indicator Components
 * Components for displaying numerical indicators and counts
 */

export { default as CountIndicator } from './CountIndicator';
export { default as CountIndicatorWithData } from './CountIndicatorWithData';

export type { CountIndicatorProps } from './CountIndicator';
export type { CountIndicatorWithDataProps } from './CountIndicatorWithData';

// Re-export for convenience
export { 
  CountIndicator as StaticCountIndicator
} from './CountIndicator';
export {
  CountIndicatorWithData as DeviceCountIndicator 
} from './CountIndicatorWithData';