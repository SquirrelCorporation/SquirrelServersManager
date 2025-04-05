# CLIENT ARCHITECTURE TARGET

## Architecture Overview

The Squirrel Servers Manager (SSM) client architecture is built on modern React practices and leverages the powerful UmiJS Max framework with Ant Design Pro components. This document outlines the target architecture that combines the best of these technologies with custom enhancements for our specific needs.

### Core Technologies

- **React 18+**: For building the user interface with the latest features
- **UmiJS Max**: As the framework providing routing, state management, and other core capabilities
- **Ant Design Pro**: For enterprise-level UI components and design patterns
- **TypeScript**: For type safety and better developer experience
- **Plugin System**: For extensibility and modular feature development

### Key Architectural Principles

1. **Component-Based Architecture**: Everything is a component with clear responsibilities
2. **Modular Design**: Features are organized into self-contained modules
3. **Separation of Concerns**: UI, business logic, and data access are clearly separated
4. **Type Safety**: Comprehensive TypeScript typing throughout the application
5. **Extensibility**: Plugin system allows for feature extensions without modifying core code
6. **Testability**: Architecture designed with testing in mind

### UmiJS Max Capabilities

The architecture leverages these key UmiJS Max capabilities:

- **Data Flow Management**: Using the Model system based on React hooks
- **Request Module**: Based on axios and ahooks' useRequest for API communication
- **Dva Integration**: For complex state management scenarios (Redux + Saga)
- **Routing System**: Declarative routing with access control
- **Internationalization**: Built-in i18n support for multi-language capabilities
- **OpenAPI Integration**: For automatic API client generation

## Project Structure

The target project structure follows Ant Design Pro v5 and UmiJS Max best practices, with enhancements for our specific needs:

```
client/
├── config/                  # UmiJS configuration
│   ├── config.ts           # Base configuration
│   ├── defaultSettings.ts  # Default settings for Pro components
│   ├── proxy.ts            # Proxy configuration for development
│   └── routes.ts           # Application routes
├── mock/                    # Mock data for development
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images, icons, and other static assets
│   ├── components/          # Shared UI components
│   │   ├── common/          # Common UI components (buttons, inputs, etc.)
│   │   ├── layout/          # Layout components (headers, footers, etc.)
│   │   └── domain/          # Domain-specific reusable components
│   ├── hooks/               # Shared custom hooks
│   │   ├── useAuth.ts       # Authentication hook
│   │   ├── useBreakpoint.ts # Responsive design hook
│   │   └── useSettings.ts   # Application settings hook
│   ├── layouts/             # Application layouts
│   │   ├── BasicLayout/     # Main application layout
│   │   └── UserLayout/      # User-related layout (login, etc.)
│   ├── locales/             # Internationalization resources
│   │   ├── en-US/           # English translations
│   │   └── zh-CN/           # Chinese translations (if needed)
│   ├── models/              # Global models for state management
│   │   ├── global.ts        # Global application state
│   │   ├── user.ts          # User state management
│   │   └── settings.ts      # Application settings state
│   ├── pages/               # Application pages
│   │   ├── Dashboard/       # Dashboard page
│   │   │   ├── components/  # Dashboard-specific components
│   │   │   ├── models/     # Dashboard-specific models
│   │   │   ├── index.tsx    # Main dashboard component
│   │   │   └── index.less   # Dashboard styles
│   │   ├── Devices/         # Devices management feature
│   │   ├── Containers/      # Containers management feature
│   │   ├── Playbooks/       # Playbooks management feature
│   │   ├── User/            # User-related pages (login, etc.)
│   │   └── 404.tsx          # 404 page
│   ├── plugins/             # Plugin system
│   │   ├── api/             # Plugin API interfaces
│   │   ├── components/      # Plugin UI components
│   │   ├── contexts/        # Plugin context providers
│   │   ├── hooks/           # Plugin hooks
│   │   ├── registry/        # Plugin registration system
│   │   ├── types/           # Plugin type definitions
│   │   └── utils/           # Plugin utilities
│   ├── services/            # API services
│   │   ├── api/             # Auto-generated API clients
│   │   ├── rest/            # REST API services
│   │   └── typings.d.ts     # TypeScript definitions for API
│   ├── utils/               # Utility functions
│   │   ├── request.ts       # Request utility
│   │   ├── utils.ts         # General utilities
│   │   └── authority.ts     # Authority-related utilities
│   ├── access.ts            # Access control configuration
│   ├── app.tsx              # Application configuration
│   ├── global.less          # Global styles
│   ├── global.tsx           # Global scripts
│   └── typings.d.ts         # Global TypeScript definitions
├── tests/                   # Test files
│   ├── e2e/                 # End-to-end tests
│   ├── unit/                # Unit tests
│   ├── mocks/               # Test mocks
│   └── setupTests.ts       # Test setup
├── .editorconfig           # Editor configuration
├── .eslintrc.js            # ESLint configuration
├── .prettierrc.js          # Prettier configuration
├── vitest.config.ts        # Vitest configuration
├── package.json            # Project dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

### Key Structural Features

1. **Feature-Based Organization**: Each major feature has its own directory with components, models, and services
2. **Clear Component Hierarchy**: Components are organized by their scope and reusability
3. **Centralized State Management**: Global state in models directory, feature-specific state in feature directories
4. **Modular Plugin System**: Well-structured plugin system with clear separation of concerns
5. **Comprehensive Testing Structure**: Dedicated directories for different types of tests

## State Management Architecture

The state management architecture follows a layered approach, leveraging UmiJS Max's built-in capabilities while providing clear patterns for different types of state.

### State Management Layers

1. **Global Application State**: Managed through UmiJS initialState and global models
2. **Feature-Specific State**: Managed through feature-level models
3. **Component State**: Managed through React's useState and useReducer hooks
4. **Server State**: Managed through UmiJS useRequest hook

### Global State Management

Global state is managed using UmiJS's initialState and model system:

```typescript
// src/app.ts - Global initial state
import { queryCurrentUser } from '@/services/rest/user';
import { API } from 'ssm-shared-lib';

