---
layout: FeatureGuideLayout
title: "SSH Integration Internals"
icon: "🔒"
time: "10 min read"
signetColor: '#23233e' # Reference color
nextStep:
  icon: "➡️"
  title: "SSH Configuration Reference"
  description: "View detailed SSH configuration options."
  link: "/docs/reference/ssh-configuration"
credits: true
---

This document provides a technical overview of how Squirrel Servers Manager (SSM) implements and manages SSH connections to remote devices.

:::tip In a Nutshell (🌰)
- SSM uses a layered architecture (Domain, Application, Infrastructure, Presentation) for SSH connectivity.
- Connections are established, authenticated, and managed via dedicated services.
- Credentials use Vault encryption; terminal sessions use WebSockets for real-time data.
- Error handling and resource cleanup are built-in.
:::



## Technical Implementation Architecture

SSM's SSH module follows Clean Architecture principles, separating concerns for clarity and maintainability:

1.  **Domain Layer**: Defines core entities and interfaces.
    *   `SshSession`: Represents an active terminal session.
    *   `SshConnectionOptions`: Holds SSH connection parameters.
    *   Service interfaces defining contracts for SSH operations.

2.  **Application Layer**: Implements business logic.
    *   `SshTerminalService`: Manages terminal session lifecycle, data flow, and client interactions.

3.  **Infrastructure Layer**: Handles external interactions.
    *   `SshConnectionService`: Establishes and manages the underlying SSH connections using libraries like `ssh2`.
    *   `SSHCredentialsAdapter`: Retrieves and decrypts device credentials using the Vault service.

4.  **Presentation Layer**: Interfaces with the outside world.
    *   `SshGateway`: Manages WebSocket connections for real-time terminal communication between the frontend and the `SshTerminalService`.

## SSH Connection Flow

Establishing an SSH terminal session typically follows these steps:

1.  **Authentication Preparation**: The client requests a session (via WebSocket). SSM retrieves device settings and decrypts necessary credentials (password or private key/passphrase) via the Vault service.
2.  **Connection Establishment**: The `SshConnectionService` initiates the SSH handshake with the target device.
3.  **Authentication**: Credentials are sent and verified by the target device.
4.  **Shell/Terminal Creation**: Upon successful authentication, a pseudo-terminal (PTY) is requested and allocated on the remote device.
5.  **Session Tracking**: The `SshTerminalService` creates and tracks the session state (associated client, terminal dimensions, etc.).
6.  **Data Streaming**: Input from the client WebSocket is piped to the remote PTY's input stream. Output from the remote PTY is captured and streamed back to the client via the WebSocket.
7.  **Session Management**: Handles events like terminal resizing and connection termination, ensuring resources (connections, temporary files) are cleaned up properly.

## Implementation Details

Key aspects of the implementation include:

-   **Multiple Authentication Methods**: Supports password, key-based (with optional passphrase handled via Vault), and passwordless (agent/host-based) methods, configured per device. The `SSHCredentialsAdapter` selects and prepares the correct credentials.
-   **Secure Credential Storage**: Leverages Ansible Vault (AES-256) for encrypting all sensitive credentials stored in the database. See [Ansible Security and Credential Handling](/docs/reference/ansible/security) for more details.
-   **WebSocket Communication**: Uses the `SshGateway` for efficient, real-time, bidirectional communication for interactive terminal sessions.
-   **Error Handling**: Includes mechanisms to detect and report connection, authentication, and session errors, along with resource cleanup routines. 