  ,;;:;,
   ;;;;;
  ,:;;:;    ,'=.
  ;:;:;' .=" ,'_\
  ':;:;,/  ,__:=@
   ';;:;  =./)_
     `"=\_  )_"`
          ``'"`
```
Squirrel Servers Manager 🐿️
---
# Users Module

The Users module is responsible for managing user accounts, authentication, and authorization within the Squirrel Servers Manager application. It provides a comprehensive set of features for user management, including CRUD operations, role-based access control, and profile management.

## Features

- User registration and management
- User authentication
- Role-based access control
- User profile management
- Password management (reset, change)
- User preferences
- User activity tracking
- Session management

## Architecture

The module follows the Clean Architecture pattern with proper separation of concerns:

### Domain Layer
- **Entities**: Defines the core business entities like `User`, `Role`, and `Permission`
- **Repository Interfaces**: Defines interfaces for data access like `IUserRepository`
- **Value Objects**: Defines immutable value objects used by the domain entities

### Application Layer
- **Service Interfaces**: Defines interfaces for business logic like `IUserService`
- **Services**: Implements the business logic for user management
- **Use Cases**: Implements specific use cases for user operations

### Infrastructure Layer
- **Repositories**: Implements the repository interfaces for data access
- **Schemas**: Defines the database schemas for user data
- **Mappers**: Maps between domain entities and database schemas

### Presentation Layer
- **Controllers**: Handles HTTP requests and responses
- **DTOs**: Defines the data transfer objects for request/response validation
- **Mappers**: Maps between domain entities and DTOs

## API Endpoints

### GET /users
Returns a list of all users (admin only).

### GET /users/:id
Returns a specific user by ID.

### POST /users
Creates a new user.

### PUT /users/:id
Updates an existing user.

### DELETE /users/:id
Deletes a user.

### GET /users/me
Returns the currently authenticated user.

### PUT /users/me/password
Changes the password for the currently authenticated user.

### POST /users/forgot-password
Initiates the password reset process.

### POST /users/reset-password
Completes the password reset process.

## Data Models

### User
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  password: string; // Hashed
  firstName?: string;
  lastName?: string;
  roles: Role[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Role
```typescript
interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}
```

### Permission
```typescript
interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}
```

## Usage

To use the Users module, import it into your NestJS application:

```typescript
import { UsersModule } from './modules/users';

@Module({
  imports: [
    // ... other modules
    UsersModule,
  ],
})
export class AppModule {}
```

## Testing

The module includes comprehensive tests that mirror the module structure:

- **Domain Layer Tests**: Tests for domain entities and value objects
- **Application Layer Tests**: Tests for services and use cases
- **Infrastructure Layer Tests**: Tests for repositories and mappers
- **Presentation Layer Tests**: Tests for controllers and DTOs

## Future Improvements

- Add support for multi-factor authentication
- Implement OAuth2 integration
- Add support for user activity logging
- Improve role-based access control
- Add support for user groups
- Implement user impersonation for admin users 