export async function getInitialState() {
  try {
    // Fetch user info on application startup
    const currentUser = await queryCurrentUser();

    return {
      currentUser,
      settings: { ...defaultSettings },
      // Other global state
    };
  } catch (error) {
    console.error('Failed to fetch initial state:', error);
    return {
      currentUser: undefined,
      settings: defaultSettings,
    };
  }
}
```

### Feature-Specific State Management

Feature-specific state is managed using UmiJS's model system with React hooks:

```typescript
// src/pages/Devices/models/useDeviceModel.ts
import { useState, useCallback } from 'react';
import { useRequest } from '@umijs/max';
import { getDevices, getDeviceById } from '@/services/rest/device';

export default function useDeviceModel() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  // Data fetching with automatic loading state
  const { data: devices, loading, error, refresh } = useRequest(getDevices, {
    cacheKey: 'devices-list', // Enable caching
  });

  const { data: selectedDevice } = useRequest(
    () => (selectedDeviceId ? getDeviceById(selectedDeviceId) : null),
    { refreshDeps: [selectedDeviceId], ready: !!selectedDeviceId }
  );

  const selectDevice = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId);
  }, []);

  return {
    devices,
    selectedDevice,
    loading,
    error,
    selectDevice,
    refreshDevices: refresh
  };
};
```

### Complex State Management with Dva

For more complex state management scenarios, the architecture uses Dva (Redux + Saga):

```typescript
// src/models/devices.ts - Dva model for complex state
import { Effect, Reducer } from '@umijs/max';
import { getDevices, getDeviceById } from '@/services/rest/device';
import type { API } from 'ssm-shared-lib';

export interface DevicesModelState {
  list: API.Device[];
  selectedDevice: API.Device | null;
  loading: boolean;
  filters: Record<string, any>;
}

export interface DevicesModelType {
  namespace: 'devices';
  state: DevicesModelState;
  effects: {
    fetchDevices: Effect;
    fetchDevice: Effect;
    applyFilters: Effect;
  };
  reducers: {
    saveDevices: Reducer<DevicesModelState>;
    saveDevice: Reducer<DevicesModelState>;
    setLoading: Reducer<DevicesModelState>;
    updateFilters: Reducer<DevicesModelState>;
  };
}

