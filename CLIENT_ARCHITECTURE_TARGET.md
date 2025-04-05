# CLIENT_ARCHITECTURE_TARGET

## Current Architecture Analysis

The Squirrel Servers Manager (SSM) client is built using:
- React as the UI library
- UmiJS Max as the framework
- Ant Design Pro for UI components
- A plugin system for extensibility
- REST API services for backend communication

UmiJS Max provides several built-in capabilities that we should leverage:
- Built-in data flow management (Model system based on hooks)
- Built-in request module based on axios and ahooks' useRequest
- Built-in dva integration (Redux + Saga) for more complex state management
- Built-in layout and routing system
- Built-in internationalization (i18n) support
- Built-in OpenAPI integration

The current architecture has several areas that could be improved:
1. The project structure lacks clear organization for larger-scale development
2. The plugin system implementation is not fully modular
3. State management appears to be scattered across different approaches
4. API service layer lacks consistent patterns
5. Component organization could be more standardized
6. Testing infrastructure is minimal

## Refactoring Plan

### 1. Project Structure Reorganization

Following the latest Ant Design Pro v5 and UmiJS Max best practices, we'll adopt the following structure:

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
│   │   ├── Footer/          # Footer component
│   │   ├── HeaderSearch/    # Header search component
│   │   ├── RightContent/    # Right content for header
│   │   └── ...              # Other shared components
│   ├── hooks/               # Shared custom hooks
│   ├── layouts/             # Application layouts
│   │   ├── BasicLayout/     # Main layout
│   │   │   ├── index.tsx    # Layout component
│   │   │   └── index.less   # Layout styles
│   │   └── UserLayout/      # User-related layout (login, etc.)
│   ├── locales/             # Internationalization resources
│   │   ├── en-US/           # English translations
│   │   └── zh-CN/           # Chinese translations
│   ├── models/              # Global models for state management
│   │   ├── global.ts        # Global model
│   │   └── user.ts          # User model
│   ├── pages/               # Application pages
│   │   ├── Dashboard/       # Dashboard page
│   │   │   ├── components/  # Dashboard-specific components
│   │   │   ├── index.tsx    # Main dashboard component
│   │   │   └── index.less   # Dashboard styles
│   │   ├── Devices/         # Devices page
│   │   ├── Containers/      # Containers page
│   │   ├── Playbooks/       # Playbooks page
│   │   ├── User/            # User-related pages (login, etc.)
│   │   └── 404.tsx          # 404 page
│   ├── plugins/             # Plugin system (refactored)
│   │   ├── components/      # Plugin UI components
│   │   ├── contexts/        # Plugin context providers
│   │   ├── hooks/           # Plugin hooks
│   │   ├── registry/        # Plugin registration system
│   │   ├── types/           # Plugin type definitions
│   │   └── utils/           # Plugin utilities
│   ├── services/            # API services
│   │   ├── ant-design-pro/  # API services for Pro components
│   │   ├── devices.ts       # Devices API services
│   │   ├── containers.ts    # Containers API services
│   │   ├── playbooks.ts     # Playbooks API services
│   │   └── typings.d.ts     # TypeScript definitions for API
│   ├── utils/               # Utility functions
│   │   ├── request.ts       # Request utility (if needed)
│   │   ├── utils.ts         # General utilities
│   │   └── authority.ts     # Authority-related utilities
│   ├── access.ts            # Access control configuration
│   ├── app.tsx              # Application configuration
│   ├── global.less          # Global styles
│   ├── global.tsx           # Global scripts
│   ├── manifest.json        # PWA manifest
│   ├── service-worker.ts    # Service worker for PWA
│   └── typings.d.ts         # Global TypeScript definitions
├── tests/                   # Test files
│   ├── e2e/                 # End-to-end tests
│   ├── unit/                # Unit tests
│   ├── run-tests.js         # Test runner
│   └── setupTests.js        # Test setup
├── .editorconfig           # Editor configuration
├── .eslintrc.js            # ESLint configuration
├── .prettierrc.js          # Prettier configuration
├── jest.config.ts          # Jest configuration
├── package.json            # Project dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

This structure follows the latest Ant Design Pro v5 and UmiJS Max conventions while incorporating our plugin system and specific feature requirements. Key improvements include:

1. **Clearer organization** of components, pages, and services
2. **Better separation** between global and feature-specific code
3. **Standardized naming conventions** for files and directories
4. **Improved testing structure** with separate directories for different test types
5. **Enhanced plugin system organization** with clear separation of concerns

### 2. State Management Modernization

