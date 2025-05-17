---
layout: FeatureGuideLayout
title: "Ansible Connection Guide"
icon: "🔌"
time: 10 min read
signetColor: '#23233e' # Reference color
nextStep:
  icon: "⚙️"
  title: "Ansible Global Configuration (ansible.cfg)"
  description: "Learn about global Ansible settings in SSM."
  link: "/docs/reference/ansible/configuration"
credits: true
---
The Ansible Connection system in Squirrel Servers Manager is responsible for establishing secure SSH connections between the SSM server and target devices when executing Ansible commands and playbooks. The connection system handles authentication, privilege escalation, connection methods, and inventory management to ensure reliable and secure execution of Ansible tasks.

:::tip In a Nutshell (🌰)
- SSM provides direct SSH connectivity to target devices for Ansible command execution
- Supports multiple SSH authentication methods: password, key-based, and passwordless
- Enables privileged command execution via become methods (sudo, su, etc.)
- Handles connection parameters and inventory dynamically using Vault for security
- Uses ansible-runner for asynchronous execution with real-time status updates
:::


## Connection Architecture

SSM uses a layered architecture for Ansible connections:

1. **NestJS Service Layer**: High-level services to build and execute Ansible commands.
2. **Inventory Transformation Layer**: Converts device records to Ansible-compatible inventory.
3. **Python-based Ansible Runner**: Script that interfaces with the `ansible-runner` library.
4. **SSH Connection Layer**: Establishes the secure shell connection to target devices.

<MentalModelDiagram 
  title="Ansible Connection Architecture" 
  imagePath="/images/technical-guide-ansible-ansible-connection.svg" 
  altText="Ansible Connection Architecture" 
  caption="Figure 1: Ansible Connection Flow" 
/>

## Connection Methods

SSM supports two primary SSH connection methods through Ansible, configurable per device:

| Connection Method | Implementation | Pros | Cons |
|-------------------|----------------|------|------|
| **Paramiko (Default)** | Python-based SSH implementation | Cross-platform, Good password/key+passphrase auth support | Less performance for large file transfers |
| **OpenSSH** | Native OpenSSH implementation (`ssh` command) | Faster, Better key management (agent, ~/.ssh/config) | Requires OpenSSH client on controller, No key passphrase support via SSM |

- **Default Logic**: `paramiko` is often the default, especially for password/key+passphrase auth. `ssh` might be default for passwordless auth.
- **Configuration**: Change via Device Configuration > SSH > Show Advanced > Connection Method.

:::warning OpenSSH Passphrase Limitation
The `ssh` (OpenSSH) connection method does **not** support SSH private keys protected by a passphrase when configured through SSM.
:::

## Authentication Methods

SSM supports standard SSH authentication methods, configured per device:

1.  **Password Authentication**
    - Uses username and password.
    - Credentials stored encrypted via Vault.
    - Example Config: `{ authType: SsmAnsible.SSHType.UserPassword, sshUser: 'user', sshPwd: 'vaulted_pass', ... }`

2.  **Key-Based Authentication**
    - Uses SSH private key (stored securely, potentially passphrase protected via Vault).
    - Example Config: `{ authType: SsmAnsible.SSHType.KeyBased, sshUser: 'user', sshKey: 'vaulted_key', sshKeyPass: 'vaulted_passphrase', ... }`

3.  **Passwordless Authentication**
    - Relies on pre-configured keys (e.g., in `~/.ssh/authorized_keys`) without passphrases or SSH agent forwarding.
    - Example Config: `{ authType: SsmAnsible.SSHType.PasswordLess, sshUser: 'user', ... }`

## Privilege Escalation (Become)

SSM configures Ansible's `become` settings based on device configuration to run tasks with elevated privileges.

| Become Method | Description | Common Use Cases |
|---------------|-------------|-----------------|
| `sudo` (Default) | Standard sudo command | Most Linux distributions |
| `su` | Switch user | Systems without sudo |
| `pbrun` | PowerBroker run | Enterprise environments |
| `pfexec` | Profile-based execution | Solaris systems |
| `doas` | OpenBSD's alternative | BSD systems |
| `dzdo` | Centrify DirectAuthorize | Centrify environments |
| `ksu` | Kerberos substitute user | Kerberos environments |
| `runas` | Run as different user | Windows systems |
| `machinectl` | Systemd container interface | Container systems |

- **Configuration**: Set via Device Configuration > SSH > Sudo Method, Sudo Password, Sudo User, Become Method (Advanced).
- **Security**: Passwords stored encrypted via Vault.

## Inventory Management

The `InventoryTransformerService` dynamically generates Ansible inventory JSON for each run.

- **Dynamic**: Based on selected devices.
- **Includes**: Connection info, `ansible_` variables, vaulted credentials.
- **Temporary Keys**: Creates temp files for private keys, cleans up afterwards.

Example inventory structure snippet:

```json
{
  // ... meta ...
  "group_name": {
    "hosts": ["192.168.1.100"],
    "vars": {
      "ansible_connection": "paramiko",
      "ansible_user": "admin",
      "ansible_ssh_pass": {"__ansible_vault": "..."},
      "ansible_become_method": "sudo",
      "ansible_become_user": "root",
      "ansible_become_pass": {"__ansible_vault": "..."},
      // ... other vars ...
    }
  }
}
```

## Secure Password Handling

SSM uses Ansible Vault for security:

1.  Passwords/Keys encrypted in DB (AES-256).
2.  Custom Vault password client securely provides decryption key to `ansible-runner` via API call (authenticated with SSM API key).
3.  Temporary private key files created with strict permissions and auto-deleted.

## Connection Flow Summary

1.  **Prepare**: Generate execution ID, parse options, prepare extra vars.
2.  **Inventory**: Retrieve device auth, generate inventory JSON, create temp keys.
3.  **Execute**: Invoke `ansible-runner` with parameters.
4.  **Monitor**: Stream events/status via WebSockets, store results.
5.  **Cleanup**: Remove temp files, release resources.

## Customizing Connection Parameters

Some parameters can be adjusted in device settings or potentially `ansible.cfg`:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `sshPort` | SSH port number | 22 |
| `strictHostKeyChecking` | Verify host keys (`ansible.cfg`) | `true` |
| `sshCommonArgs` | Additional SSH arguments (`ansible.cfg`) | `""` |
| `sshConnection` | Connection type (paramiko/ssh) | Varies |

## Troubleshooting Connection Issues

| Issue | Solution |
|-------|----------|
| Authentication Failures | Check credentials, key permissions, user shell access. |
| Privilege Escalation Issues | Check `become` user/password, `sudo` config (`requiretty`). |
| Connection Timeouts | Check network connectivity, firewalls, increase `timeout` in `ansible.cfg`. |
| Host Key Issues | Disable `host_key_checking` in `ansible.cfg` (less secure) or manage `known_hosts`. | 