const DevicesModel: DevicesModelType = {
  namespace: 'devices',

  state: {
    list: [],
    selectedDevice: null,
    loading: false,
    filters: {},
  },

  effects: {
    *fetchDevices({ payload }, { call, put, select }) {
      yield put({ type: 'setLoading', payload: true });
      try {
        const filters = yield select(state => state.devices.filters);
        const response = yield call(getDevices, { ...filters, ...payload });
        yield put({
          type: 'saveDevices',
          payload: response.data,
        });
      } finally {
        yield put({ type: 'setLoading', payload: false });
      }
    },
    *fetchDevice({ payload: id }, { call, put }) {
      yield put({ type: 'setLoading', payload: true });
      try {
        const response = yield call(getDeviceById, id);
        yield put({
          type: 'saveDevice',
          payload: response.data,
        });
      } finally {
        yield put({ type: 'setLoading', payload: false });
      }
    },
    *applyFilters({ payload }, { put }) {
      yield put({ type: 'updateFilters', payload });
      yield put({ type: 'fetchDevices', payload: {} });
    },
  },

  reducers: {
    saveDevices(state, { payload }) {
      return {
        ...state,
        list: payload,
      };
    },
    saveDevice(state, { payload }) {
      return {
        ...state,
        selectedDevice: payload,
      };
    },
    setLoading(state, { payload }) {
      return {
        ...state,
        loading: payload,
      };
    },
    updateFilters(state, { payload }) {
      return {
        ...state,
        filters: {
          ...state.filters,
          ...payload,
        },
      };
    },
  },
};

export default DevicesModel;
```

### Accessing State in Components

Components access state using the useModel hook with performance optimizations:

```typescript
// Example component using state management
import React from 'react';
import { useModel } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';

const DevicesPage: React.FC = () => {
  // Only re-render when these specific properties change
  const { devices, loading, refreshDevices } = useModel('deviceModel', (model) => ({
    devices: model.devices,
    loading: model.loading,
    refreshDevices: model.refreshDevices
  }));

  // Access global initial state
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  return (
    <PageContainer>
      <ProTable
        headerTitle="Devices"
        dataSource={devices}
        loading={loading}
        // Other props
      />
    </PageContainer>
  );
};

export default DevicesPage;
```

## API Service Layer Architecture

The API service layer is designed to provide a consistent, type-safe interface for communicating with backend services. It leverages UmiJS Max's built-in request module and OpenAPI integration.

### API Layer Structure

1. **Base Request Configuration**: Centralized request configuration with error handling
2. **API Type Definitions**: Comprehensive TypeScript types for API requests and responses
3. **Service Functions**: Domain-specific API service functions
4. **OpenAPI Integration**: Automatic API client generation from OpenAPI specifications

### Request Configuration

The base request configuration provides consistent error handling and request/response processing:

```typescript
// src/app.ts - Request configuration
import { message, notification } from 'antd';
import type { RequestConfig } from '@umijs/max';
import { history } from '@umijs/max';

// Error code type for standardized error handling
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}

// Response structure
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: string;
  errorMessage?: string;
  showType?: ErrorShowType;
}

