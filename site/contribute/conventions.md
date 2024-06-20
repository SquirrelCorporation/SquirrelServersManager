# Coding Conventions for SSM Server

This document outlines the code conventions for SSM Server, an ExpressJS project written in TypeScript. All contributors are expected to follow these conventions for consistency and readability.

## General Principles

- We follow the principles of Object-Oriented Programming (OOP) with an emphasis on immutability.

- The project uses TypeScript for static typing to make our JavaScript code more robust and easier to understand, so please utilize TypeScript features where appropriate.

## Naming Conventions

- Variables and functions should be named in `camelCase` and be descriptive.

```typescript
let userCount;
function getUserCount() { /*...*/ }
```

- Classes should be named using `PascalCase`.

```typescript
class UserAuthentication { /*...*/ }
```

- Constants should use `UPPER_SNAKE_CASE`.

```typescript
const MAX_LOGIN_ATTEMPTS = 5;
```

## ExpressJS Routing

- Each "root" route should have its own file under the `routes` directory.

- Keep route-handling functions light; delegate business logic to the services.

## Error Handling

- Apply middleware for error handling.

- Ensure that asynchronous operations are contained within a `try/catch` block to correctly pass errors to error-handling middleware.

## Async/Await

- Apply async/await syntax for handling promises, as it structures asynchronous code to behave like synchronous code.

## Code Formatting

- Code formatting should be consistent across the project. We use Prettier and ESLint conforming to the Airbnb JavaScript/TypeScript Style Guide.

- Use semicolons at the end of statements.

- Use `===` for comparisons to avoid type coercion.

## Git Commit Messages

- Write commit messages in the present tense (i.e., "add feature" instead of "added feature").

While these guidelines help create consistency, they may not cover every scenario. Thus, use your best judgement where necessary.
