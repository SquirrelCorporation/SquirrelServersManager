# SSH / Connection to Your Devices

SSM uses SSH to connect to your devices. More precisely: a) it is used by Ansible to apply playbooks b) directly by the server to open a terminal c) and by the underlying Docker library to retrieve anything Docker-related.

Every password, key, and passphrase is encrypted using Ansible Vault (AES 256) and stored in the database.
## SSH Credentials
SSM supports both Username/Password and User/SSH Key (PKI) methods.

![connection-method](/technical-guide/ssh/ssh-password.png)

![connection-method](/technical-guide/ssh/ssh-key.png)

:::warning SSH Key Passphrase
Please note that setting an SSH Key passphrase is only supported with the 'paramiko' connection method.
:::

### Limitations
- Keyboard interactive authentication is not supported.
- PAM modules are not supported (as far as I know).
- Windows is not supported (yet)

## Supported SSH Ciphers
Listed in order from most to least preferable:
- `chacha20-poly1305@openssh.com` (priority of chacha20-poly1305 may vary depending on CPU and/or optional binding availability)
- `aes128-gcm`
- `aes128-gcm@openssh.com`
- `aes256-gcm`
- `aes256-gcm@openssh.com`
- `aes128-ctr`
- `aes192-ctr`
- `aes256-ctr`

## Advanced
:::info
Access the advanced connection options with the `Show advanced` switch at the bottom right.
:::

- **Strict Host Checking switch:**
  - Strict Host Checking in SSH is a security feature that ensures the authenticity of the remote host you are connecting to. It involves verifying the host's public key against a known set of keys to prevent man-in-the-middle attacks.
  - `This option is not yet fully implemented.`

- **Connection method:**
  - See [Ansible connection](/doc/technical-guide/ansible-connection)
