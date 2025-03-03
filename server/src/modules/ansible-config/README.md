# Ansible Configuration Module

This NestJS module provides a centralized way to manage Ansible configuration files. It offers a complete set of CRUD operations for Ansible configuration entries, with proper validation, error handling, and security measures.

## Features

- **Read Configuration**: Parse and read Ansible configuration files
- **Write Configuration**: Write configuration entries to Ansible configuration files
- **Create/Update/Delete Entries**: Manage individual configuration entries
- **Security**: Protection against prototype pollution and other security concerns
- **Validation**: Input validation for configuration entries
- **Error Handling**: Comprehensive error handling for all operations

## API Endpoints

The module exposes the following REST endpoints:

- `GET /api/ansible/configuration`: Get the complete Ansible configuration
- `POST /api/ansible/configuration`: Create a new configuration entry
- `PUT /api/ansible/configuration`: Update an existing configuration entry
- `DELETE /api/ansible/configuration`: Delete a configuration entry

## Usage Examples

### Get Configuration

```typescript
// Service usage
const config = ansibleConfigService.readConfig();

// API usage
const response = await fetch('/api/ansible/configuration');
const data = await response.json();
```

### Create Configuration Entry

```typescript
// Service usage
ansibleConfigService.createConfigEntry(
  'defaults',
  'host_key_checking',
  'False',
  false,
  'Host key checking setting'
);

// API usage
await fetch('/api/ansible/configuration', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    section: 'defaults',
    key: 'host_key_checking',
    value: 'False',
    deactivated: false,
    description: 'Host key checking setting'
  })
});
```

### Update Configuration Entry

```typescript
// Service usage
ansibleConfigService.updateConfigEntry(
  'defaults',
  'host_key_checking',
  'True',
  false,
  'Updated host key checking setting'
);

// API usage
await fetch('/api/ansible/configuration', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    section: 'defaults',
    key: 'host_key_checking',
    value: 'True',
    deactivated: false,
    description: 'Updated host key checking setting'
  })
});
```

### Delete Configuration Entry

```typescript
// Service usage
ansibleConfigService.deleteConfigEntry('defaults', 'host_key_checking');

// API usage
await fetch('/api/ansible/configuration', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    section: 'defaults',
    key: 'host_key_checking'
  })
});
```

## Dependencies

- NestJS framework
- FileSystemService from ShellModule
- Node.js fs module

## Security Considerations

- The module prevents prototype pollution by validating section and key names
- All inputs are validated using class-validator
- Proper error handling prevents information leakage
- File operations are performed securely

## Testing

The module includes comprehensive unit tests for both the service and controller components. Run the tests using:

```bash
npm test
```