#### Implementation Plan:
1. **Leverage UmiJS Max's built-in state management solutions**
   - Use the built-in Model system for simpler state management needs
   - Use dva for more complex state management scenarios
   - Implement consistent patterns across the application

2. **Create domain-specific models using UmiJS hooks-based approach**:
   ```typescript
   // src/models/deviceModel.ts
   import { useState, useCallback } from 'react';
   import { useRequest } from '@umijs/max';
   import { getDevices, getDeviceById } from '@/services/device';

   export default function useDeviceModel() {
     const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

     // Use UmiJS built-in useRequest for data fetching with automatic loading state
     const { data: devices, loading, error, refresh } = useRequest(getDevices);

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

3. **Use the global initial state for application-wide data**:
   ```typescript
   // src/app.ts
   import { fetchUserInfo } from '@/services/user';
   import { fetchAppConfig } from '@/services/config';

   export async function getInitialState() {
     try {
       // Fetch user info and app configuration in parallel
       const [userInfo, appConfig] = await Promise.all([
         fetchUserInfo(),
         fetchAppConfig()
       ]);

       return {
         userInfo,
         appConfig,
         settings: { ...appConfig.defaultSettings }
       };
     } catch (error) {
       console.error('Failed to fetch initial state:', error);
       return {
         userInfo: undefined,
         appConfig: undefined,
         settings: {}
       };
     }
   }
   ```

4. **Access models in components with performance optimization**:
   ```typescript
   // src/pages/Devices/index.tsx
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
     const { userInfo } = initialState || {};

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

5. **For more complex state management, use dva models**:
   ```typescript
   // src/models/devices.ts (dva model)
   import { Effect, Reducer } from '@umijs/max';
   import { getDevices, getDeviceById } from '@/services/device';
   import type { Device } from '@/services/typings';

   export interface DevicesModelState {
     list: Device[];
     selectedDevice: Device | null;
     loading: boolean;
   }

   export interface DevicesModelType {
     namespace: 'devices';
     state: DevicesModelState;
     effects: {
       fetchDevices: Effect;
       fetchDevice: Effect;
     };
     reducers: {
       saveDevices: Reducer<DevicesModelState>;
       saveDevice: Reducer<DevicesModelState>;
       setLoading: Reducer<DevicesModelState>;
     };
   }

   const DevicesModel: DevicesModelType = {
     namespace: 'devices',

     state: {
       list: [],
       selectedDevice: null,
       loading: false,
     },

     effects: {
       *fetchDevices(_, { call, put }) {
         yield put({ type: 'setLoading', payload: true });
         try {
           const response = yield call(getDevices);
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
     },
   };

   export default DevicesModel;
   ```

### 3. API Service Layer Refactoring

#### Implementation Plan:
1. **Leverage UmiJS Max's built-in request module with OpenAPI integration**:
   ```typescript
   // src/app.ts - Configure request runtime settings
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

   // Response structure following Ant Design Pro best practices
   interface ResponseStructure {
     success: boolean;
     data: any;
     errorCode?: string;
     errorMessage?: string;
     showType?: ErrorShowType;
   }

   export const request: RequestConfig = {
     timeout: 10000,
     // Default error handling strategy
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

2. **Create domain-specific API services using OpenAPI and UmiJS request**:
   ```typescript
   // src/services/typings.d.ts - Define API response structure
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
   }
   ```

   ```typescript
   // src/services/device.ts
   import { request } from '@umijs/max';

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

