# SquirrelServersManager: Improvement Action Plan

This document outlines detailed action plans for improving several areas of the SquirrelServersManager codebase, focusing on standardizing error handling, enhancing test coverage, addressing technical debt, refining module architecture, strengthening security, and optimizing performance.

## 1. Standardize Error Handling

**Current Status:** The codebase uses both a NestJS exception filter (`HttpExceptionFilter`) and a custom error system (`ApiError` hierarchy).

**Goal:** Establish a single, consistent error handling pattern across all modules.

### Action Items

- [x] **Create a new unified error handling framework**
   - [x] Create standardized exception classes extending NestJS `HttpException`
   - [x] Design a response format that maintains backward compatibility with existing APIs
   - [x] Implement HTTP exception filter that handles both new and legacy errors
   - [x] Create custom exceptions for different error types with proper context support

- [x] **Implement exception mappers**
   - [x] Create `ExceptionFactory` to convert between legacy `ApiError` types and new exceptions
   - [x] Develop `ErrorTransformerInterceptor` to standardize error responses
   - [x] Create unified `TransformInterceptor` for consistent success responses

- [x] **Gradual migration plan**
   - [x] Start with high-activity modules (e.g., DevicesModule, ContainersModule)
   - [x] Add the new error handling approach to controllers first
   - [x] Implement typed exceptions for common error scenarios
   - [x] Create bridge mechanisms between legacy and new error handling

- [x] **Documentation and standards**
   - [x] Document the new error handling approach in `CODE_GUIDELINES.md`
   - [x] Create examples for common error scenarios in the documentation directory
   - [x] Provide sample code with exception usage patterns

- [x] **Validation and standardization**
   - [x] Ensure all error responses include:
     - [x] HTTP status code
     - [x] Error code/type
     - [x] Human-readable message
     - [x] Optional contextual data
   - [x] Add logging for all exceptions with appropriate context
   - [x] Implement global exception handling for unhandled errors
   - [x] Migrate legacy error handling classes to a compatibility layer

## 2. Enhance Test Coverage

**Current Status:** 108 spec files vs 623 total implementation files (~17% coverage).

**Goal:** Increase test coverage to at least 60% of critical code paths.

### Action Items

- [ ] **Test strategy documentation**
   - [ ] Define test coverage goals for each module layer:
     - [ ] Domain layer: 80%
     - [ ] Application layer: 70%
     - [ ] Infrastructure layer: 50%
     - [ ] Presentation layer: 40%
   - [ ] Document testing patterns and best practices

- [ ] **Prioritized test implementation**
   - [ ] Create a testing priority matrix:
     - [ ] Domain entities and core business logic
     - [ ] Application services
     - [ ] Repository implementations
     - [ ] Controllers and DTOs
   - [ ] Focus first on modules with highest business impact:
     - [ ] Devices, Containers, Ansible, Playbooks

- [ ] **Testing templates and utilities**
   - [ ] Develop standardized testing templates for each layer
   - [ ] Create test utilities for common operations:
     - [ ] Repository mocking helpers
     - [ ] Service test factories
     - [ ] Controller testing utilities

- [ ] **Integration test framework**
   - [ ] Enhance integration test suite for critical user journeys:
     - [ ] Device registration and management
     - [ ] Container deployment and monitoring
     - [ ] Playbook execution
   - [ ] Implement test database setup/teardown helpers

- [ ] **CI/CD integration**
   - [ ] Configure test coverage reporting in CI pipeline
   - [ ] Add test coverage checks for new PRs
   - [ ] Create dashboards to track coverage metrics over time
   - [ ] Implement automatic test runs for affected modules

## 3. Address Technical Debt

**Current Status:** Numerous TODOs scattered throughout the codebase, particularly in repositories and mappers.

**Goal:** Systematically identify, prioritize, and address technical debt.

### Action Items

- [ ] **Technical debt inventory**
   - [ ] Create an automated script to extract TODOs and FIXMEs
   - [ ] Categorize issues by:
     - [ ] Severity (critical, major, minor)
     - [ ] Age (using git blame)
     - [ ] Module impact
   - [ ] Document all legacy compatibility code

- [ ] **Debt prioritization framework**
   - [ ] Develop a scoring system based on:
     - [ ] Risk to system stability
     - [ ] Development friction caused
     - [ ] Effort to fix
     - [ ] Business impact
   - [ ] Create a prioritized backlog in the issue tracker

- [ ] **Gradual cleanup plan**
   - [ ] Allocate percentage of development time to technical debt reduction
   - [ ] Target complete TODO removal from critical paths
   - [ ] Focus on high-impact areas first:
     - [ ] Repository implementations
     - [ ] Mapper implementations
     - [ ] Legacy compatibility bridges

- [ ] **Legacy code migration**
   - [ ] Address global app reference in `app.module.ts`
   - [ ] Refactor shared mongoose connection to use NestJS patterns
   - [ ] Modernize legacy component interfaces

- [ ] **Continuous monitoring**
   - [ ] Add linter rules to prevent new TODOs without issue references
   - [ ] Configure static analysis to track technical debt metrics
   - [ ] Schedule regular debt review sessions

## 4. Refine Module Architecture

**Current Status:** Several modules use `forwardRef()`, indicating circular dependencies. Component factories within modules might benefit from restructuring.

**Goal:** Establish a cleaner architecture with proper dependency management and clear boundaries.

### Action Items

- [ ] **Dependency analysis and refactoring**
   - [ ] Map out all module dependencies
   - [ ] Identify and resolve circular dependencies:
     - [ ] Extract shared interfaces to separate modules
     - [ ] Use event-driven communication where appropriate
     - [ ] Apply mediator pattern for complex interactions
   - [ ] Document proper dependency patterns in architecture guidelines

