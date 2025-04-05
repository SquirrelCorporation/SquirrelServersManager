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

Following Ant Design Pro v5 best practices, we'll adopt the following structure:

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
│   ├── e2e/                 # End-to-end tests
│   ├── hooks/               # Shared custom hooks
│   ├── layouts/             # Application layouts
│   │   ├── BasicLayout.tsx  # Main layout
│   │   └── UserLayout.tsx   # User-related layout (login, etc.)
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
│   ├── service-worker.js    # Service worker for PWA
│   └── typings.d.ts         # Global TypeScript definitions
└── tests/                   # Test files
    ├── run-tests.js         # Test runner
    └── setupTests.js        # Test setup
```

This structure follows the Ant Design Pro v5 conventions while incorporating our plugin system and specific feature requirements.

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
   import { useRequest } from 'umi';
   import { getDevices, getDeviceById } from '@/services/device';
   import type { Device } from '@/types/device';

   export default function useDeviceModel() {
     const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

     // Use UmiJS built-in useRequest for data fetching
     const { data: devices, loading, error, refresh } = useRequest(getDevices);

     const { data: selectedDevice } = useRequest(
       () => (selectedDeviceId ? getDeviceById(selectedDeviceId) : null),
       { refreshDeps: [selectedDeviceId] }
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

3. **For more complex state management, use dva models**:
   ```typescript
   // src/models/devices.ts (dva model)
   import { Effect, Reducer } from 'umi';
   import { getDevices, getDeviceById } from '@/services/device';
   import type { Device } from '@/types/device';

   export interface DevicesModelState {
     list: Device[];
     selectedDevice: Device | null;
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
     };
   }

   const DevicesModel: DevicesModelType = {
     namespace: 'devices',

     state: {
       list: [],
       selectedDevice: null,
     },

     effects: {
       *fetchDevices(_, { call, put }) {
         const response = yield call(getDevices);
         yield put({
           type: 'saveDevices',
           payload: response.data,
         });
       },
       *fetchDevice({ payload: id }, { call, put }) {
         const response = yield call(getDeviceById, id);
         yield put({
           type: 'saveDevice',
           payload: response.data,
         });
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
   export async function getDevices() {
     return request<API.Response<API.Device[]>>('/api/devices');
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
             const response = await getDevices();
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

### 4. Plugin System Enhancement

#### Implementation Plan:
1. **Create a robust plugin registry**:
   ```typescript
   // src/plugins/registry/pluginRegistry.ts
   import { Plugin, PluginMetadata } from '@/plugins/types';

   class PluginRegistry {
     private plugins: Map<string, Plugin> = new Map();
     private slots: Map<string, Set<Plugin>> = new Map();

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

     // Other methods
   }

   export const pluginRegistry = new PluginRegistry();
   ```

2. **Create a plugin context provider**:
   ```typescript
   // src/plugins/contexts/plugin-context.tsx
   import React, { createContext, useContext, useEffect, useState } from 'react';
   import { pluginRegistry } from '@/plugins/registry/pluginRegistry';
   import { Plugin, PluginMetadata } from '@/plugins/types';
   import { getPlugins } from '@/services/endpoints/pluginsService';

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

     const loadPlugins = async () => {
       try {
         setLoading(true);
         setError(null);

         const response = await getPlugins();
         setPluginMetadata(response.data || []);

         // Register plugins
         for (const metadata of response.data || []) {
           if (metadata.enabled) {
             // Load and register plugin
             // This would be more complex in a real implementation
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

   export const useSlot = (slotName: string) => {
     const { pluginRegistry } = usePlugins();

     return () => {
       const plugins = pluginRegistry.getPluginsForSlot(slotName);
       return (
         <>
           {plugins.map((plugin) => {
             const SlotComponent = plugin.renderSlot?.(slotName);
             return SlotComponent ? <SlotComponent key={plugin.id} /> : null;
           })}
         </>
       );
     };
   };
   ```

3. **Define plugin types**:
   ```typescript
   // src/plugins/types/index.ts
   export interface PluginMetadata {
     id: string;
     name: string;
     version: string;
     description: string;
     author?: string;
     enabled: boolean;
     permissions?: string[];
   }

   export interface Plugin {
     id: string;
     metadata: PluginMetadata;
     slots?: string[];
     initialize?: () => Promise<void>;
     renderSlot?: (slotName: string) => React.ComponentType | null;
     // Other plugin methods and properties
   }
   ```

### 5. Component Architecture Standardization

#### Implementation Plan:
1. **Create a component library structure**:
   ```
   src/components/
   ├── common/              # Basic UI components
   │   ├── Button/
   │   │   ├── Button.tsx
   │   │   ├── Button.styles.ts
   │   │   ├── Button.test.tsx
   │   │   └── index.ts
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

2. **Implement component patterns**:
   ```typescript
   // src/components/common/Button/Button.tsx
   import React from 'react';
   import { ButtonWrapper } from './Button.styles';

   export interface ButtonProps {
     variant?: 'primary' | 'secondary' | 'danger';
     size?: 'small' | 'medium' | 'large';
     disabled?: boolean;
     onClick?: () => void;
     children: React.ReactNode;
   }

   export const Button: React.FC<ButtonProps> = ({
     variant = 'primary',
     size = 'medium',
     disabled = false,
     onClick,
     children,
   }) => {
     return (
       <ButtonWrapper
         variant={variant}
         size={size}
         disabled={disabled}
         onClick={disabled ? undefined : onClick}
       >
         {children}
       </ButtonWrapper>
     );
   };
   ```

3. **Create styled components**:
   ```typescript
   // src/components/common/Button/Button.styles.ts
   import styled, { css } from 'styled-components';
   import { ButtonProps } from './Button';

   export const ButtonWrapper = styled.button<ButtonProps>`
     border-radius: 4px;
     font-weight: 500;
     cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
     opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

     ${({ variant }) => {
       switch (variant) {
         case 'primary':
           return css`
             background-color: #1890ff;
             color: white;
             border: none;
           `;
         case 'secondary':
           return css`
             background-color: transparent;
             color: #1890ff;
             border: 1px solid #1890ff;
           `;
         case 'danger':
           return css`
             background-color: #ff4d4f;
             color: white;
             border: none;
           `;
         default:
           return '';
       }
     }}

     ${({ size }) => {
       switch (size) {
         case 'small':
           return css`
             padding: 4px 12px;
             font-size: 12px;
           `;
         case 'medium':
           return css`
             padding: 8px 16px;
             font-size: 14px;
           `;
         case 'large':
           return css`
             padding: 12px 20px;
             font-size: 16px;
           `;
         default:
           return '';
       }
     }}
   `;
   ```

### 6. Testing Infrastructure Enhancement

#### Implementation Plan:
1. **Set up comprehensive testing tools**:
   - Configure Vitest for unit and integration testing
   - Set up React Testing Library for component testing
   - Implement Cypress for E2E testing

2. **Create test utilities for UmiJS Max**:
   ```typescript
   // tests/utils/test-utils.tsx
   import React, { ReactElement } from 'react';
   import { render, RenderOptions } from '@testing-library/react';
   import { PluginProvider } from '@/plugins/contexts/plugin-context';
   import { createMemoryHistory } from 'history';
   import { Router } from 'react-router-dom';

   interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
     initialRoute?: string;
   }

   export function renderWithProviders(
     ui: ReactElement,
     {
       initialRoute = '/',
       ...renderOptions
     }: ExtendedRenderOptions = {}
   ) {
     const history = createMemoryHistory({ initialEntries: [initialRoute] });

     function Wrapper({ children }: { children: React.ReactNode }) {
       return (
         <Router history={history}>
           <PluginProvider>{children}</PluginProvider>
         </Router>
       );
     }

     return { history, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
   }
   ```

3. **Create test mocks for UmiJS Max**:
   ```typescript
   // tests/mocks/handlers.ts
   import { rest } from 'msw';

   export const handlers = [
     rest.get('/api/devices', (req, res, ctx) => {
       return res(
         ctx.status(200),
         ctx.json({
           data: [
             { id: '1', name: 'Device 1', ip: '192.168.1.1', status: 'online' },
             { id: '2', name: 'Device 2', ip: '192.168.1.2', status: 'offline' },
           ],
         })
       );
     }),

     // Add more API mocks here
   ];
   ```

4. **Set up mock for UmiJS models**:
   ```typescript
   // tests/mocks/modelMocks.ts
   import { Device } from '@/types/device';

   // Mock for the deviceModel
   export const mockDeviceModel = {
     devices: [
       { id: '1', name: 'Device 1', ip: '192.168.1.1', status: 'online' },
       { id: '2', name: 'Device 2', ip: '192.168.1.2', status: 'offline' },
     ],
     selectedDevice: null,
     loading: false,
     error: null,
     selectDevice: jest.fn(),
     refreshDevices: jest.fn(),
   };

   // Mock the useModel hook from UmiJS
   export function mockUseModel(namespace: string) {
     if (namespace === 'deviceModel') {
       return mockDeviceModel;
     }
     return {};
   }
   ```

5. **Create component testing examples**:
   ```typescript
   // src/components/common/Button/Button.test.tsx
   import React from 'react';
   import { render, fireEvent } from '@testing-library/react';
   import { Button } from './Button';

   describe('Button component', () => {
     it('renders correctly with default props', () => {
       const { getByText } = render(<Button>Click me</Button>);
       expect(getByText('Click me')).toBeInTheDocument();
     });

     it('calls onClick when clicked', () => {
       const handleClick = jest.fn();
       const { getByText } = render(<Button onClick={handleClick}>Click me</Button>);
       fireEvent.click(getByText('Click me'));
       expect(handleClick).toHaveBeenCalledTimes(1);
     });

     it('does not call onClick when disabled', () => {
       const handleClick = jest.fn();
       const { getByText } = render(
         <Button onClick={handleClick} disabled>
           Click me
         </Button>
       );
       fireEvent.click(getByText('Click me'));
       expect(handleClick).not.toHaveBeenCalled();
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

## Detailed Implementation Plan

### Phase 1: Infrastructure Setup (2 weeks)

#### Week 1: Project Structure and Configuration
- [ ] **Day 1-2: Project Structure Setup**
  - [ ] Create the new directory structure according to the plan
  - [ ] Set up linting and formatting rules
  - [ ] Configure TypeScript settings

- [ ] **Day 3-4: UmiJS Max Configuration**
  - [ ] Configure UmiJS Max settings in config files
  - [ ] Set up build and development scripts
  - [ ] Configure routing system

- [ ] **Day 5: Request Module Setup**
  - [ ] Implement request runtime configuration in app.ts
  - [ ] Set up error handling for API requests
  - [ ] Configure request interceptors

#### Week 2: State Management and Plugin System
- [ ] **Day 1-2: State Management Setup**
  - [ ] Configure UmiJS model system
  - [ ] Set up dva if needed for complex state management
  - [ ] Create base model templates

- [ ] **Day 3-5: Plugin System Architecture**
  - [ ] Implement plugin registry
  - [ ] Create plugin context provider
  - [ ] Define plugin types and interfaces
  - [ ] Set up plugin loading mechanism

### Phase 2: Feature Migration (4-6 weeks)

#### Week 1-2: Core Features Migration
- [ ] **Dashboard Feature**
  - [ ] Create dashboard model
  - [ ] Implement dashboard API services
  - [ ] Migrate dashboard components
  - [ ] Write tests for dashboard feature

- [ ] **User Authentication**
  - [ ] Create authentication model
  - [ ] Implement authentication API services
  - [ ] Migrate login/logout components
  - [ ] Write tests for authentication

#### Week 3-4: Device Management Migration
- [ ] **Device Listing and Details**
  - [ ] Create device model
  - [ ] Implement device API services
  - [ ] Migrate device list and detail components
  - [ ] Write tests for device management

- [ ] **Device Operations**
  - [ ] Implement device operations API services
  - [ ] Migrate device operation components
  - [ ] Write tests for device operations

#### Week 5-6: Container and Playbook Features
- [ ] **Container Management**
  - [ ] Create container model
  - [ ] Implement container API services
  - [ ] Migrate container management components
  - [ ] Write tests for container management

- [ ] **Playbook Management**
  - [ ] Create playbook model
  - [ ] Implement playbook API services
  - [ ] Migrate playbook components
  - [ ] Write tests for playbook management

### Phase 3: Component Library Development (3-4 weeks)

#### Week 1: Basic Components
- [ ] **Design System Setup**
  - [ ] Define design tokens (colors, spacing, typography)
  - [ ] Create theme configuration
  - [ ] Set up styled-components or emotion

- [ ] **Basic UI Components**
  - [ ] Implement Button component
  - [ ] Implement Input component
  - [ ] Implement Card component
  - [ ] Write tests for basic components

#### Week 2: Form Components
- [ ] **Form Components**
  - [ ] Implement Form component
  - [ ] Implement Select component
  - [ ] Implement Checkbox and Radio components
  - [ ] Write tests for form components

#### Week 3: Layout and Navigation Components
- [ ] **Layout Components**
  - [ ] Implement Header component
  - [ ] Implement Sidebar component
  - [ ] Implement Footer component
  - [ ] Write tests for layout components

- [ ] **Navigation Components**
  - [ ] Implement Menu component
  - [ ] Implement Tabs component
  - [ ] Implement Breadcrumb component
  - [ ] Write tests for navigation components

#### Week 4: Domain-Specific Components
- [ ] **Device Components**
  - [ ] Implement DeviceCard component
  - [ ] Implement DeviceStatusBadge component
  - [ ] Write tests for device components

- [ ] **Container Components**
  - [ ] Implement ContainerList component
  - [ ] Implement ContainerStatusBadge component
  - [ ] Write tests for container components

- [ ] **Documentation**
  - [ ] Set up Storybook for component documentation
  - [ ] Document all components with examples and usage guidelines

### Phase 4: Testing and Optimization (2-3 weeks)

#### Week 1: Testing Infrastructure
- [ ] **Unit Testing Setup**
  - [ ] Configure Vitest for unit testing
  - [ ] Set up test utilities and mocks
  - [ ] Implement CI pipeline for tests

- [ ] **Integration Testing**
  - [ ] Set up integration test environment
  - [ ] Create integration tests for key user flows
  - [ ] Configure test coverage reporting

#### Week 2: E2E Testing and Performance
- [ ] **E2E Testing**
  - [ ] Set up Cypress for E2E testing
  - [ ] Create E2E tests for critical user journeys
  - [ ] Configure E2E tests in CI pipeline

- [ ] **Performance Optimization**
  - [ ] Analyze and optimize bundle size
  - [ ] Implement code splitting
  - [ ] Optimize component rendering performance
  - [ ] Set up performance monitoring

#### Week 3: Documentation and Final Polishing
- [ ] **Documentation**
  - [ ] Create developer documentation
  - [ ] Document architecture and patterns
  - [ ] Create onboarding guide for new developers

- [ ] **Final Review and Polishing**
  - [ ] Conduct code review of the entire codebase
  - [ ] Fix any remaining issues
  - [ ] Ensure consistent coding patterns across the application
  - [ ] Final performance and accessibility audit