3. **Use UmiJS useRequest hook with Pro Table for data fetching in components**:
   ```typescript
   // src/pages/Devices/index.tsx
   import React from 'react';
   import { useRequest } from '@umijs/max';
   import { PageContainer } from '@ant-design/pro-layout';
   import { ProTable } from '@ant-design/pro-components';
   import { Button, message, Popconfirm } from 'antd';
   import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
   import { getDevices, deleteDevice } from '@/services/device';
   import type { ProColumns } from '@ant-design/pro-components';
   import type { API } from '@/services/typings';

   const DevicesPage: React.FC = () => {
     // Handle device deletion with automatic loading state
     const { run: runDelete, loading: deleteLoading } = useRequest(deleteDevice, {
       manual: true,
       onSuccess: () => {
         message.success('Device deleted successfully');
         // The ProTable will automatically refresh
       },
     });

     const columns: ProColumns<API.Device>[] = [
       {
         title: 'Name',
         dataIndex: 'name',
         sorter: true,
       },
       {
         title: 'IP Address',
         dataIndex: 'ip',
       },
       {
         title: 'Status',
         dataIndex: 'status',
         valueEnum: {
           online: { text: 'Online', status: 'Success' },
           offline: { text: 'Offline', status: 'Error' },
         },
       },
       {
         title: 'Actions',
         valueType: 'option',
         render: (_, record) => [
           <Popconfirm
             key="delete"
             title="Are you sure you want to delete this device?"
             onConfirm={() => runDelete(record.id)}
           >
             <Button
               danger
               icon={<DeleteOutlined />}
               loading={deleteLoading}
             >
               Delete
             </Button>
           </Popconfirm>,
         ],
       },
     ];

     return (
       <PageContainer>
         <ProTable<API.Device>
           headerTitle="Devices"
           rowKey="id"
           search={{
             labelWidth: 120,
           }}
           toolBarRender={() => [
             <Button
               key="add"
               type="primary"
               icon={<PlusOutlined />}
               onClick={() => {
                 // Handle add device
               }}
             >
               Add Device
             </Button>,
           ]}
           request={async (params, sort, filter) => {
             const response = await getDevices(params);
             return {
               data: response.data || [],
               success: response.success,
               total: response.data?.length || 0,
             };
           }}
           columns={columns}
         />
       </PageContainer>
     );
   };

   export default DevicesPage;
   ```

4. **Implement OpenAPI integration for automatic API generation**:
   ```typescript
   // config/config.ts
   import { defineConfig } from '@umijs/max';

   export default defineConfig({
     // ... other configurations
     openAPI: {
       requestLibPath: "import { request } from '@umijs/max'",
       // Use OpenAPI specification
       schemaPath: 'https://api.example.com/v2/api-docs',
       // OR use local file
       // schemaPath: join(__dirname, 'oneapi.json'),
       mock: false,
       projectName: 'api',
     },
   });
   ```

   This configuration will automatically generate API services based on the OpenAPI specification, which can be used directly in your application:

   ```typescript
   // Example of using auto-generated API
   import { DeviceController } from '@/services/api';

   // In your component
   const { data, loading } = useRequest(() => DeviceController.getDevices());
   ```

### 4. Plugin System Enhancement

#### Implementation Plan:
1. **Create a robust plugin registry using UmiJS's runtime plugin system**:
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

2. **Define plugin types with TypeScript**:
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

3. **Create a plugin context provider using React Context**:
   ```typescript
   // src/plugins/contexts/plugin-context.tsx
   import React, { createContext, useContext, useEffect, useState } from 'react';
   import { pluginRegistry } from '../registry/pluginRegistry';
   import type { Plugin, PluginMetadata, SlotProps } from '../types';
   import { getPlugins } from '@/services/plugin';
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
     const { userInfo } = initialState || {};

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
                   userInfo?.permissions?.includes(permission)
                 );

               if (hasPermission) {
                 // Dynamic import of plugin module
                 try {
                   // This assumes plugins are loaded from a specific directory
                   // In a real implementation, this would be more sophisticated
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

4. **Create a slot component for rendering plugin content**:
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

5. **Create a sample plugin implementation**:
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

6. **Use plugins in the application**:
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

### 5. Component Architecture Standardization

#### Implementation Plan:
1. **Leverage Ant Design Pro components and patterns**:
   - Use Pro Components for complex UI elements
   - Follow Ant Design's design principles and patterns
   - Create consistent component APIs

2. **Create a component library structure**:
   ```
   src/components/
   ├── common/              # Basic UI components
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

3. **Implement component patterns using Ant Design Pro**:
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

4. **Create a component style file**:
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