- [ ] **Component organization**
   - [ ] Evaluate registry/watcher components for extraction:
     - [ ] Move Docker registry components to a `registries` submodule
     - [ ] Extract watcher components to a `watchers` submodule
   - [ ] Apply factory pattern consistently for component creation

- [ ] **Module boundary enforcement**
   - [ ] Strengthen module encapsulation:
     - [ ] Review and restrict exports to service interfaces only
     - [ ] Ensure no repository leakage across module boundaries
     - [ ] Implement proper dependency injection for all cross-module communication
   - [ ] Update linter rules to enforce architecture guidelines

- [ ] **Interface standardization**
   - [ ] Review and standardize service interfaces:
     - [ ] Consistent naming patterns
     - [ ] Clear method signatures with proper typing
     - [ ] Comprehensive JSDoc documentation
   - [ ] Use abstract classes for common implementation patterns

- [ ] **Port-adapter implementation**
   - [ ] Refactor external integrations to use port-adapter pattern:
     - [ ] Docker API integration
     - [ ] Git operations
     - [ ] SSH connections
   - [ ] Create clear adapter interfaces for external dependencies

## 5. Strengthen Security

**Current Status:** Basic authentication with potential for improvement in modern token-based approaches and API protection.

**Goal:** Implement robust security measures to protect the application and its APIs.

### Action Items

- [ ] **Multi-strategy Authentication**
   - [x] JWT-based authentication (already implemented)
   - [x] Configure global JWT protection:
     - [x] Import JwtAuthGuard and Reflector in App.ts
     - [x] Apply global JWT verification to all routes by default
     - [x] Confirm @Public() decorator works to exclude specific endpoints
   - [x] Implement API key (Bearer token) authentication:
     - [x] Add BearerStrategy for API key authentication
     - [x] Create unified AuthStrategy that tries multiple auth methods
     - [x] Update JwtAuthGuard to use the combined strategy
     - [x] Ensure User Repository supports findByApiKey method
   - [ ] Enhance token management:
     - [ ] Implement refresh token mechanism
     - [ ] Store token blacklist in Redis
   - [ ] Review and update token expiration policies

- [ ] **API protection**
   - [x] Implement rate limiting:
     - [x] Add `@nestjs/throttler` module
     - [x] Configure Redis-based rate limiting with 60 requests per minute
     - [x] Create SkipThrottle decorator for select endpoints
   - [ ] Add request validation:
     - [ ] Input sanitization for all endpoints
     - [ ] Enhanced validation pipes
     - [ ] Custom validators for complex business rules

- [ ] **Security headers**
   - [x] Implement security headers middleware:
     - [x] Content-Security-Policy
     - [x] X-Content-Type-Options
     - [x] X-Frame-Options
     - [x] Strict-Transport-Security
   - [x] Add Helmet integration
   - [x] Configure specific CSP directives for application needs

- [ ] **Authorization enhancements**
   - [x] Implement fine-grained role-based access control:
     - [x] Create `RolesGuard` to check permissions
     - [x] Add typed `Roles` decorator with proper enum typing
     - [x] Implement resource-based permissions system
     - [x] Create resource-action decorators
   - [ ] Implement proper context propagation in event handlers

- [ ] **Security monitoring**
   - [x] Add comprehensive audit logging:
     - [x] Create AuditLogService with MongoDB storage
     - [x] Add interceptor for resource access auditing
     - [x] Record authentication attempts
     - [x] Track all operations with success/failure status
     - [x] Include user details, IP address, and timestamp
   - [ ] Implement IP-based anomaly detection

## 6. Optimize Performance

**Current Status:** Basic caching with room for more granular control and database optimization.

**Goal:** Enhance performance through targeted optimizations to caching, database operations, and connection handling.

### Action Items

- [ ] **Enhanced caching strategy**
   - [ ] Implement tiered caching architecture:
     - [ ] In-memory cache for frequently accessed data
     - [ ] Redis cache for distributed data
     - [ ] Cache invalidation strategies for each data type
   - [ ] Create custom cache decorators for method-level control
   - [ ] Add cache hit/miss metrics for monitoring

- [ ] **Database optimization**
   - [ ] Review and optimize MongoDB schemas:
     - [ ] Add strategic indexes for common queries
     - [ ] Implement compound indexes for multi-field queries
     - [ ] Optimize schema design for common access patterns
   - [ ] Document MongoDB performance best practices

- [ ] **Connection pooling refinement**
   - [ ] Fine-tune database connection pools:
     - [ ] Analyze connection usage patterns
     - [ ] Adjust minimum and maximum pool sizes based on load
     - [ ] Implement connection monitoring
   - [ ] Optimize Redis connection configuration

- [ ] **Query optimization**
   - [ ] Audit and optimize critical queries:
     - [ ] Use MongoDB projection to limit returned fields
     - [ ] Implement pagination consistently
     - [ ] Use aggregation pipelines for complex operations
   - [ ] Add query execution time logging for slow queries

- [ ] **Resource monitoring**
   - [ ] Implement comprehensive performance monitoring:
     - [ ] Response time tracking
     - [ ] Memory usage monitoring
     - [ ] Connection pool utilization
     - [ ] Cache hit ratio
   - [ ] Create performance dashboards
   - [ ] Set up alerting for performance degradation

## Implementation Priority

The improvements will be implemented in parallel, with focus on the most impactful items first:

1. Error handling standardization and security improvements (highest priority)
2. Technical debt reduction and module architecture refinements
3. Test coverage expansion and performance optimizations

Progress will be tracked by checking off completed items in this document.