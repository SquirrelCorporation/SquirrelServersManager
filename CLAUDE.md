# CLAUDE.md - Guide for SquirrelServersManager

## Build, Lint & Test Commands
- **Server Build**: `cd server && npm run build`
- **Client Build**: `cd client && npm run build`
- **Server Dev**: `cd server && npm run dev`
- **Server Tests**: `cd server && npm run test` 
- **Client Tests**: `cd client && npm run test`
- **Run Single Test**: `cd server && npx vitest run path/to/test/file.spec.ts`
- **Test Specific Module**: `cd server && npx vitest run src/modules/ansible/__tests__`
- **Watch Tests**: `cd server && npm run test:dev`
- **Coverage**: `cd server && npm run coverage`
- **ESLint**: `cd server && npx eslint "src/**/*.ts"`

## Code Style Guidelines
- **TypeScript**: Strict typing with noImplicitAny allowed
- **Formatting**: 2-space indent, LF, curly braces required, single quotes
- **Imports**: Sort order: builtin → external → internal with no lines between
- **Architecture**: 
  - NestJS modular design with Clean Architecture layers
  - Tests under `__tests__` directories mirroring module structure
  - Files end with .spec.ts for tests
- **Naming**: 
  - PascalCase: classes, interfaces, types, decorators
  - camelCase: functions, variables, methods, properties
  - ALL_CAPS: constants
- **Error Handling**: Typed errors, proper try/catch, API error responses
- **Path Aliases**: @modules/, @common/, @config/, @infrastructure/