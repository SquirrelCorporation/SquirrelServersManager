/**
 * Widget Constants
 * Centralized constants for dashboard widgets
 */

// Field names for widget settings
export const WIDGET_FIELDS = {
  STATISTICS_TYPE: 'statistics_type',
  STATISTICS_SOURCE: 'statistics_source',
  STATISTICS_METRIC: 'statistics_metric',
  TITLE: 'title',
  DATE_RANGE_PRESET: 'dateRangePreset',
  CUSTOM_DATE_RANGE: 'customDateRange',
  COLOR_PALETTE: 'colorPalette',
  CUSTOM_COLORS: 'customColors',
  BACKGROUND_COLOR_PALETTE: 'backgroundColorPalette',
  CUSTOM_TEXT: 'customText',
  ICON: 'icon',
  ILLUSTRATION_URL: 'illustrationUrl',
  DEFAULT_VALUE: 'defaultValue',
  IS_PREVIEW: 'isPreview',
} as const;

// Default values
export const WIDGET_DEFAULTS = {
  DATA_TYPE: 'device',
  METRIC: 'cpu_usage',
  DATE_RANGE: 'last7days',
  COLOR_PALETTE: 'default',
  EMPTY_ARRAY: [] as string[],
  ALL_SOURCES: ['all'],
} as const;

// Data types
export const DATA_TYPES = {
  DEVICE: 'device',
  CONTAINER: 'container',
} as const;

// Metrics
export const METRICS = {
  CPU_USAGE: 'cpu_usage',
  MEMORY_USAGE: 'memory_usage',
  MEMORY_FREE: 'memory_free',
  STORAGE_USAGE: 'storage_usage',
  STORAGE_FREE: 'storage_free',
  CONTAINERS: 'containers',
  CONTAINER_CPU_USAGE: 'container_cpu_usage',
  CONTAINER_MEMORY_USAGE: 'container_memory_usage',
} as const;

// Date range presets
export const DATE_RANGE_PRESETS = {
  LAST_24_HOURS: 'last24hours',
  LAST_7_DAYS: 'last7days',
  LAST_30_DAYS: 'last30days',
  LAST_3_MONTHS: 'last3months',
  LAST_6_MONTHS: 'last6months',
  LAST_YEAR: 'lastyear',
  CUSTOM: 'custom',
} as const;

// Color palettes
export const COLOR_PALETTES = {
  DEFAULT: 'default',
  MODERN: 'modern',
  VIBRANT: 'vibrant',
  PASTEL: 'pastel',
  PROFESSIONAL: 'professional',
  SYSTEM: 'system',
  DARK: 'dark',
  CUSTOM: 'custom',
} as const;

// Background color themes
export const BACKGROUND_THEMES = {
  DEFAULT: 'default',
  PRIMARY: 'primary',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  LIGHT: 'light',
  DARK: 'dark',
  PURPLE: 'purple',
  OCEAN: 'ocean',
  SUNSET: 'sunset',
} as const;