---
layout: FeatureGuideLayout
title: "Ansible Task Monitoring, APIs, and Authentication"
icon: "📡"
time: "8 min read"
signetColor: '#23233e' # Reference color
nextStep:
  icon: "➡️"
  title: "Ansible Integration Architecture"
  description: "Understand the overall Ansible integration."
  link: "/docs/concepts/technologies/ansible-integration"
credits: true
---

This document covers how Squirrel Servers Manager (SSM) monitors Ansible tasks, exposes related APIs, and handles different authentication methods.

:::tip In a Nutshell (🌰)
- SSM provides real-time task monitoring.
- Logs and artifacts are stored in the database and filesystem.
- REST APIs are available for managing tasks, Galaxy collections, and hooks.
- Supports password, key-based, and passwordless SSH authentication for Ansible.
:::


## Task Monitoring and Logging

SSM provides robust monitoring and logging for Ansible playbook executions:

- **Real-time Updates**: Services like `TaskLogsService` process events from `ansible-runner` and stream updates (status, logs).
- **Status Tracking**: The `AnsibleTaskRepository` manages task metadata, including status (running, completed, failed) and historical records.
- **Log Storage**: Logs are stored in two main ways:
    1.  **Database**: Structured logs and key events are stored in MongoDB for querying and display in the UI.
    2.  **Filesystem Artifacts**: Detailed raw output and artifacts from `ansible-runner` are typically stored in directories like `/server/src/ansible/artifacts/<task-id>/` on the SSM server filesystem for in-depth troubleshooting.

## API Endpoints

SSM exposes several REST API endpoints related to Ansible functionality. These are used by the frontend and can potentially be used for external integrations.

*(Note: Base path `/api/` precedes these routes)*

### Task Management API

-   `GET /ansible/tasks/:taskId/logs`: Retrieve logs for a specific Ansible task.
-   `GET /ansible/tasks/:taskId/status`: Get the current status of a specific task.
-   `POST /ansible/tasks/:taskId/cancel`: Attempt to cancel a running Ansible task.

### Galaxy Management API

-   `GET /ansible/galaxy/collections`: List Ansible Galaxy collections installed within the SSM environment.
-   `POST /ansible/galaxy/collections/install`: Install a new collection from Ansible Galaxy.
-   `DELETE /ansible/galaxy/collections/:name`: Remove an installed Galaxy collection.

### Hooks Management API

-   `GET /ansible/hooks`: List available custom Ansible hooks within SSM.
-   `POST /ansible/hooks/:hookName`: Execute a specific named hook.

## Authentication Methods Reference

SSM supports standard Ansible SSH authentication methods, configured per device:

1.  **Password-based Authentication**
    -   Uses the SSH username and password defined for the device.
    -   The password is encrypted using Ansible Vault.
    -   Relevant inventory variable (managed internally): `ansible_ssh_pass: { __ansible_vault: "..." }`

2.  **Key-based Authentication**
    -   Uses the SSH private key associated with the device in SSM.
    -   SSM handles placing the key in a temporary, secure file for Ansible to use.
    -   Relevant inventory variable (managed internally): `ansible_ssh_private_key_file: "/path/to/temporary/keyfile"`
    -   If the key is passphrase-protected, the passphrase is also handled via Ansible Vault.

3.  **Passwordless Authentication (Agent/Host-based)**
    -   Relies on existing SSH agent forwarding or pre-configured host-based authentication.
    -   SSM configures Ansible to use the standard `ssh` connection plugin instead of `paramiko`.
    -   Relevant inventory variable (managed internally): `ansible_connection: "ssh"`

SSM selects the appropriate method and injects the correct variables into the dynamic inventory based on the device's configuration. 