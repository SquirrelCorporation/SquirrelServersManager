---
layout: FeatureGuideLayout
title: "Ansible Integration Architecture"
icon: "⚙️"
time: "10 min read"
signetColor: '#8e44ad' # Purple for Playbooks/Ansible
nextStep:
  icon: "➡️"
  title: "Ansible Inventory Management"
  description: "Learn how SSM manages Ansible inventories."
  link: "/docs/reference/ansible/inventory-management"
credits: true
---

:::tip In a Nutshell (🌰)
- SSM integrates Ansible using a Clean Architecture approach for maintainability.
- Core functions include dynamic inventory generation, secure credential handling, and playbook execution via `ansible-runner`.
- The system is designed for robust, secure, and auditable automation.
:::

## Architecture Overview

The Ansible module in Squirrel Servers Manager (SSM) is designed based on **Clean Architecture** principles. This architectural style emphasizes separation of concerns, making the module easier to understand, test, and maintain. The key layers are:

<ComponentInfoGrid>
  <ComponentInfoCard
    headerTitle="Domain Layer"
    purpose="Contains the core business logic and entities, independent of any framework or infrastructure. Defines interfaces for services and repositories."
    subText="Includes:"
    :storesItems="[
      'Task service interfaces',
      'Repository interfaces (for playbooks, credentials)',
      'Core domain models (e.g., Playbook, Task, InventoryDevice)'
    ]"
  />
  <ComponentInfoCard
    headerTitle="Application Layer"
    purpose="Implements the use cases of the application by orchestrating domain entities and interacting with infrastructure services through interfaces."
    subText="Includes:"
    :storesItems="[
      'Playbook execution services',
      'Inventory transformation logic',
      'Variable handling and templating',
      'Task logging and status tracking'
    ]"
  />
  <ComponentInfoCard
    headerTitle="Infrastructure Layer"
    purpose="Provides concrete implementations for external concerns like databases, file systems, and third-party services (e.g., Ansible runner itself)."
    subText="Includes:"
    :storesItems="[
      'Database repository implementations (e.g., MongoDB for tasks)',
      'Ansible runner adapters',
      'Secure credential storage interactions'
    ]"
  />
  <ComponentInfoCard
    headerTitle="Presentation Layer"
    purpose="Handles interactions with the outside world, typically through APIs (REST, WebSockets) for the user interface or other services."
    subText="Includes:"
    :storesItems="[
      'REST API controllers for playbook management',
      'WebSocket endpoints for real-time task updates',
      'Event handling for task status changes'
    ]"
  />
</ComponentInfoGrid>

## Core Ansible Integration Components

SSM's Ansible integration relies on several key services and processes:

### 1. Command Execution Flow

Executing an Ansible playbook through SSM involves a sequence of steps:

1.  **Request Initiation**: The client (SSM UI or API call) requests playbook execution, specifying the target devices, playbook to run, and any extra variables.
2.  **Inventory Creation**: The `InventoryTransformerService` dynamically builds an Ansible-compatible inventory. This involves fetching device details, including connection parameters (IP, port, username) and credentials from SSM's secure storage.
3.  **Command Building**: An `AnsibleCommandBuilderService` (or similar component) constructs the `ansible-runner` command. This includes setting the path to the playbook, the generated inventory, verbosity levels, and any necessary environment variables or `extra_vars`.
4.  **Execution**: The constructed command is executed, typically using the `ansible-runner` Python interface. SSM may use a custom script like `ssm-ansible-run.py` to manage this process and interface with `ansible-runner`.
5.  **Task Monitoring**: As the playbook runs, `ansible-runner` generates events. SSM captures these events to provide real-time status updates, logs, and task progress to the client via WebSockets.
6.  **Results Processing**: Upon completion (success, failure, or partial success), the final results, including logs and any artifacts, are processed, stored by SSM (e.g., in a `TaskService`), and made available to the user.

### 2. Inventory Management Overview

SSM dynamically generates Ansible inventories. Key aspects include:

- **Dynamic Generation**: Inventories are not static files but are created on-the-fly based on the devices targeted for a specific playbook run.
- **Credential Integration**: Securely injects necessary SSH credentials (passwords or paths to temporary private key files) and sudo passwords, often leveraging Ansible Vault for encryption.
- **Variable Injection**: Adds necessary `ansible_` connection variables (`ansible_host`, `ansible_user`, `ansible_port`, `ansible_ssh_private_key_file`, `ansible_become_method`, etc.) to the inventory for each host.

### 3. Secure Credential Handling Overview

Security is paramount when dealing with automation credentials. SSM employs several mechanisms:

- **Encryption at Rest**: Sensitive data like SSH passwords, private key passphrases, and sudo passwords are encrypted, often using Ansible Vault mechanisms integrated into SSM.
- **Vault Password Client**: A secure method (e.g., a script like `ssm-ansible-vault-password-client.py`) is used to provide the vault password to `ansible-runner` without exposing it directly in commands or logs.
- **Temporary Key Files**: When using SSH private keys, SSM typically writes them to temporary files with restricted permissions for the duration of the playbook execution and ensures they are cleaned up afterward.
- **Restricted Access**: The Ansible execution environment is carefully controlled to limit exposure of sensitive information.

### 4. Ansible Runner Integration

SSM utilizes `ansible-runner` to interface with Ansible. This provides a structured way to:

- Execute playbooks programmatically.
- Manage the environment for Ansible execution (e.g., environment variables, paths).
- Capture structured output and events from Ansible runs, which is crucial for real-time feedback in the SSM UI.

This integration allows SSM to abstract the complexities of direct Ansible CLI calls and provide a more robust and auditable automation engine. 