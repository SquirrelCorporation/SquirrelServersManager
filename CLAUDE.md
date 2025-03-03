# CLAUDE.md - Guide for SquirrelServersManager

## Build, Lint & Test Commands
- **Server Build**: `cd server && npm run build`
- **Client Build**: `cd client && npm run build`
- **Server Tests**: `cd server && npm run test` 
- **Client Tests**: `cd client && npm run test`
- **Coverage**: `cd server && npm run coverage`
- **Run Single Test**: `cd server && npx vitest run path/to/test/file.test.ts`
- **Watch Tests**: `cd server && npm run test:dev`

## Code Style Guidelines
- **TypeScript**: Strict typing preferred but noImplicitAny allowed
- **Formatting**: 100 char line length, 2-space indent, LF endings
- **Strings**: Single quotes
- **Naming**: 
  - PascalCase: classes, interfaces, types
  - camelCase: functions, variables, methods
  - ALL_CAPS: constants
- **Imports**: Sorted by groups (built-in → external → internal)
- **Architecture**: NestJS decorators, dependency injection, services
- **Error Handling**: 
  - Proper try/catch with typed errors
  - Consistent API error responses
  - Logger for context-aware errors
- **Testing**: Vitest framework, follow describe/it pattern