export const request: RequestConfig = {
  timeout: 10000,
  errorConfig: {
    // Custom error throwing
    errorThrower: (res: ResponseStructure) => {
      const { success, data, errorCode, errorMessage, showType } = res;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error;
      }
    },
    // Custom error handling
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;

      // Business errors thrown by errorThrower
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode, showType } = errorInfo;

          switch (showType) {
            case ErrorShowType.SILENT:
              // Do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                message: errorCode,
                description: errorMessage,
              });
              break;
            case ErrorShowType.REDIRECT:
              // Handle redirect, e.g., to login page
              history.push('/user/login');
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios error handling
        const status = error.response.status;
        if (status === 401) {
          message.error('Unauthorized, please login again');
          history.push('/user/login');
        } else if (status === 403) {
          message.error('Forbidden access');
        } else if (status >= 500) {
          message.error('Server error, please try again later');
        } else {
          message.error(`Request failed with status: ${status}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        message.error('Network error, please check your connection');
      } else {
        // Something happened in setting up the request
        message.error('Request error, please try again');
      }
    },
  },
  requestInterceptors: [
    (config) => {
      // Add auth token to headers
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
      }
      return config;
    },
  ],
  responseInterceptors: [
    (response) => {
      // Process successful responses
      return response;
    },
  ],
};
```

### API Type Definitions

API types are defined using TypeScript interfaces for type safety:

```typescript
// src/services/typings.d.ts
declare namespace API {
  interface Response<T = any> {
    success: boolean;
    data: T;
    errorCode?: string;
    errorMessage?: string;
    showType?: number;
  }

  // Device-related types
  interface Device {
    id: string;
    name: string;
    ip: string;
    status: string;
    // Other device properties
  }

  interface DeviceCreateDto {
    name: string;
    ip: string;
    // Other creation properties
  }

  interface DeviceUpdateDto {
    name?: string;
    ip?: string;
    // Other update properties
  }

  // Other API types
}
```

### Service Functions

Domain-specific API services are organized by feature:

```typescript
// src/services/rest/device.ts
import { request } from '@umijs/max';
import type { API } from '@/services/typings';

/** Get device list - GET /api/devices */
export async function getDevices(params?: { name?: string; status?: string }) {
  return request<API.Response<API.Device[]>>('/api/devices', {
    method: 'GET',
    params,
  });
}

/** Get device by ID - GET /api/devices/${id} */
export async function getDeviceById(id: string) {
  return request<API.Response<API.Device>>(`/api/devices/${id}`);
}

/** Create device - POST /api/devices */
export async function createDevice(data: API.DeviceCreateDto) {
  return request<API.Response<API.Device>>('/api/devices', {
    method: 'POST',
    data,
  });
}

/** Update device - PUT /api/devices/${id} */
export async function updateDevice(id: string, data: API.DeviceUpdateDto) {
  return request<API.Response<API.Device>>(`/api/devices/${id}`, {
    method: 'PUT',
    data,
  });
}

/** Delete device - DELETE /api/devices/${id} */
export async function deleteDevice(id: string) {
  return request<API.Response<void>>(`/api/devices/${id}`, {
    method: 'DELETE',
  });
}
```

### OpenAPI Integration

OpenAPI integration automatically generates API clients from OpenAPI specifications:

```typescript
// config/config.ts
import { defineConfig } from '@umijs/max';
import { join } from 'path';

export default defineConfig({
  // ... other configurations
  openAPI: {
    requestLibPath: "import { request } from '@umijs/max'",
    // Use OpenAPI specification from the server
    schemaPath: 'http://localhost:3000/api-docs/swagger.json',
    // OR use local file
    // schemaPath: join(__dirname, 'api-docs.json'),
    mock: false,
    projectName: 'api',
  },
});
```

### Using API Services in Components

Components use the API services with the useRequest hook for data fetching:

```typescript
// Example component using API services
import React from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { Button, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getDevices, deleteDevice } from '@/services/rest/device';
import type { ProColumns } from '@ant-design/pro-components';
import type { API } from '@/services/typings';

const DevicesPage: React.FC = () => {
  // Data fetching with caching and automatic loading state
  const { data, loading, refresh } = useRequest(getDevices, {
    cacheKey: 'devices-list',
  });

  // Action with manual triggering
  const { run: runDelete, loading: deleteLoading } = useRequest(deleteDevice, {
    manual: true,
    onSuccess: () => {
      message.success('Device deleted successfully');
      refresh(); // Refresh the data
    },
    onError: (error) => {
      message.error(`Failed to delete device: ${error.message}`);
    },
  });

  const columns: ProColumns<API.Device>[] = [
    // Column definitions
  ];

  return (
    <PageContainer>
      <ProTable<API.Device>
        headerTitle="Devices"
        rowKey="id"
        dataSource={data?.data}
        loading={loading}
        columns={columns}
        // Other props
      />
    </PageContainer>
  );
};

export default DevicesPage;
```

## Plugin System Architecture

The plugin system provides a flexible, extensible architecture that allows for adding new features without modifying the core application code.
### Plugin System Components

1. **Plugin Registry**: Central registry for managing plugins
2. **Plugin Types**: TypeScript interfaces for plugin structure
3. **Plugin Context**: React context for plugin state and management
4. **Slot System**: Extension points for plugins to render content
5. **Plugin Lifecycle**: Hooks for plugin initialization and cleanup

### Plugin Registry

```typescript
// src/plugins/registry/pluginRegistry.ts
import type { Plugin, PluginMetadata } from '../types';

class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private slots: Map<string, Set<Plugin>> = new Map();
  private hooks: Map<string, Set<((...args: any[]) => any)>> = new Map();

  registerPlugin(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin with ID ${plugin.id} is already registered`);
      return;
    }

    this.plugins.set(plugin.id, plugin);

    // Register plugin slots
    if (plugin.slots) {
      for (const slot of plugin.slots) {
        if (!this.slots.has(slot)) {
          this.slots.set(slot, new Set());
        }
        this.slots.get(slot)?.add(plugin);
      }
    }

    // Initialize plugin if it has an initialize method
    if (typeof plugin.initialize === 'function') {
      plugin.initialize();
    }
  }

  unregisterPlugin(id: string): void {
    const plugin = this.plugins.get(id);
    if (!plugin) return;

    // Remove from slots
    if (plugin.slots) {
      for (const slot of plugin.slots) {
        this.slots.get(slot)?.delete(plugin);
      }
    }

    // Cleanup plugin if it has a cleanup method
    if (typeof plugin.cleanup === 'function') {
      plugin.cleanup();
    }

    this.plugins.delete(id);
  }

  getPlugin(id: string): Plugin | undefined {
    return this.plugins.get(id);
  }

  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getPluginsForSlot(slotName: string): Plugin[] {
    return Array.from(this.slots.get(slotName) || []);
  }

  // Event system for plugins to communicate
  on(event: string, callback: (...args: any[]) => any): void {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, new Set());
    }
    this.hooks.get(event)?.add(callback);
  }

  off(event: string, callback: (...args: any[]) => any): void {
    this.hooks.get(event)?.delete(callback);
  }

  emit(event: string, ...args: any[]): void {
    const callbacks = this.hooks.get(event) || new Set();
    for (const callback of callbacks) {
      callback(...args);
    }
  }
}

