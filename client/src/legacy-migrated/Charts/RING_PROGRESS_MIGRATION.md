# Ring Progress Component Migration Guide

## Overview
This guide helps you migrate from the existing ring progress components to the new unified components.

## Component Mapping

### 1. CustomRingProgress → UnifiedRingProgress
The new `UnifiedRingProgress` is a drop-in replacement with additional features:

```tsx
// Old
<CustomRingProgress
  percent={value}
  type="cpu"
  size={50}
  strokeWidth={4}
  showText={true}
  tooltipText="CPU Usage"
  icon={<WhhCpu />}
/>

// New (same API, plus more options)
<UnifiedRingProgress
  percent={value}
  type="cpu"
  size={50}
  strokeWidth={4}
  showText={true}
  tooltipText="CPU Usage"
  icon={<WhhCpu />}
  // New optional features:
  loading={isLoading}
  error={hasError}
  warningThreshold={75}
  dangerThreshold={85}
  animationDuration={500}
/>
```

### 2. TinyRingProgressDeviceGraph → RingProgressWithData
The new `RingProgressWithData` handles data fetching automatically:

```tsx
// Old
<TinyRingProgressDeviceGraph
  type={StatsType.DeviceStatsType.CPU}
  deviceUuid={device.uuid}
/>

// New (simpler API)
<RingProgressWithData
  type={StatsType.DeviceStatsType.CPU}
  deviceUuid={device.uuid}
  size={50}
  refreshInterval={30000} // Auto refresh every 30s
  onDataFetch={(value, date) => console.log(`Updated: ${value}% at ${date}`)}
/>
```

### 3. TinyRingProgressDeviceIndicator → CountDisplay (no change needed)
This component uses `CountDisplay` for showing counts, not percentages. No migration needed.

## New Features in Unified Components

### UnifiedRingProgress
- **Loading state**: Built-in skeleton loader
- **Error state**: Visual indication of errors
- **Custom thresholds**: Configure warning/danger levels
- **Gradient support**: Use gradient colors for the progress
- **Animation control**: Customize animation duration
- **Custom text**: Show custom text instead of percentage

### RingProgressWithData
- **Auto refresh**: Set refresh interval for real-time updates
- **Data callbacks**: Get notified when data is fetched
- **Error handling**: Automatic error messages and retry logic
- **Memoized rendering**: Better performance with React.memo

## Migration Steps

1. **Update imports**:
   ```tsx
   // Old
   import CustomRingProgress from '@/components/Charts/CustomRingProgress';
   import TinyRingProgressDeviceGraph from '@/components/Charts/TinyRingProgressDeviceGraph';
   
   // New
   import UnifiedRingProgress from '@/components/Charts/UnifiedRingProgress';
   import RingProgressWithData from '@/components/Charts/RingProgressWithData';
   ```

2. **Replace components**: Use find/replace to update component names

3. **Add new props** (optional): Take advantage of new features like loading states and auto-refresh

4. **Test thoroughly**: Ensure visual appearance and behavior match expectations

## Example Usage

### Basic Ring Progress
```tsx
<UnifiedRingProgress
  percent={75}
  type="memory"
  size={60}
  icon={<WhhRam />}
/>
```

### With Data Fetching
```tsx
<RingProgressWithData
  deviceUuid={deviceId}
  type={StatsType.DeviceStatsType.DISK_USED}
  size={80}
  refreshInterval={60000} // 1 minute
/>
```

### Custom Styling
```tsx
<UnifiedRingProgress
  percent={85}
  type="custom"
  strokeColor={{ from: '#108ee9', to: '#87d068' }}
  trackColor="#2d3748"
  hoverTrackColor="#4a5568"
  warningThreshold={80}
  dangerThreshold={95}
/>
```

### With Error Handling
```tsx
<UnifiedRingProgress
  percent={0}
  loading={isLoading}
  error={hasError}
  errorText="Failed"
  tooltipText="Unable to load data"
/>
```

## Benefits of Migration
1. **Consistency**: Single source of truth for ring progress components
2. **Features**: Access to loading states, error handling, and animations
3. **Performance**: Better memoization and optimized re-renders
4. **Maintainability**: Easier to update and extend functionality
5. **Type Safety**: Improved TypeScript types and interfaces