# Docker Connection

By default, SSM will try to connect through SSH to the Docker socket using the global device authentication set during the device addition process.

However, you may want to set up a specific SSH connection method for that:

## Using Different SSH Credentials for Connecting to the Docker Socket
- **Navigation**: `Inventory` / `<device>` / `Configuration` => "Containers" tab; `Docker` > `Show advanced` on;

![docker-advanced-con](/technical-guide/docker/docker-advanced-connection.png)

With this option, you can specify alternative SSH credentials.

## Docker SSH Advanced Connection Options

| Option           | Description                                                                                       |
|------------------|---------------------------------------------------------------------------------------------------|
| **Force IPV6**   | Forces the communication to use the IPv6 protocol. Ensures connections are made over IPv6.        |
| **Force IPV4**   | Forces the communication to use the IPv4 protocol. Ensures connections are made over IPv4.        |
| **Agent Forward**| Forwards connection via a specified agent. Useful for SSH agent forwarding.                       |
| **Try Keyboard** | Attempts to enable keyboard-interactive prompts for authentication or user-input-related processes.|

## TLS (HTTPS) Secured Docker Daemon Sockets
TLS protection for the Docker daemon secures client-daemon communication using mutual TLS authentication and encryption. It involves using SSL/TLS certificates for both ends to authenticate and encrypt data, preventing unauthorized access and ensuring data integrity. [Official documentation](https://docs.docker.com/engine/security/protect-access/#use-tls-https-to-protect-the-docker-daemon-socket)

It is supported in SSM in:
- **Navigation**: `Inventory` / `<device>` / `Configuration` => "Docker" tab; `Show advanced` on;

![docker-certs](/technical-guide/docker/docker-certs.png)
