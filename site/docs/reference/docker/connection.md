---
layout: FeatureGuideLayout
title: "Docker Connection Guide"
icon: "🐳"
time: 8 min read
signetColor: '#23233e' # Reference color
nextStep:
  icon: "🏷️"
  title: "Container Labelling Guide"
  description: "Learn about container labels and how they're used in SSM."
  link: "/docs/reference/containers/labelling"
credits: true
---

:::tip In a Nutshell (🌰)
- SSM connects to Docker daemons via SSH tunneling rather than exposing Docker's HTTP API
- Three authentication methods: password, key-based, or passwordless
- Credentials are securely stored using vault-based encryption
- Connection testing available before adding a device
- TLS certificate support for enhanced security
:::

## Connection Architecture

Squirrel Servers Manager (SSM) uses a secure, SSH-based approach to connect to remote Docker daemons. This architecture provides several advantages over exposing Docker's HTTP API directly:

<MentalModelDiagram 
  title="Docker Connection Architecture" 
  imagePath="/images/diagrams-docker-connection-architecture.svg" 
  altText="Docker Connection Architecture Diagram" 
  caption="Figure 1: SSH Tunnel Based Docker Connection in SSM" 
/>

The connection process works as follows:

1. **SSH Tunnel Establishment**: SSM connects to the remote server using standard SSH protocols and authentication configured for the device.
2. **Docker System Dial Command**: SSM executes the `docker system dial-stdio` command on the remote server via the established SSH connection.
3. **Stdio Forwarding**: The standard input/output (stdio) of the `docker system dial-stdio` command (which connects to the local Docker socket on the remote machine) is forwarded back through the SSH tunnel.
4. **Docker Client Communication**: The Docker client library (Dockerode) used by SSM communicates with the remote Docker daemon by sending commands and receiving responses through this forwarded stdio stream within the SSH tunnel.

This approach enhances security by:
- Avoiding the need to expose the Docker daemon's TCP socket externally.
- Leveraging existing, secure SSH infrastructure and authentication.
- Encrypting all Docker communication within the SSH tunnel.

## Authentication Methods

SSM uses the device's configured SSH authentication method (password, key-based, passwordless) to establish the initial tunnel. See the [Ansible Connection Guide](/docs/reference/ansible/connection-methods) for details on these methods.

Optionally, you can configure **separate SSH credentials specifically for the Docker connection** if needed (see [Docker Configuration](/docs/reference/docker-configuration) or the User Guide).

## Advanced Connection Options

Within the Docker-specific connection settings (Device Configuration > Containers > Docker > Show Advanced), you can adjust:

-   **Custom SSH Credentials**: Use different SSH user/password/key just for Docker.
-   **Force IPv4/IPv6**: Specify IP version for the SSH tunnel.
-   **Agent Forwarding**: Enable SSH agent forwarding for the tunnel.
-   **Keyboard Interactive**: Attempt keyboard-interactive auth (rarely needed).
-   **Custom Socket Path**: Point to a non-standard Docker socket path on the remote host.

## TLS Certificate Authentication

If the remote Docker daemon is configured to listen on a TCP socket secured with TLS (HTTPS), SSM supports connecting using client certificates:

1.  Configure TLS on your Docker daemon ([Docker Docs](https://docs.docker.com/engine/security/protect-access/#use-tls-https-to-protect-the-docker-daemon-socket)).
2.  Provide the **CA certificate**, **Client certificate**, and **Client key** in the device's Docker configuration section in SSM (Advanced settings).

SSM will then use these certificates to establish a secure HTTPS connection to the Docker daemon endpoint.

## Connection Testing

SSM provides API endpoints to test Docker connectivity:

-   **Pre-Connection Check (`POST /api/docker/pre-check`)**: Tests connection using provided (unsaved) credentials before adding a device.
-   **Existing Device Check (`GET /api/docker/check/:uuid`)**: Tests connection using the stored credentials for an existing device.

These checks attempt to establish the SSH tunnel and ping the Docker daemon, returning a success/failure status.

## Implementation Details

-   **`SSHCredentialsAdapter`**: Prepares the necessary connection options (SSH credentials, TLS certs) for the Docker client library.
-   **`SsmSshAgent`**: A custom SSH agent (extending `ssh2.HTTPAgent`) likely manages the `docker system dial-stdio` execution and stdio forwarding over the SSH tunnel for the Docker client library. 