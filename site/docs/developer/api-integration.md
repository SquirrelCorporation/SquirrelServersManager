---
layout: FeatureGuideLayout
title: "API Integration"
icon: 🔌
time: 10 min read
signetColor: '#23233e'
nextStep:
  icon: 🧩
  title: Plugin System
  description: Learn how to extend SSM with plugins
  link: /docs/developer/plugins
credits: true
---

:::tip In a Nutshell (🌰)
- Squirrel Servers Manager exposes a comprehensive RESTful API for integration
- API responses follow a standardized format with consistent error handling
- The shared-lib package provides TypeScript interfaces for all API contracts
- Authentication is handled via bearer tokens for secure access
- Client-side API services simplify interaction with the backend
:::

---


:::info 
Swagger Document of the API is available in SSM at http://localhost:8000/api/docs
:::

## API Architecture

Squirrel Servers Manager (SSM) follows a clean, layered architecture for its API implementation. The backend uses NestJS to provide a structured, maintainable API with comprehensive documentation, while the frontend uses a unified request interface to communicate with these endpoints.

<MentalModelDiagram 
  title="API Architecture" 
  imagePath="/images/api-architecture.svg" 
  altText="SSM API Architecture Diagram" 
  caption="Figure 1: SSM API Architecture" 
/>

### Server-Side Components

The server-side API architecture consists of the following layers:

1. **Controller Layer**: Handles HTTP requests, validates input, and returns responses
2. **Service Layer**: Implements business logic and orchestrates operations
3. **Repository Layer**: Manages data access and persistence
4. **Infrastructure Layer**: Provides cross-cutting concerns like error handling and response standardization
5. **Plugin System**: Dynamically extends the API with custom endpoints from plugins

### Client-Side Components

The client-side API integration consists of:

1. **REST Service Layer**: Provides typed service methods for API endpoints
2. **Request Wrapper**: Unified request interface built on @umijs/max
3. **Error Handling**: Consistent error processing and user feedback

## API Response Format

All API responses follow a standardized format to ensure consistency across the application.

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data specific to the endpoint
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
}
```

## Authentication

API authentication uses a Bearer token scheme. To authenticate requests:

1. Obtain an API token from Settings > Authentication in the SSM web interface
2. Include the token in the `Authorization` header of your requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Common HTTP Methods

The API follows RESTful conventions for HTTP methods:

| Method | Description |
|--------|-------------|
| `GET` | Retrieve resources (read-only) |
| `POST` | Create new resources |
| `PUT` | Update existing resources (full replacement) |
| `PATCH` | Partially update existing resources |
| `DELETE` | Remove resources |

## Client Integration Examples

### Using the Shared Library

SSM provides a `shared-lib` package containing TypeScript interfaces for all API contracts. This ensures type safety and consistency between client and server.

```typescript
import { API } from 'ssm-shared-lib';

// Type-safe API response
const response: API.DeviceList = await fetchDevices();
```

### Client Service Example

The following example demonstrates how to create a client service for API integration:

```typescript
import { request } from '@umijs/max';
import { API } from 'ssm-shared-lib';

const BASE_URL = '/api/devices';

// Get paginated list of devices
export async function getDevices(
  params?: API.PageParams,
  options?: { [key: string]: any },
) {
  return request<API.DeviceList>(`${BASE_URL}`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// Create a new device
export async function createDevice(
  ip: string,
  deviceAuth: API.DeviceAuthParams,
  unManaged?: boolean,
  options?: { [key: string]: any },
) {
  return request<API.NewDevice>(`${BASE_URL}`, {
    data: {
      ip: ip,
      unManaged: unManaged,
      ...deviceAuth,
    },
    method: 'POST',
    ...(options || {}),
  });
}

// Delete a device by UUID
export async function deleteDevice(
  uuid: string,
  options?: { [key: string]: any },
) {
  return request<API.Response<API.SimpleResult>>(`${BASE_URL}/${uuid}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
```

### React Component Integration

Here's how to use the client services in a React component:

```tsx
import React, { useState, useEffect } from 'react';
import { getDevices, deleteDevice } from '@/services/rest/devices/devices';
import { API } from 'ssm-shared-lib';
import { Button, Table, message } from 'antd';

const DeviceList: React.FC = () => {
  const [devices, setDevices] = useState<API.DeviceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await getDevices({ current: 1, pageSize: 10 });
      setDevices(response.data || []);
    } catch (error) {
      message.error('Failed to fetch devices');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uuid: string) => {
    try {
      await deleteDevice(uuid);
      message.success('Device deleted successfully');
      fetchDevices();
    } catch (error) {
      message.error('Failed to delete device');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <Table
      loading={loading}
      dataSource={devices}
      rowKey="uuid"
      columns={[
        { title: 'Hostname', dataIndex: 'hostname', key: 'hostname' },
        { title: 'IP Address', dataIndex: 'ip', key: 'ip' },
        { title: 'Status', dataIndex: 'status', key: 'status' },
        {
          title: 'Actions',
          key: 'actions',
          render: (_, record) => (
            <Button danger onClick={() => handleDelete(record.uuid)}>
              Delete
            </Button>
          ),
        },
      ]}
    />
  );
};

export default DeviceList;
```

## Error Handling

SSM provides a standardized error handling mechanism for API integration. The `requestErrorConfig` module configures how errors are processed and displayed:

```typescript
// Simplified version of error handling
const errorHandler = (error: any) => {
  if (error.response) {
    // Error from server with response data
    message.error(`Response status: ${error.response.status} - ${error.response.data.message}`);
  } else if (error.request) {
    // Request was made but no response received
    message.error('No response from server. Please retry.');
  } else {
    // Error setting up the request
    message.error('Request error, please retry.');
  }
};
```

## Pagination, Sorting, and Filtering

Many list endpoints support pagination, sorting, and filtering:

### Pagination

```typescript
// Example query parameters for pagination
const params = {
  current: 1,    // Current page number
  pageSize: 10   // Number of items per page
};
```

### Sorting

```typescript
// Example query parameters for sorting
const params = {
  sorter: 'createdAt_descend'  // Sort by creation date descending
};
```

### Filtering

```typescript
// Example query parameters for filtering
const params = {
  'status[]': 'online',  // Filter by status
  name: 'web-server'     // Filter by name
};
```

## API Documentation

The full API documentation is available at `/api/docs` when running in development mode. This interactive Swagger UI provides:

- Complete endpoint listing with path parameters
- Request body schemas
- Response schemas
- Authentication requirements

## Common API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/devices` | GET | List all devices |
| `/api/devices/{uuid}` | GET | Get a specific device |
| `/api/devices` | POST | Create a new device |
| `/api/devices/{uuid}` | DELETE | Delete a device |
| `/api/containers` | GET | List all containers |
| `/api/playbooks` | GET | List all playbooks |
| `/api/playbooks/exec/{uuid}` | POST | Execute a playbook |
| `/api/settings` | GET | Get application settings |

## Security Considerations

When integrating with the SSM API, consider these security best practices:

1. **Token Security**: Store API tokens securely and never expose them in client-side code
2. **Minimal Permissions**: Request only the permissions needed for your integration
3. **Request Validation**: Validate all data before sending to the API
4. **Error Handling**: Never display raw error messages to users