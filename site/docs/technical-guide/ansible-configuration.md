# Ansible Configuration

`Settings` => "Advanced" tab ; `Ansible Configuration (ansible.cfg)`;

![ansible-conf](/technical-guide/ansible/ansible-configuration.png)

## What is ansible.cfg?
The `ansible.cfg` file is the primary configuration file for Ansible. It allows users to customize the behavior of Ansible’s commands and modules. This file can set default values for various settings, such as inventory paths, remote user credentials, connection parameters, and more.

:::info
The `ansible.cfg` file is used by every playbook execution by SSM.
:::

## Sections in `ansible.cfg`
The `ansible.cfg` file contains various sections, each controlling a different aspect of Ansible's operation. Key sections include:
- **Defaults**: Sets default behavior for Ansible commands.
- **Privilege Escalation**: Configures parameters for privilege escalation (become).
- **SSH Connection**: Manages SSH connection parameters.
- **Inventory**: Specifies paths and settings for inventory files.
- **Logging**: Configures logging options.
- **Retries**: Sets retry parameters for unreachable hosts.

For further information, see [Ansible Configuration Settings](https://docs.ansible.com/ansible/latest/reference_appendices/config.html#ansible-configuration-settings).

## Customizing `ansible.cfg` in SSM
Ansible configuration settings can be set directly inside the UI under the Advanced settings. Here, you can activate/deactivate variables, and add or delete them.

The file can also be edited manually in your local storage (default mounted volume path is `.data.prod/config`).
