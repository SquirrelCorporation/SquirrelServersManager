```ascii
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
# Auth Module

## Overview

The Auth Module provides comprehensive authentication and authorization functionality within the Squirrel Servers Manager application. It implements multiple authentication strategies including JWT tokens and API keys, following Clean Architecture principles to ensure security, maintainability, and flexibility.

## Features

- Multiple authentication strategies
  - JWT token authentication via cookies
  - Bearer token authentication (API keys)
  - Custom strategy for fallback handling
- Secure session management
- Role-based access control
- API key authentication
- Token expiration handling
- Passport.js integration
- JWT token management
- Guard-based route protection

## Architecture

The module follows the Clean Architecture pattern with proper separation of concerns:

### Domain Layer

Contains the core interfaces and types:

- **Interfaces**
  - `jwt-strategy.interface.ts`: JWT strategy contract
  - `jwt-auth-guard.interface.ts`: Auth guard contract

### Application Layer

Contains the authentication strategies and guards:

- **Strategies**
  - `auth.strategy.ts`: Multi-method authentication strategy
  - `jwt.strategy.ts`: JWT token validation
  - `bearer.strategy.ts`: API key validation
- **Guards**
  - `jwt-auth.guard.ts`: Route protection guard

### Infrastructure Layer

Contains external service integrations:

- JWT service configuration
- Passport.js integration
- Cookie handling

### Presentation Layer

Contains interceptors and decorators:

- **Interceptors**
  - Authentication flow handling
  - Request/response transformation
- **Decorators**
  - Route protection
  - User context injection

## Module Structure

```
auth/
├── strategies/
│   ├── auth.strategy.ts
│   ├── jwt.strategy.ts
│   ├── bearer.strategy.ts
│   ├── jwt-auth.guard.ts
│   ├── jwt-strategy.interface.ts
│   └── jwt-auth-guard.interface.ts
├── interceptors/
├── auth.module.ts
└── README.md
```

## Integration

The module is integrated through dependency injection:

```typescript
@Module({
  imports: [
    PassportModule,
    UsersModule,
    JwtModule.register({
      secret: SECRET,
      signOptions: { expiresIn: '8h' },
    }),
  ],
  providers: [
    JwtStrategy,
    BearerStrategy,
    AuthStrategy,
    JwtAuthGuard,
  ],
  exports: [
    PassportModule,
    JwtAuthGuard,
    JwtModule,
  ],
})
```

## Authentication Flow

1. **JWT Token Authentication**
   - Checks for JWT token in cookies
   - Validates token signature and expiration
   - Retrieves user from repository
   - Returns user if valid

2. **Bearer Token Authentication**
   - Checks for Bearer token in Authorization header
   - Validates API key against user repository
   - Returns user if valid

3. **Custom Strategy**
   - Attempts JWT authentication first
   - Falls back to Bearer token if JWT fails
   - Throws UnauthorizedException if all methods fail

## Usage

### Protecting Routes

```typescript
@UseGuards(JwtAuthGuard)
@Controller('protected')
export class ProtectedController {
  @Get()
  getProtectedResource() {
    // Only authenticated users can access
  }
}
```

### Accessing User Context

```typescript
@Controller('api')
export class ApiController {
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }
}
```

## Recent Changes

- Enhanced multi-strategy authentication
- Improved token expiration handling
- Added API key authentication
- Enhanced security measures
- Improved error handling
- Added comprehensive test coverage 