# Module Isolation Plan

This document outlines a comprehensive plan to improve module isolation in the SquirrelServersManager server architecture, reducing coupling between modules and improving maintainability.

## Table of Contents
- [Background and Rationale](#background-and-rationale)
- [Current Architecture Analysis](#current-architecture-analysis)
- [Implementation Plan](#implementation-plan)
  - [Phase 1: Core Architecture Improvements](#phase-1-core-architecture-improvements)
  - [Phase 2: Breaking Circular Dependencies](#phase-2-breaking-circular-dependencies)
  - [Phase 3: Shared Library Isolation](#phase-3-shared-library-isolation)
  - [Phase 4: Validation and Testing](#phase-4-validation-and-testing)
- [Implementation Timeline](#implementation-timeline)

## Background and Rationale

The current architecture follows Clean Architecture principles but has developed several circular dependencies and tight coupling between modules. This leads to:

- Difficulty in testing individual modules
- Cascading changes (changes in one module affect many others)
- Increased cognitive load for developers
- Challenges in maintaining and extending the codebase

## Current Architecture Analysis

Key issues identified:

1. **Circular Dependencies**:
   - Ansible ↔ Devices
   - Containers ↔ Statistics
   - Container-Stacks ↔ ContainerStacksService (internal)
   - Remote-System-Information ↔ Devices
   - WatcherEngineService ↔ ContainerRegistriesService (internal)

2. **Heavy External Coupling**:
   - Shared library (ssm-shared-lib) used extensively across modules
   - Direct imports between unrelated modules

3. **Inconsistent DI Patterns**:
   - Mix of direct class injection and token-based injection
   - Inconsistent repository access patterns

## Implementation Plan

### Phase 1: Core Architecture Improvements

- [ ] **Create Core Module Layer**
  - [ ] Create a new `core` directory structure to house shared interfaces
  - [ ] Define core domain entities free from infrastructure dependencies
  - [ ] Extract common types used across multiple modules
  - [ ] Implement domain events interface for cross-module communication

- [ ] **Standardize Dependency Injection**
  - [ ] Audit all modules and convert direct class injections to token-based
  - [ ] Create consistent pattern for repository injection
  - [ ] Document standard DI patterns in CODE_GUIDELINES.md

- [ ] **Enhance Event System**
  - [ ] Define standard event types and structures
  - [ ] Create centralized event catalog with documentation
  - [ ] Implement typed event emitters and handlers

### Phase 2: Breaking Circular Dependencies

- [ ] **Ansible ↔ Devices Decoupling**
  - [ ] Extract `DeviceConnectionModule` from Devices and Ansible
    - [ ] Move SSH connection logic to this module
    - [ ] Create device connection interfaces
    - [ ] Update both modules to depend on connection abstractions
  - [ ] Implement adapter pattern for Device authentication in Ansible
  - [ ] Replace direct service calls with events

- [ ] **Containers ↔ Statistics Decoupling**
  - [ ] Create `ContainerMetricsInterface` in core module
  - [ ] Implement adapter in Statistics module to translate container data
  - [ ] Use events for statistics collection triggers
  - [ ] Remove direct dependency on Containers in Statistics
  
- [ ] **Internal Module Refactoring**
  - [ ] Split `ContainerStacksService` into specialized services
  - [ ] Implement mediator pattern for Container operations
  - [ ] Refactor `WatcherEngineService` to use events instead of direct injection

### Phase 3: Shared Library Isolation

- [ ] **Reduce ssm-shared-lib Dependencies**
  - [ ] Audit all usages of shared library types
  - [ ] Create module-specific DTOs that don't inherit from shared library
  - [ ] Implement mappers between module types and shared library types
  - [ ] Move toward using module-specific types internally

- [ ] **Module-Specific Types**
  - [ ] Create module-specific entities that don't extend shared types
  - [ ] Implement bidirectional mappers in the presentation layer
  - [ ] Use internal types exclusively in service and repository layers

- [ ] **External API Boundaries**
  - [ ] Define clear module boundaries with facade pattern
  - [ ] Create module-specific public APIs 
  - [ ] Document module interfaces as contracts

### Phase 4: Validation and Testing

- [ ] **Create Module Isolation Tests**
  - [ ] Implement tests that verify modules can function independently
  - [ ] Create integration tests for module boundaries
  - [ ] Validate event-driven communication

- [ ] **Module Dependency Visualization**
  - [ ] Generate dependency graph before and after changes
  - [ ] Document improvements in module coupling
  - [ ] Create architectural decision records (ADRs)

- [ ] **Performance Validation**
  - [ ] Benchmark system before and after changes
  - [ ] Ensure event-driven approach doesn't impact performance
  - [ ] Optimize critical paths as needed

## Implementation Timeline

| Phase | Estimated Duration | Dependencies |
|-------|-------------------|--------------|
| Phase 1: Core Architecture | 2-3 weeks | None |
| Phase 2: Breaking Circular Dependencies | 3-4 weeks | Phase 1 |
| Phase 3: Shared Library Isolation | 2-3 weeks | Phase 1 |
| Phase 4: Validation and Testing | 1-2 weeks | Phases 2 & 3 |

**Total Estimated Timeline**: 8-12 weeks for full implementation

## Sample Implementation: Telemetry Module as Reference

The Telemetry module serves as an excellent reference for a well-isolated module:

1. **Clear boundaries**: Only depends on ConfigModule and CACHE_MANAGER
2. **Self-contained**: All required types defined within the module
3. **Event-driven**: Uses @OnEvent decorator for communication
4. **Simple interface**: Exports minimal public API

Other modules should be refactored to follow this pattern where possible.