---
layout: FeatureGuideLayout
title: "Ansible Global Configuration (ansible.cfg)"
icon: "⚙️"
time: 10 min read
signetColor: '#23233e' # Reference color
nextStep:
  icon: "🔌"
  title: "Ansible Connection Methods"
  description: "Learn about SSH connection methods used by Ansible."
  link: "/docs/reference/ansible/connection-methods"
credits: true
---
The Ansible Configuration system in Squirrel Servers Manager (SSM) provides a robust mechanism for managing Ansible configuration settings. It allows users to view, create, update, and delete configuration entries through a RESTful API. The system ensures that configuration changes are persistent, secure, and properly validated.

:::tip In a Nutshell (🌰)
- SSM provides a complete Ansible configuration management system
- Configuration is stored in standard INI format in `ansible.cfg`
- RESTful API for reading and modifying configuration options
- Security measures prevent prototype pollution and file system attacks
- Detailed documentation for all configuration options with descriptions
:::


## Configuration Architecture

SSM implements the Ansible configuration system using a Clean Architecture approach with the following components:

<MentalModelDiagram 
  title="Ansible Configuration Architecture" 
  imagePath="/images/technical-guide-ansible-ansible-configuration.svg" 
  altText="Ansible Configuration Architecture" 
  caption="Figure 1: Ansible Configuration System" 
/>

### Key Components

1. **Ansible Config Module**
   - **Controller**: Provides REST API endpoints for configuration management
   - **Service**: Contains the business logic for reading and writing configuration
   - **File System Access**: Handles the actual reading and writing of the config file

2. **Configuration Storage**
   - Stored in standard INI format in `ansible.cfg`
   - Located in the SSM data directory (e.g., `.data.prod/config`)
   - Initial configuration copied from template if not present

3. **Integration with Ansible Module**
   - The Ansible module uses the configuration during command execution
   - Configuration path is injected into the environment variable (`ANSIBLE_CONFIG`) when running commands

## Configuration File Format

The Ansible configuration file (`ansible.cfg`) follows the standard INI format with sections and key-value pairs:

```ini
[section_name]
# Description of the configuration option
key_name=value

# Description of a deactivated option
;deactivated_key=value
```

The SSM Ansible Configuration system supports:

- **Multiple sections**: Organize related settings
- **Active/Deactivated entries**: Comment out options with a semicolon (`;`)
- **Descriptions**: Document the purpose and valid values for each option (used by SSM's API/UI)

## Configuration API

SSM provides a REST API for managing Ansible configuration programmatically.

*(Note: Base path `/api/` precedes these routes)*

### Get Configuration

```http
GET /api/ansible-config
```

Returns the complete Ansible configuration as a JSON object, including descriptions and activation status:

```json
{
  "defaults": {
    "host_key_checking": {
      "value": "False",
      "deactivated": false,
      "description": "Whether to verify host keys"
    },
    // ... other entries
  },
  "privilege_escalation": {
    "become": {
      "value": "False",
      "deactivated": false,
      "description": "Toggles the use of privilege escalation"
    }
    // ... other entries
  }
}
```

### Create Configuration Entry

```http
POST /api/ansible-config
```

Request body:

```json
{
  "section": "defaults",
  "key": "new_option",
  "value": "some_value",
  "deactivated": false,
  "description": "Description for the new option"
}
```

### Update Configuration Entry

```http
PUT /api/ansible-config
```

Request body (identifies entry by section and key):

```json
{
  "section": "defaults",
  "key": "host_key_checking",
  "value": "True", // New value
  "deactivated": false,
  "description": "Updated description"
}
```

### Delete Configuration Entry

```http
DELETE /api/ansible-config
```

Request body (identifies entry by section and key):

```json
{
  "section": "defaults",
  "key": "host_key_checking"
}
```

## Common Configuration Options

SSM's Ansible configuration includes many standard Ansible options. Here are some common ones you might interact with:

### [defaults] Section

| Option | Description | Default | Recommended Value/Note |
|--------|-------------|---------|------------------------|
| `host_key_checking` | Controls SSH host key verification | True | `False` often used in non-interactive/dev environments, but less secure. |
| `inventory` | Path to inventory files | /etc/ansible/hosts | SSM manages inventory dynamically; this default is usually ignored. |
| `timeout` | Connection timeout in seconds | 10 | Increase (e.g., `30`) for slow networks or long-running connections. |
| `remote_user` | Default user for SSH connections | Current user | Usually overridden by device-specific settings in SSM. |
| `interpreter_python` | Path to Python on target hosts | auto | `auto` is generally best for auto-detection. |
| `forks` | Maximum parallel processes | 5 | Increase for faster execution on multiple hosts, resource permitting. |
| `pipelining` | Reduces SSH operations for performance | False | `True` can significantly speed up playbooks but requires `requiretty` disabled in sudoers on targets. |

### [privilege_escalation] Section

| Option | Description | Default | Recommended Value/Note |
|--------|-------------|---------|------------------------|
| `become` | Enable privilege escalation globally | False | Usually managed per-device or per-play in SSM, but can set a default. |
| `become_method` | Method for escalation (`sudo`, `su`, etc.) | sudo | `sudo` is most common. |
| `become_user` | Target user for escalation | root | Typically `root`. |
| `become_ask_pass` | Prompt for privilege password | False | Should remain `False` as SSM handles passwords via vault. |

### [ssh_connection] Section

| Option | Description | Default | Recommended Value/Note |
|--------|-------------|---------|------------------------|
| `ssh_args` | Additional arguments for the `ssh` command | `-C -o ControlMaster=auto -o ControlPersist=60s` | Default enables compression and connection sharing. Modify with caution. |
| `control_path_dir` | Directory for SSH control path sockets | `~/.ansible/cp` | Default is usually fine. |
| `pipelining` | Same as `pipelining` in `[defaults]` | Value from `[defaults]` | Set `True` here or in `[defaults]` for performance. |

For a full list, see the official [Ansible Configuration Settings documentation](https://docs.ansible.com/ansible/latest/reference_appendices/config.html#ansible-configuration-settings).

## Security Considerations

The SSM Ansible Configuration system includes safeguards:

-   **Prototype Pollution Prevention**: Rejects section/key names like `__proto__`.
-   **Safe File Operations**: Ensures edits only occur within the expected `ansible.cfg` file path.
-   **Input Validation**: API endpoints validate incoming data structure and types.
-   **Error Handling**: Provides informative errors without exposing excessive system detail.

## Integration with Ansible Execution

SSM ensures Ansible uses the managed `ansible.cfg` by:

1.  **Setting Environment Variable**: Sets the `ANSIBLE_CONFIG` environment variable to point to the specific `ansible.cfg` file path before running `ansible-runner`.
2.  **Providing Defaults**: Ships with a sensible default `ansible.cfg` to ensure consistent operation.

This allows users to customize global Ansible behavior within the SSM context. 