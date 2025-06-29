# Detailed Component Changes

This document outlines specific component changes needed as part of the restructuring plan, identifying components that should be split, merged, or refactored.

## Component Merge Opportunities

### 1. Terminal Components
The terminal functionality is spread across multiple components that should be consolidated:

| Components to Merge | New Location | Justification |
|---------------------|--------------|---------------|
| `Terminal/TerminalCore.tsx` + `Terminal/RemoteSystemInformationTerminal.tsx` | `domains/terminal/components/TerminalBase.tsx` | Both share core terminal functionality; create a base component with specialized implementations |
| `LiveLogs/LiveLogs.tsx` + `LiveLogs/LiveLogsToolbar.tsx` | `domains/terminal/components/live-logs/LiveLogsContainer.tsx` | Combine related UI elements for better cohesion |
| `pages/Devices/DeviceSSHTerminal.tsx` + `pages/Containers/logs/Logs.tsx` | `domains/terminal/components/TerminalViews.tsx` | Share common terminal viewing functionality with device-specific versions |

### 2. Chart Components
Multiple chart components have overlapping functionality:

| Components to Merge | New Location | Justification |
|---------------------|--------------|---------------|
| `Charts/TinyLineDeviceGraph.tsx` + `Charts/TinyRingProgressDeviceGraph.tsx` | `components/ui/data-display/charts/DeviceGraphs.tsx` | Share common data fetching and formatting logic for device metrics |
| `Dashboard/ChartComponents/*` | `components/ui/data-display/charts/` | Consolidate all chart-related components in one location |

### 3. Status Indicators
Status indicators can be merged into a unified system:

| Components to Merge | New Location | Justification |
|---------------------|--------------|---------------|
| `DeviceComponents/DeviceStatusTag.tsx` + `Containers/components/containers/StatusTag.tsx` | `components/ui/status/StatusTag.tsx` | Create a generic status tag with entity-specific extensions |
| `HeaderComponents/HealthWidget.tsx` + `HeaderComponents/UpdateAvailableWidget.tsx` | `layout/header/SystemStatusWidget.tsx` | Combine health monitoring widgets for a unified system status display |

## Component Split Opportunities

### 1. PlaybookExecution Components
Current implementations combine too many responsibilities:

| Component to Split | New Components | Justification |
|-------------------|--------------------|---------------|
| `PlaybookExecutionModal/PlaybookExecutionHandler.ts` | `domains/playbooks/hooks/usePlaybookExecution.ts` + `domains/playbooks/services/playbookExecutionService.ts` | Separate UI state management from core execution logic |
| `PlaybookExecutionModal/TaskStatusTimeline.tsx` | `domains/playbooks/components/execution/TaskStatus.tsx` + `domains/playbooks/components/execution/Timeline.tsx` | Split rendering from status management |

### 2. Device Component Refactoring
Device components need more granular separation:

| Component to Split | New Components | Justification |
|-------------------|--------------------|---------------|
| `DeviceComponents/DeviceInformation/DeviceInformationModal.tsx` | `domains/devices/components/information/InformationModal.tsx` + specific information section components | Break into more manageable, focused components |
| `NewDeviceModal/NewDeviceModal.tsx` | `domains/devices/components/new-device/WizardContainer.tsx` + step-specific components | Separate wizard container from individual steps |

### 3. Form Components
Form components need cleaner separation:

| Component to Split | New Components | Justification |
|-------------------|--------------------|---------------|
| `DeviceConfiguration/SSHConnectionFormElements.tsx` | `domains/devices/components/configuration/ssh/SSHAuthForm.tsx` + `domains/devices/components/configuration/ssh/SSHConnectionForm.tsx` | Split authentication from connection details |
| `pages/Containers/components/sub-components/deploy-configuration-forms/` | Multiple specific configuration form components | Break monolithic forms into focused configuration sections |

## Domain-Specific Component Reorganization

### 1. Devices Domain

```
/domains/devices/
├── components/
│   ├── actions/                   # Quick actions, context menus
│   ├── configuration/             # Device configuration UI components
│   │   ├── capability/
│   │   ├── diagnostic/
│   │   ├── docker/
│   │   ├── proxmox/
│   │   └── ssh/
│   ├── information/               # Device information display
│   ├── logos/                     # OS and device logos
│   │   ├── CPULogo.tsx
│   │   ├── DeviceLogos.tsx
│   │   └── OsLogo.tsx
│   ├── new-device/                # New device wizard
│   ├── sftp/                      # SFTP functionality
│   ├── software/                  # Software version components
│   └── status/                    # Status indicators
├── hooks/                         # Device-specific hooks
└── utils/                         # Device-specific utilities
```

### 2. Containers Domain

```
/domains/containers/
├── components/
│   ├── actions/                   # Container actions (start, stop, etc.)
│   ├── compose-editor/            # Docker compose editor
│   │   ├── builder/
│   │   ├── menu/
│   │   └── visualization/
│   ├── details/                   # Container details 
│   │   ├── metrics/
│   │   ├── logs/
│   │   └── configuration/
│   ├── deploy/                    # Deployment forms
│   ├── list/                      # Container list components
│   └── status/                    # Status indicators
├── hooks/                         # Container-specific hooks
└── utils/                         # Container-specific utilities
```

### 3. Terminal Domain

```
/domains/terminal/
├── components/
│   ├── base/                      # Base terminal components
│   │   ├── TerminalCore.tsx       # Core terminal functionality
│   │   └── TerminalControls.tsx   # Terminal control components
│   ├── live-logs/                 # Live log components
│   ├── ssh/                       # SSH terminal components
│   └── remote-system/             # Remote system info terminal
├── hooks/                         # Terminal hooks (useTerminal)
└── utils/                         # Terminal utilities
```