// Singleton instance
export const pluginRegistry = new PluginRegistry();
```

### Plugin Types

```typescript
// src/plugins/types/index.ts
import type { ReactNode } from 'react';

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  enabled: boolean;
  dependencies?: string[];
  permissions?: string[];
}

export interface SlotProps {
  slotName: string;
  [key: string]: any;
}

export interface Plugin {
  id: string;
  metadata: PluginMetadata;
  slots?: string[];
  initialize?: () => Promise<void> | void;
  cleanup?: () => Promise<void> | void;
  renderSlot?: (slotName: string, props?: any) => ReactNode | null;
  // Add any other plugin methods and properties
}

// Define slot names as constants to avoid typos
export enum SlotName {
  DASHBOARD_WIDGETS = 'dashboard.widgets',
  DEVICE_ACTIONS = 'device.actions',
  CONTAINER_ACTIONS = 'container.actions',
  SETTINGS_PANELS = 'settings.panels',
  HEADER_MENU = 'header.menu',
}
```

### Plugin Context

```typescript
// src/plugins/contexts/plugin-context.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { pluginRegistry } from '../registry/pluginRegistry';
import type { Plugin, PluginMetadata, SlotProps } from '../types';
import { getPlugins } from '@/services/rest/plugin';
import { useModel } from '@umijs/max';

