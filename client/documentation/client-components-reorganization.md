# Client Components Reorganization Plan

This document outlines a comprehensive plan to reorganize the client-side component structure. The goals of this reorganization are to:

1. Improve separation of concerns
2. Create a more intuitive folder structure for components
3. Increase component reusability 
4. Reduce duplication
5. Make the codebase more maintainable

## Table of Contents

- [New Folder Structure](#new-folder-structure)
- [Component Migration Details](#component-migration-details)
  - [UI Components](#ui-components)
  - [Domain Modules](#domain-modules)
  - [Layout Components](#layout-components)
- [Asset Management](#asset-management)
- [Types Organization](#types-organization)
- [Migration Strategy](#migration-strategy)

## New Folder Structure

```
/src
├── assets/                      # Static assets, icons, etc.
├── components/                  # Shared reusable components
│   ├── ui/                      # Pure UI components
│   └── common/                  # Cross-domain shared components
├── domains/                     # Domain-specific modules
│   ├── devices/
│   ├── containers/
│   ├── playbooks/
│   ├── automations/
│   ├── terminal/
│   └── admin/
├── hooks/                       # Custom React hooks
├── layout/                      # App layout components
├── pages/                       # Page components (UNCHANGED)
├── services/                    # API and other services (UNCHANGED)
├── store/                       # State management
├── styles/                      # Global styles and theme
├── types/                       # Type definitions
└── utils/                       # Utility functions
```

> **Important Note**: The `pages/` directory structure will remain unchanged to maintain compatibility with the routes defined in `client/config/routes.ts`.

## Component Migration Details

### UI Components

All basic UI components will be moved to `/src/components/ui/`:

| Current Location | New Location | Component | Description |
|------------------|--------------|-----------|-------------|
| `components/Layout/ModalStyledTabs.tsx` | `components/ui/tabs/StyledTabs.tsx` | `StyledTabs` | Styled tabs for modal use |
| `components/Layout/StyledTabContainer.tsx` | `components/ui/tabs/TabContainer.tsx` | `TabContainer` | Container for tabs |
| `components/Alert/AlertNotification.tsx` | `components/ui/feedback/Alert.tsx` | `Alert` | Alert notification component |
| `components/Message/DynamicMessage.tsx` | `components/ui/feedback/Message.tsx` | `Message` | Dynamic message component |
| `components/Template/CardHeader.tsx` | `components/ui/cards/CardHeader.tsx` | `CardHeader` | Reusable card header |
| `components/Template/Title.tsx` | `components/ui/typography/Title.tsx` | `Title` | Title component |
| `components/FullScreenLoader/FullScreenLoader.tsx` | `components/ui/loaders/FullScreenLoader.tsx` | `FullScreenLoader` | Full screen loading component |
| `components/Icons/CustomIcons.tsx` | `components/ui/icons/index.tsx` | Multiple icons | Centralized icon exports |
| `components/Indicators/CountDisplay.tsx` | `components/ui/data-display/CountDisplay.tsx` | `CountDisplay` | Count indicator component |

#### Chart Components

All chart components will be consolidated under `components/ui/data-display/charts/`:

| Current Location | New Location | Component |
|------------------|--------------|-----------|
| `components/Charts/CustomRingProgress.tsx` | `components/ui/data-display/charts/RingProgress.tsx` | `RingProgress` |
| `components/Charts/TinyLineDeviceGraph.tsx` | `components/ui/data-display/charts/TinyLineGraph.tsx` | `TinyLineGraph` |
| `components/Charts/TinyRingProgressDeviceGraph.tsx` | `components/ui/data-display/charts/TinyRingGraph.tsx` | `TinyRingGraph` |
| `components/Charts/TinyRingProgressDeviceIndicator.tsx` | `components/ui/data-display/charts/RingIndicator.tsx` | `RingIndicator` |
| `pages/Dashboard/ChartComponents/ChartCard.tsx` | `components/ui/data-display/charts/ChartCard.tsx` | `ChartCard` |
| `pages/Dashboard/ChartComponents/Field.tsx` | `components/ui/data-display/charts/Field.tsx` | `Field` |
| `pages/Dashboard/ChartComponents/MiniProgress.tsx` | `components/ui/data-display/charts/MiniProgress.tsx` | `MiniProgress` |
| `pages/Dashboard/ChartComponents/Trend.tsx` | `components/ui/data-display/charts/Trend.tsx` | `Trend` |

### Domain Modules

#### Device Module (`/src/domains/devices/`)

| Current Location | New Location | Component | Description |
|------------------|--------------|-----------|-------------|
| `components/DeviceComponents/DeviceStatusTag.tsx` | `domains/devices/components/DeviceStatusTag.tsx` | `DeviceStatusTag` | Device status indicator |
| `components/DeviceComponents/CPULogo.tsx` | `domains/devices/components/logos/CPULogo.tsx` | `CPULogo` | CPU logo component |
| `components/DeviceComponents/DeviceLogos.tsx` | `domains/devices/components/logos/DeviceLogos.tsx` | `DeviceLogos` | Device logos component |
| `components/DeviceComponents/OsLogo/OsLogo.tsx` | `domains/devices/components/logos/OsLogo.tsx` | `OsLogo` | OS logo component |
| `components/DeviceComponents/OsLogo/img/*` | `assets/images/os-logos/*` | Image assets | OS logo images |
| `components/DeviceComponents/OSSoftwaresVersions/*` | `domains/devices/components/software/` | Multiple components | OS software version components |
| `components/NewDeviceModal/*` | `domains/devices/components/new-device/` | Multiple components | New device modal components |
| `components/DeviceConfiguration/*` | `domains/devices/components/configuration/` | Multiple components | Device configuration components |
| `components/DeviceComponents/DeviceQuickAction/*` | `domains/devices/components/actions/` | Multiple components | Device quick actions |
| `components/DeviceComponents/SFTPDrawer/*` | `domains/devices/components/sftp/` | Multiple components | SFTP drawer components |
| `components/DeviceComponents/DeviceInformation/*` | `domains/devices/components/information/` | Multiple components | Device information display |

#### Container Module (`/src/domains/containers/`)

| Current Location | New Location | Component | Description |
|------------------|--------------|-----------|-------------|
| `components/ContainerComponents/*` | `domains/containers/components/` | Multiple components | Container-related components |
| `components/ComposeEditor/*` | `domains/containers/compose-editor/` | Multiple components | Docker compose editor components |
| `pages/Containers/components/*` | `domains/containers/components/` | Multiple components | Container page components |
| `pages/Containers/components/containers/*` | `domains/containers/components/details/` | Multiple components | Container details components |
| `pages/Containers/components/sub-components/*` | `domains/containers/components/actions/` | Multiple components | Container action modals |

#### Playbook Module (`/src/domains/playbooks/`)

| Current Location | New Location | Component | Description |
|------------------|--------------|-----------|-------------|
| `components/PlaybookSelection/*` | `domains/playbooks/components/selection/` | Multiple components | Playbook selection components |
| `components/PlaybookExecutionModal/*` | `domains/playbooks/components/execution/` | Multiple components | Playbook execution modal |
| `pages/Playbooks/components/*` | `domains/playbooks/components/` | Multiple components | Playbook page components |

#### Automation Module (`/src/domains/automations/`)

| Current Location | New Location | Component | Description |
|------------------|--------------|-----------|-------------|
| `pages/Automations/components/*` | `domains/automations/components/` | Multiple components | Automation components |
| `pages/Automations/components/Drawer/*` | `domains/automations/components/drawer/` | Multiple components | Automation drawer components |

#### Terminal Module (`/src/domains/terminal/`)

| Current Location | New Location | Component | Description |
|------------------|--------------|-----------|-------------|
| `components/Terminal/TerminalCore.tsx` | `domains/terminal/components/TerminalCore.tsx` | `TerminalCore` | Core terminal component |
| `components/Terminal/RemoteSystemInformationTerminal.tsx` | `domains/terminal/components/RemoteSystemInfoTerminal.tsx` | `RemoteSystemInfoTerminal` | Remote system info terminal |
| `components/LiveLogs/*` | `domains/terminal/components/live-logs/` | Multiple components | Live logs components |

#### Registry Module (`/src/domains/registry/`)

| Current Location | New Location | Component | Description |
|------------------|--------------|-----------|-------------|
| `components/RegistryComponents/RegistryLogo.tsx` | `domains/registry/components/RegistryLogo.tsx` | `RegistryLogo` | Registry logo component |
| `pages/Admin/Settings/components/RegistrySettings.tsx` | `domains/registry/components/RegistrySettings.tsx` | `RegistrySettings` | Registry settings component |
| `pages/Admin/Settings/components/subcomponents/RegistryModal.tsx` | `domains/registry/components/RegistryModal.tsx` | `RegistryModal` | Registry modal component |

#### Plugin Module (`/src/domains/plugins/`)

| Current Location | New Location | Component | Description |
|------------------|--------------|-----------|-------------|
| `pages/Plugins/components/*` | `domains/plugins/components/` | Multiple components | Plugin components |
| `plugins/components/*` | `domains/plugins/system/` | Multiple files | Plugin system components |

### Layout Components

All layout components will be moved to `/src/layout/`:

| Current Location | New Location | Component | Description |
|------------------|--------------|-----------|-------------|
| `components/HeaderComponents/*` | `layout/header/` | Multiple components | Header components |
| `components/Footer/*` | `layout/footer/` | `Footer` | Footer component |
| `components/NoDevice/*` | `layout/empty-states/` | Multiple components | Empty state components |

### Asset Management

All assets will be consolidated under `/src/assets/`:

| Current Location | New Location | Asset Type |
|------------------|--------------|------------|
| `components/DeviceComponents/OsLogo/img/*` | `assets/images/os-logos/` | OS logo images |
| `public/lotties/*` | `assets/animations/` | Lottie animations |
| `public/avatars/*` | `assets/images/avatars/` | Avatar images |
| `public/images/*` | `assets/images/` | General images |
| `public/squirrels/*` | `assets/images/mascots/` | Mascot images |

## Types Organization

All types will be consolidated under `/src/types/` with domain-specific subfolders:

| Current Type | New Location | Description |
|--------------|--------------|-------------|
| Device types | `types/devices/` | Device-related types |
| Container types | `types/containers/` | Container-related types |
| Playbook types | `types/playbooks/` | Playbook-related types |
| Automation types | `types/automations/` | Automation-related types |
| Plugin types | `types/plugins/` | Plugin-related types |
| API types | `types/api/` | API-related types |
| Common types | `types/common/` | Shared types |

## Migration Strategy

The migration will follow this phased approach:

1. **Phase 1: Create new folder structure**
   - Create all new directories
   - Set up scaffolding for new organization

2. **Phase 2: Migrate UI components first**
   - Move basic UI components to new locations
   - Update all imports throughout the codebase
   - Run tests to ensure functionality is maintained

3. **Phase 3: Migrate domain components**
   - Start with one domain module at a time
   - Begin with the Device module as it has the most components
   - Update imports and ensure tests pass for each module

4. **Phase 4: Migrate remaining components**
   - Move layout components
   - Update page components to use new component imports
   - Ensure all pages continue to function correctly

5. **Phase 5: Asset migration**
   - Reorganize assets into the new structure
   - Update all asset references

6. **Phase 6: Final cleanup**
   - Remove legacy directories and files
   - Consolidate types and utilities
   - Run comprehensive tests to ensure no regression

Throughout the migration, we'll maintain a compatibility layer to ensure that the application continues to function while the reorganization is in progress.