## UI Components Reorganization

```
/components/ui/
├── cards/                         # Card components
├── data-display/                  # Data visualization
│   ├── charts/                    # Chart components
│   ├── tables/                    # Table components
│   └── statistics/                # Statistic displays
├── feedback/                      # User feedback components
│   ├── alerts/                    # Alert components
│   ├── messages/                  # Message components
│   └── progress/                  # Progress indicators
├── forms/                         # Form components
├── icons/                         # Icon components
├── inputs/                        # Input components
├── loaders/                       # Loading components
├── modals/                        # Modal components
├── navigation/                    # Navigation components
├── tabs/                          # Tab components
└── typography/                    # Typography components
```

## Layout Components Reorganization

```
/layout/
├── app/                           # App layout components
├── empty-states/                  # Empty state components
├── footer/                        # Footer components
├── header/                        # Header components
│   ├── notifications/             # Notification components
│   ├── user/                      # User-related components
│   └── widgets/                   # Header widget components
└── sidebars/                      # Sidebar components
```

## Specific Component Implementation Changes

### Status Tag Abstraction

Create a generic status tag that can be used for both devices and containers:

```tsx
// components/ui/status/StatusTag.tsx
import { Tag } from 'antd';
import React from 'react';

export type StatusTagProps = {
  status: string | number;
  statusMap: Record<string | number, { color: string; label: string }>;
};

const StatusTag: React.FC<StatusTagProps> = ({ status, statusMap }) => {
  const statusInfo = statusMap[status];

  const tagStyle: React.CSSProperties = {
    color: '#FFFFFF',
    fontWeight: 500,
  };

  return statusInfo ? (
    <Tag bordered={false} color={statusInfo.color} style={tagStyle}>
      {statusInfo.label}
    </Tag>
  ) : null;
};

export default StatusTag;
```

Then create extensions:

```tsx
// domains/devices/components/status/DeviceStatusTag.tsx
import StatusTag from '@/components/ui/status/StatusTag';
import DeviceStatus from '@/utils/devicestatus';
import React from 'react';

export type DeviceStatusTagProps = {
  status: number;
};

// Device-specific status map
const deviceStatusMap: Record<number, { color: string; label: string }> = {
  [DeviceStatus.REGISTERING]: { color: '#DD6B20', label: 'Registering' },
  [DeviceStatus.ONLINE]: { color: '#38A169', label: 'Online' },
  [DeviceStatus.OFFLINE]: { color: '#E53E3E', label: 'Down' },
  [DeviceStatus.UNMANAGED]: { color: '#4A5568', label: 'Unmanaged' },
};

const DeviceStatusTag: React.FC<DeviceStatusTagProps> = ({ status }) => {
  return <StatusTag status={status} statusMap={deviceStatusMap} />;
};

export default DeviceStatusTag;
```

### Terminal Core Hook

Create a hook for terminal functionality:

```tsx
// domains/terminal/hooks/useTerminal.ts
import { FitAddon } from '@xterm/addon-fit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ITerminalOptions, Terminal } from 'xterm';

export interface UseTerminalOptions extends ITerminalOptions {
  onDataOut?: (value: string) => void;
  onResize?: (rows: number, cols: number) => void;
}

export function useTerminal(options: UseTerminalOptions) {
  const {
    onDataOut,
    onResize,
    rows = Math.ceil(document.body.clientHeight / 16),
    cols = Math.ceil(document.body.clientWidth / 8),
    ...terminalOptions
  } = options;
  
  const [terminalElement, setTerminalElement] = useState<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  
  // Terminal initialization
  useEffect(() => {
    if (!terminalElement) return;
    
    if (!terminalRef.current) {
      terminalRef.current = new Terminal({
        ...terminalOptions,
        rows,
        cols,
      });
      
      fitAddonRef.current = new FitAddon();
      terminalRef.current.loadAddon(fitAddonRef.current);
      
      if (onDataOut) {
        terminalRef.current.onData(onDataOut);
      }
    }
    
    if (!terminalRef.current.element) {
      terminalRef.current.open(terminalElement);
      fitAddonRef.current?.fit();
      terminalRef.current.focus();
    }
    
    return () => {
      // Cleanup if needed
    };
  }, [terminalElement, terminalOptions, rows, cols, onDataOut]);
  
  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (terminalRef.current && fitAddonRef.current) {
        fitAddonRef.current.fit();
        onResize?.(terminalRef.current.rows, terminalRef.current.cols);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onResize]);
  
  const writeToTerminal = useCallback((data: string, newLine = false) => {
    if (!terminalRef.current) return;
    
    if (newLine) {
      terminalRef.current.writeln(data);
    } else {
      terminalRef.current.write(data);
    }
  }, []);
  
  const clearTerminal = useCallback(() => {
    terminalRef.current?.clear();
  }, []);
  
  return {
    terminalRef: setTerminalElement,
    writeToTerminal,
    clearTerminal,
  };
}
```

This would significantly simplify terminal component implementation.

## Migration Priority Order

For implementing these changes, components should be migrated in this order:

1. Core UI components (StatusTag, icons, typography)
2. Chart components (high visibility, relatively self-contained)
3. Terminal components (complex but high value for refactoring)
4. Device components (many components but clear boundaries)
5. Container components
6. Playbook components
7. Layout components

This prioritization ensures that foundational components are available for more specialized components to build upon.