interface PluginContextType {
  pluginRegistry: typeof pluginRegistry;
  pluginMetadata: PluginMetadata[];
  loading: boolean;
  error: Error | null;
  refreshPlugins: () => Promise<void>;
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export const PluginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pluginMetadata, setPluginMetadata] = useState<PluginMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Access global initial state for user permissions
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  const loadPlugins = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPlugins();
      if (response.success) {
        setPluginMetadata(response.data || []);

        // Register plugins
        for (const metadata of response.data || []) {
          if (metadata.enabled) {
            // Check if user has permission to use this plugin
            const hasPermission = !metadata.permissions ||
              metadata.permissions.every(permission =>
                currentUser?.permissions?.includes(permission)
              );

            if (hasPermission) {
              // Dynamic import of plugin module
              try {
                const pluginModule = await import(`../implementations/${metadata.id}`);
                const plugin: Plugin = {
                  id: metadata.id,
                  metadata,
                  ...pluginModule.default,
                };
                pluginRegistry.registerPlugin(plugin);
              } catch (err) {
                console.error(`Failed to load plugin ${metadata.id}:`, err);
              }
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load plugins'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlugins();

    // Cleanup on unmount
    return () => {
      // Unregister all plugins
      for (const plugin of pluginRegistry.getPlugins()) {
        pluginRegistry.unregisterPlugin(plugin.id);
      }
    };
  }, []);

  return (
    <PluginContext.Provider
      value={{
        pluginRegistry,
        pluginMetadata,
        loading,
        error,
        refreshPlugins: loadPlugins,
      }}
    >
      {children}
    </PluginContext.Provider>
  );
};

export const usePlugins = () => {
  const context = useContext(PluginContext);
  if (context === undefined) {
    throw new Error('usePlugins must be used within a PluginProvider');
  }
  return context;
};
```

### Slot Component

```typescript
// src/plugins/components/Slot.tsx
import React from 'react';
import { usePlugins } from '../contexts/plugin-context';
import type { SlotProps } from '../types';

export const Slot: React.FC<SlotProps> = ({ slotName, ...props }) => {
  const { pluginRegistry } = usePlugins();
  const plugins = pluginRegistry.getPluginsForSlot(slotName);

  return (
    <>
      {plugins.map((plugin) => {
        const content = plugin.renderSlot?.(slotName, props);
        return content ? (
          <React.Fragment key={`${slotName}-${plugin.id}`}>
            {content}
          </React.Fragment>
        ) : null;
      })}
    </>
  );
};
```

### Plugin Implementation Example

```typescript
// src/plugins/implementations/device-stats/index.ts
import React from 'react';
import { SlotName } from '../../types';
import DeviceStatsWidget from './DeviceStatsWidget';
import DeviceStatsAction from './DeviceStatsAction';

export default {
  slots: [SlotName.DASHBOARD_WIDGETS, SlotName.DEVICE_ACTIONS],

  initialize: async () => {
    console.log('Device Stats plugin initialized');
    // Load any required data or setup
  },

  cleanup: () => {
    console.log('Device Stats plugin cleanup');
    // Clean up any resources
  },

  renderSlot: (slotName, props) => {
    switch (slotName) {
      case SlotName.DASHBOARD_WIDGETS:
        return <DeviceStatsWidget {...props} />;
      case SlotName.DEVICE_ACTIONS:
        return <DeviceStatsAction deviceId={props?.deviceId} />;
      default:
        return null;
    }
  },
};
```

### Using Plugins in the Application

```typescript
// src/pages/Dashboard/index.tsx
import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Row, Col, Card } from 'antd';
import { Slot } from '@/plugins/components/Slot';
import { SlotName } from '@/plugins/types';

const DashboardPage: React.FC = () => {
  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Dashboard Widgets">
            {/* Render all plugins registered for the dashboard.widgets slot */}
            <Slot slotName={SlotName.DASHBOARD_WIDGETS} />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default DashboardPage;
```

## Component Architecture

The component architecture follows a hierarchical approach with clear separation of concerns and standardized patterns:
### Component Hierarchy

1. **Base Components**: Foundation components from Ant Design
2. **Pro Components**: Enhanced components from Ant Design Pro
3. **Common Components**: Reusable application-specific components
4. **Domain Components**: Feature-specific components
5. **Page Components**: Full page components composed of other components

### Component Organization

```
src/components/
├── common/              # Common UI components
│   ├── Button/
│   │   ├── index.tsx    # Component implementation
│   │   ├── index.less   # Component styles
│   │   └── index.test.tsx # Component tests
│   ├── Card/
│   ├── Input/
│   └── ...
├── layout/              # Layout components
│   ├── Header/
│   ├── Sidebar/
│   ├── Footer/
│   └── ...
└── domain/              # Domain-specific components
    ├── DeviceCard/
    ├── ContainerList/
    ├── PlaybookEditor/
    └── ...
```

### Component Implementation Pattern

Components follow a consistent implementation pattern:

```typescript
// src/components/domain/DeviceCard/index.tsx
import React from 'react';
import { Card, Tag, Space, Typography } from 'antd';
import { LinkOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { API } from '@/services/typings';
import styles from './index.less';

const { Text, Title } = Typography;

export interface DeviceCardProps {
  device: API.Device;
  onClick?: (device: API.Device) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onClick }) => {
  const { name, ip, status } = device;

  const handleClick = () => {
    if (onClick) {
      onClick(device);
    }
  };

  return (
    <Card
      hoverable
      className={styles.deviceCard}
      onClick={handleClick}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Title level={5}>{name}</Title>
        <Space>
          <LinkOutlined />
          <Text>{ip}</Text>
        </Space>
        <Tag color={status === 'online' ? 'success' : 'error'}>
          {status === 'online' ? (
            <><CheckCircleOutlined /> Online</>
          ) : (
            <><CloseCircleOutlined /> Offline</>
          )}
        </Tag>
      </Space>
    </Card>
  );
};

export default DeviceCard;
```

### Component Styling

Components use modular CSS with Less:

```less
// src/components/domain/DeviceCard/index.less
@import '~antd/es/style/themes/default.less';

.deviceCard {
  width: 100%;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
}
```

### Pro Components Usage

Complex UI elements use Ant Design Pro components:

```typescript
// src/pages/Devices/components/DeviceForm.tsx
import React from 'react';
import { ModalForm, ProFormText, ProFormSelect } from '@ant-design/pro-form';
import type { API } from '@/services/typings';

export interface DeviceFormProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  onFinish: (values: API.DeviceCreateDto) => Promise<boolean>;
  initialValues?: Partial<API.DeviceCreateDto>;
}

