# CLI Linter for SquirrelServersManager

This directory contains scripts for linting and code quality checks.

## Lint Check Script

The `lint-check.js` script provides a CLI interface to run ESLint on specified files or directories. It's designed to help verify your code against the project's coding standards.

### Features

- Run ESLint on specific files or directories
- Automatically fix problems when possible
- Detailed output with error and warning counts
- Customizable file patterns
- Color-coded output for better readability

### Usage

```bash
# Basic usage
npm run lint:check src/pages/Devices

# With auto-fix
npm run lint:check:fix src/pages/Devices

# Check a specific file
npm run lint:check src/pages/Devices/index.tsx

# Check multiple paths
npm run lint:check src/components src/pages/Devices

# With custom pattern (only TypeScript files)
node scripts/lint-check.js --pattern "**/*.ts" src
```

### Command Line Options

- `--fix`: Automatically fix problems when possible
- `--verbose`: Show detailed output
- `--pattern`: Specify file pattern (default: "**/*.{ts,tsx,js,jsx}")
- `--help`: Show help

### NPM Scripts

The following npm scripts are available:

- `npm run lint:check`: Run the linter without fixing
- `npm run lint:check:fix`: Run the linter with auto-fix

## Custom ESLint Configuration

The project includes a custom ESLint configuration for the refactored components in `src/pages/Devices/.eslintrc.js`. This configuration enforces:

- Comprehensive JSDoc documentation
- React best practices
- Proper hook usage
- TypeScript naming conventions
- Code complexity limits
- Accessibility standards

## Integration with CI/CD

You can integrate this linter into your CI/CD pipeline by adding the following step:

```yaml
- name: Lint Check
  run: npm run lint:check src/pages/Devices
```

This will fail the build if there are any linting errors, ensuring code quality standards are maintained.

## Extending the Linter

To extend the linter with additional rules or configurations:

1. Modify the `.eslintrc.js` file in the relevant directory
2. Update the `lint-check.js` script if needed
3. Add new npm scripts for specific linting tasks

## Best Practices

- Run the linter before committing changes
- Fix all errors and address warnings when possible
- Use the custom ESLint configuration as a guide for writing high-quality code
- Add JSDoc comments to all functions, interfaces, and classes
- Follow the naming conventions established in the codebase