5. **Create a component test file**:
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
       const handleClick = jest.fn();
       const { container } = render(
         <DeviceCard device={mockDevice} onClick={handleClick} />
       );

       fireEvent.click(container.querySelector('.ant-card') as HTMLElement);
       expect(handleClick).toHaveBeenCalledWith(mockDevice);
     });

     it('renders offline status correctly', () => {
       const offlineDevice = { ...mockDevice, status: 'offline' };
       const { getByText } = render(<DeviceCard device={offlineDevice} />);

       expect(getByText('Offline')).toBeInTheDocument();
     });
   });
   ```

6. **Use Pro Components for complex UI elements**:
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

### 6. Testing Infrastructure Enhancement

#### Implementation Plan:
1. **Set up comprehensive testing tools**:
   ```typescript
   // jest.config.ts
   import { defineConfig } from '@umijs/max/test';

   export default defineConfig({
     testEnvironment: 'jsdom',
     testTimeout: 60000,
     setupFiles: ['./tests/setupTests.js'],
     moduleNameMapper: {
       '^@/(.*)$': '<rootDir>/src/$1',
       '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
     },
     transform: {
       '^.+\\.(ts|tsx)$': 'ts-jest',
     },
     collectCoverageFrom: [
       'src/**/*.{ts,tsx}',
       '!src/app.{ts,tsx}',
       '!src/global.{ts,tsx}',
       '!src/typings.d.ts',
       '!src/services/typings.d.ts',
       '!src/**/*.d.ts',
     ],
     coverageThreshold: {
       global: {
         branches: 70,
         functions: 70,
         lines: 70,
         statements: 70,
       },
     },
   });
   ```

2. **Create test utilities for UmiJS Max**:
   ```typescript
   // tests/setupTests.js
   import '@testing-library/jest-dom';
   import { configure } from '@testing-library/react';

   // Configure testing library
   configure({ testIdAttribute: 'data-testid' });

   // Mock UmiJS Max's useModel hook
   jest.mock('@umijs/max', () => {
     const originalModule = jest.requireActual('@umijs/max');
     return {
       ...originalModule,
       useModel: jest.fn().mockImplementation((namespace) => {
         if (namespace === '@@initialState') {
           return {
             initialState: {
               userInfo: {
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

   // Mock antd components if needed
   jest.mock('antd', () => {
     const antd = jest.requireActual('antd');
     const { message, notification } = antd;

     message.success = jest.fn();
     message.error = jest.fn();
     message.warning = jest.fn();
     notification.open = jest.fn();

     return antd;
   });

   // Global test setup
   global.matchMedia = global.matchMedia || function () {
     return {
       matches: false,
       addListener: jest.fn(),
       removeListener: jest.fn(),
     };
   };
   ```

3. **Create test utilities for rendering components**:
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

4. **Create API mocks for testing**:
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

     rest.post('/api/devices', (req, res, ctx) => {
       const { name, ip, status } = req.body as any;
       return res(
         ctx.status(200),
         ctx.json({
           success: true,
           data: { id: '3', name, ip, status },
         })
       );
     }),

     rest.put('/api/devices/:id', (req, res, ctx) => {
       const { id } = req.params;
       const { name, ip, status } = req.body as any;
       return res(
         ctx.status(200),
         ctx.json({
           success: true,
           data: { id, name, ip, status },
         })
       );
     }),

     rest.delete('/api/devices/:id', (req, res, ctx) => {
       return res(
         ctx.status(200),
         ctx.json({
           success: true,
         })
       );
     }),
   ];
   ```

5. **Set up MSW for API mocking**:
   ```typescript
   // tests/mocks/server.ts
   import { setupServer } from 'msw/node';
   import { handlers } from './handlers';

   // Setup requests interception using the given handlers
   export const server = setupServer(...handlers);
   ```

6. **Create an example integration test**:
   ```typescript
   // src/pages/Devices/index.test.tsx
   import React from 'react';
   import { screen, waitFor, fireEvent } from '@testing-library/react';
   import { renderWithProviders } from '@/tests/utils/test-utils';
   import { server } from '@/tests/mocks/server';
   import DevicesPage from './index';

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

     it('can delete a device', async () => {
       renderWithProviders(<DevicesPage />);

       // Wait for the devices to load
       await waitFor(() => {
         expect(screen.getByText('Device 1')).toBeInTheDocument();
       });

       // Click the delete button for the first device
       const deleteButtons = screen.getAllByText('Delete');
       fireEvent.click(deleteButtons[0]);

       // Confirm the deletion
       const confirmButton = screen.getByText('OK');
       fireEvent.click(confirmButton);

       // Check that the success message was shown
       await waitFor(() => {
         expect(message.success).toHaveBeenCalledWith('Device deleted successfully');
       });
     });
   });
   ```

### 7. Migration Strategy

To implement this refactoring plan without disrupting ongoing development, we recommend a phased approach:

1. **Phase 1: Infrastructure Setup (2 weeks)**
   - Set up the new project structure
   - Configure UmiJS Max's built-in request module
   - Set up the model system for state management
   - Create the enhanced plugin system architecture

2. **Phase 2: Feature Migration (4-6 weeks)**
   - Migrate one feature at a time to the new architecture
   - Start with smaller, less complex features
   - Implement comprehensive tests for each migrated feature

3. **Phase 3: Component Library Development (3-4 weeks)**
   - Create the standardized component library
   - Refactor existing components to use the new patterns
   - Develop comprehensive component documentation

4. **Phase 4: Testing and Optimization (2-3 weeks)**
   - Implement end-to-end tests
   - Optimize performance
   - Refine documentation

### 8. Benefits of the New Architecture

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