const DeviceForm: React.FC<DeviceFormProps> = ({
  visible,
  onVisibleChange,
  onFinish,
  initialValues,
}) => {
  return (
    <ModalForm
      title={initialValues?.id ? 'Edit Device' : 'Add Device'}
      visible={visible}
      onVisibleChange={onVisibleChange}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <ProFormText
        name="name"
        label="Device Name"
        placeholder="Enter device name"
        rules={[{ required: true, message: 'Please enter device name' }]}
      />
      <ProFormText
        name="ip"
        label="IP Address"
        placeholder="Enter IP address"
        rules={[
          { required: true, message: 'Please enter IP address' },
          {
            pattern: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
            message: 'Please enter a valid IP address',
          },
        ]}
      />
      <ProFormSelect
        name="status"
        label="Status"
        options={[
          { label: 'Online', value: 'online' },
          { label: 'Offline', value: 'offline' },
        ]}
        rules={[{ required: true, message: 'Please select status' }]}
      />
    </ModalForm>
  );
};

export default DeviceForm;
```

### Page Components

Page components compose other components into complete pages:

```typescript
// src/pages/Devices/index.tsx
import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { ProTable } from '@ant-design/pro-components';
import { Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import { getDevices, createDevice } from '@/services/rest/device';
import DeviceForm from './components/DeviceForm';
import type { API } from '@/services/typings';

const DevicesPage: React.FC = () => {
  const [formVisible, setFormVisible] = useState(false);

  const { data, loading, refresh } = useRequest(getDevices, {
    cacheKey: 'devices-list',
  });

  const { run: runCreate } = useRequest(createDevice, {
    manual: true,
    onSuccess: () => {
      message.success('Device created successfully');
      setFormVisible(false);
      refresh();
    },
  });

  const handleCreate = async (values: API.DeviceCreateDto) => {
    await runCreate(values);
    return true;
  };

  return (
    <PageContainer>
      <ProTable
        headerTitle="Devices"
        loading={loading}
        dataSource={data?.data}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setFormVisible(true)}
          >
            Add Device
          </Button>,
        ]}
        // Other props
      />

      <DeviceForm
        visible={formVisible}
        onVisibleChange={setFormVisible}
        onFinish={handleCreate}
      />
    </PageContainer>
  );
};

export default DevicesPage;
```

## Testing Architecture

The testing architecture provides comprehensive test coverage across different levels:
### Testing Levels

1. **Unit Tests**: Test individual components and functions in isolation
2. **Integration Tests**: Test interactions between components and services
3. **End-to-End Tests**: Test complete user flows and scenarios

### Testing Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setupTests.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/app.{ts,tsx}',
        'src/global.{ts,tsx}',
        'src/typings.d.ts',
        'src/**/*.d.ts',
      ],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

### Test Setup

```typescript
// tests/setupTests.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { configure } from '@testing-library/react';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Mock UmiJS Max's useModel hook
vi.mock('@umijs/max', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('@umijs/max')>();
  return {
    ...originalModule,
    useModel: vi.fn().mockImplementation((namespace) => {
      if (namespace === '@@initialState') {
        return {
          initialState: {
            currentUser: {
              name: 'Test User',
              permissions: ['admin'],
            },
          },
        };
      }
      return {};
    }),
  };
});

