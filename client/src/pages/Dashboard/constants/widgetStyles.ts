/**
 * Widget Styles
 * Centralized styles for dashboard widgets to ensure consistency
 */

import { CSSProperties } from 'react';

// Typography styles
export const WIDGET_TYPOGRAPHY = {
  // Widget title style - used for card headers
  title: {
    color: '#b8bac3',
    fontSize: '14px',
    fontWeight: 400,
  } as CSSProperties,
  
  // Main value display - large numbers/metrics
  mainValue: {
    color: '#ffffff',
    fontSize: '36px',
    fontWeight: '500',
    lineHeight: 1,
    margin: 0,
  } as CSSProperties,
  
  // Compact value display - smaller version of main value
  compactValue: {
    color: '#f0f0f0',
    fontSize: '30px',
    fontWeight: '600',
    margin: 0,
  } as CSSProperties,
  
  // Trend value - percentage changes
  trendValue: {
    fontSize: '14px',
    fontWeight: 500,
  } as CSSProperties,
  
  // Descriptive text - labels and descriptions
  description: {
    color: '#7a7d87',
    fontSize: '14px',
  } as CSSProperties,
  
  // Muted text - secondary information
  muted: {
    color: '#8c8c8c',
    fontSize: '13px',
  } as CSSProperties,
} as const;

// Card styles
export const WIDGET_CARD = {
  // Base card style
  base: {
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    color: 'white',
    border: 'none',
    position: 'relative' as const,
  } as CSSProperties,
  
  // Card body padding
  bodyStyle: {
    padding: '24px',
  } as CSSProperties,
  
  // Compact card body padding
  compactBodyStyle: {
    padding: '20px 24px',
  } as CSSProperties,
} as const;

// Colors
export const WIDGET_COLORS = {
  // Background colors
  background: {
    primary: '#1a1a1a',
    secondary: '#2a2a2a',
    hover: '#2f2f2f',
  },
  
  // Text colors
  text: {
    primary: '#ffffff',
    secondary: '#f0f0f0',
    muted: '#8c8c8c',
    description: '#7a7d87',
    title: '#b8bac3',
  },
  
  // Status colors
  status: {
    success: '#52c41a',
    error: '#ff4d4f',
    warning: '#faad14',
    info: '#1890ff',
  },
  
  // Trend colors
  trend: {
    up: '#52c41a',
    down: '#ff4d4f',
    neutral: '#8c8c8c',
  },
} as const;