// Mock antd components
vi.mock('antd', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('antd')>();
  return {
    ...originalModule,
    message: {
      ...originalModule.message,
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    },
    notification: {
      ...originalModule.notification,
      open: vi.fn(),
    },
  };
});

// Mock matchMedia for tests
global.matchMedia = global.matchMedia || function () {
  return {
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  };
};
```

### Test Utilities

```typescript
// tests/utils/test-utils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PluginProvider } from '@/plugins/contexts/plugin-context';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  route?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <PluginProvider>{children}</PluginProvider>
      </MemoryRouter>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
```

### API Mocking

```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/devices', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: [
          { id: '1', name: 'Device 1', ip: '192.168.1.1', status: 'online' },
          { id: '2', name: 'Device 2', ip: '192.168.1.2', status: 'offline' },
        ],
      })
    );
  }),

  rest.get('/api/devices/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: { id, name: `Device ${id}`, ip: '192.168.1.1', status: 'online' },
      })
    );
  }),

  // Other API mocks
];

// tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup requests interception using the given handlers
export const server = setupServer(...handlers);
```

### Component Testing Example

```typescript
// src/components/domain/DeviceCard/index.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import DeviceCard from './index';

describe('DeviceCard', () => {
  const mockDevice = {
    id: '1',
    name: 'Test Device',
    ip: '192.168.1.1',
    status: 'online',
  };

  it('renders device information correctly', () => {
    const { getByText } = render(<DeviceCard device={mockDevice} />);

    expect(getByText('Test Device')).toBeInTheDocument();
    expect(getByText('192.168.1.1')).toBeInTheDocument();
    expect(getByText('Online')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <DeviceCard device={mockDevice} onClick={handleClick} />
    );

    fireEvent.click(container.querySelector('.ant-card') as HTMLElement);
    expect(handleClick).toHaveBeenCalledWith(mockDevice);
  });
});
```

### Integration Testing Example

```typescript
// src/pages/Devices/index.test.tsx
import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/tests/utils/test-utils';
import { server } from '@/tests/mocks/server';
import DevicesPage from './index';
import { message } from 'antd';

// Establish API mocking before all tests
beforeAll(() => server.listen());
// Reset any request handlers that we may add during the tests
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished
afterAll(() => server.close());

describe('DevicesPage', () => {
  it('renders the devices list', async () => {
    renderWithProviders(<DevicesPage />);

    // Wait for the devices to load
    await waitFor(() => {
      expect(screen.getByText('Device 1')).toBeInTheDocument();
      expect(screen.getByText('Device 2')).toBeInTheDocument();
    });
  });

  it('can create a new device', async () => {
    renderWithProviders(<DevicesPage />);

    // Click the add button
    fireEvent.click(screen.getByText('Add Device'));

    // Fill the form
    fireEvent.change(screen.getByLabelText('Device Name'), {
      target: { value: 'New Device' },
    });
    fireEvent.change(screen.getByLabelText('IP Address'), {
      target: { value: '192.168.1.3' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Submit'));

    // Check that the success message was shown
    await waitFor(() => {
      expect(message.success).toHaveBeenCalledWith('Device created successfully');
    });
  });
});
```

## Conclusion

This architecture document outlines the target architecture for the Squirrel Servers Manager client application. The architecture is designed to provide a solid foundation for building a scalable, maintainable, and extensible application.

### Key Benefits

1. **Improved Developer Experience**
   - Clear, consistent project structure
   - Better separation of concerns
   - Standardized patterns for common tasks
   - Leveraging UmiJS Max's built-in capabilities

2. **Enhanced Maintainability**
   - Modular, decoupled components
   - Comprehensive testing
   - Consistent coding patterns
   - Reduced boilerplate code by using UmiJS Max features

3. **Better Performance**
   - Optimized state management with UmiJS models and dva
   - Efficient data fetching with built-in useRequest and caching
   - Code splitting for faster loading

4. **Scalability**
   - Feature-based organization for easier scaling
   - Robust plugin system for extensibility
   - Clear boundaries between application domains
   - Standardized approach to adding new features

5. **Future-Proofing**
   - Modern architecture based on industry best practices
   - Strong typing throughout the application
   - Flexible structure that can adapt to changing requirements
   - Alignment with UmiJS Max's ecosystem and updates

By following this architecture, the Squirrel Servers Manager client will be well-positioned for future growth and evolution, while providing a solid foundation for current development efforts.
