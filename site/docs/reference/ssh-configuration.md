# SSH Configuration Reference

<div class="quick-start-header">
  <div class="quick-start-icon">🔐</div>
  <div class="quick-start-time">⏱️ Estimated time: 10 minutes</div>
</div>

:::tip 🌰 In a Nutshell
- SSH is the primary connection method for device management in SSM
- Three authentication methods are supported: password, SSH key, and password-less
- All credentials are securely encrypted in the database
- SSH connections enable terminal access, command execution, and container management
- Advanced options allow for custom port configuration and IPv4/IPv6 preferences
:::

## Overview

Secure Shell (SSH) is the foundation of SSM's agentless architecture, providing secure remote access to your devices. This reference guide covers all SSH configuration options and best practices for secure device management.

### SSH Connection Flow

<div class="ssh-flow-diagram">
  <div class="flow-step">
    <div class="flow-icon">🔑</div>
    <div class="flow-content">
      <h4>Authentication Preparation</h4>
      <p>SSM retrieves encrypted credentials and prepares connection parameters</p>
    </div>
  </div>
  <div class="flow-arrow">↓</div>
  
  <div class="flow-step">
    <div class="flow-icon">🔌</div>
    <div class="flow-content">
      <h4>Connection Establishment</h4>
      <p>SSH handshake is initiated with the target device</p>
    </div>
  </div>
  <div class="flow-arrow">↓</div>
  
  <div class="flow-step">
    <div class="flow-icon">🔒</div>
    <div class="flow-content">
      <h4>Authentication</h4>
      <p>Credentials are verified using the configured authentication method</p>
    </div>
  </div>
  <div class="flow-arrow">↓</div>
  
  <div class="flow-step">
    <div class="flow-icon">📡</div>
    <div class="flow-content">
      <h4>Secure Channel</h4>
      <p>Encrypted communication channel is established</p>
    </div>
  </div>
  <div class="flow-arrow">↓</div>
  
  <div class="flow-step">
    <div class="flow-icon">⚙️</div>
    <div class="flow-content">
      <h4>Command Execution</h4>
      <p>Commands are executed through the secure channel</p>
    </div>
  </div>
</div>

<div class="screenshot-container">
  <img src="/images/ssh-configuration-screen.png" alt="SSH Configuration Screen" class="screenshot" />
  <div class="screenshot-caption">Figure 1: SSH Configuration Interface in SSM</div>
</div>

## SSH Authentication Methods

SSM supports three authentication methods for SSH connections:

<div class="auth-decision-tree">
  <div class="decision-node">
    <div class="decision-question">Do you have SSH keys already set up?</div>
    <div class="decision-options">
      <div class="decision-option">
        <div class="option-label">Yes</div>
        <div class="option-arrow">↓</div>
        <div class="decision-node">
          <div class="decision-question">Is an SSH agent available?</div>
          <div class="decision-options">
            <div class="decision-option">
              <div class="option-label">Yes</div>
              <div class="option-arrow">↓</div>
              <div class="decision-result success">
                <div class="result-title">Use Password-less Authentication</div>
                <div class="result-description">Simplest option when SSH agent is configured</div>
              </div>
            </div>
            <div class="decision-option">
              <div class="option-label">No</div>
              <div class="option-arrow">↓</div>
              <div class="decision-result success">
                <div class="result-title">Use SSH Key Authentication</div>
                <div class="result-description">Most secure option for all environments</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="decision-option">
        <div class="option-label">No</div>
        <div class="option-arrow">↓</div>
        <div class="decision-node">
          <div class="decision-question">Is this a production environment?</div>
          <div class="decision-options">
            <div class="decision-option">
              <div class="option-label">Yes</div>
              <div class="option-arrow">↓</div>
              <div class="decision-result warning">
                <div class="result-title">Generate and Use SSH Keys</div>
                <div class="result-description">Recommended for production security</div>
              </div>
            </div>
            <div class="decision-option">
              <div class="option-label">No</div>
              <div class="option-arrow">↓</div>
              <div class="decision-result warning">
                <div class="result-title">Use Password Authentication</div>
                <div class="result-description">Quick setup for testing environments</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

### 1. Password Authentication

The simplest method, using a username and password combination.

```yaml
authentication:
  type: UserPassword
  username: admin
  password: ********
```

**Advantages**:
- Simple to set up
- No key management required

**Disadvantages**:
- Less secure than key-based authentication
- Subject to brute force attacks
- Password rotation can be challenging

### 2. SSH Key Authentication

The most secure method, using public/private key pairs.

```yaml
authentication:
  type: KeyBased
  username: admin
  privateKey: |
    -----BEGIN RSA PRIVATE KEY-----
    MIIEpAIBAAKCAQEA1D9c9...
    -----END RSA PRIVATE KEY-----
  passphrase: optional_passphrase
```

**Advantages**:
- Significantly more secure than passwords
- No password transmission over the network
- Can be used with SSH agents for convenience

**Disadvantages**:
- Requires key management
- More complex initial setup

### 3. Password-less Authentication

Uses existing SSH configurations like SSH agent or host-based authentication.

```yaml
authentication:
  type: PasswordLess
  username: admin
```

**Advantages**:
- Convenient for environments with existing SSH infrastructure
- No credentials stored in SSM

**Disadvantages**:
- Requires pre-configured SSH environment
- Limited to specific use cases

## Connection Settings

### Basic Connection Parameters

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `host` | IP address or hostname of the device | Required | `192.168.1.100` |
| `port` | SSH port number | `22` | `2222` |
| `username` | SSH username | Required | `admin` |

### Advanced Connection Options

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `forceIPv4` | Force connection over IPv4 | `false` | `true` |
| `forceIPv6` | Force connection over IPv6 | `false` | `true` |
| `tryKeyboard` | Enable keyboard-interactive authentication | `true` | `true` |

## Security Considerations

### Credential Storage

All SSH credentials in SSM are:

1. **Encrypted at rest** using a secure vault service
2. **Never logged** in plain text
3. **Never exposed** in API responses

### Best Practices

::: tip 💡 Recommended Security Practices
- Use SSH key authentication whenever possible
- Implement key rotation policies
- Use dedicated SSH users with limited permissions
- Enable SSH key passphrase for additional security
- Disable password authentication on your servers when using key-based auth
:::

### Common Security Issues

| Issue | Description | Solution |
|-------|-------------|----------|
| Authentication Failures | Incorrect credentials or permissions | Verify username, password/key, and file permissions |
| Connection Timeouts | Network issues or firewall blocking | Check network connectivity and firewall rules |
| Permission Denied | Insufficient privileges | Ensure the SSH user has appropriate permissions |
| Host Key Verification | Server's host key has changed | Update known_hosts file or verify server identity |

## SSH for Container Management

SSM uses SSH tunneling to securely manage Docker containers:

```yaml
docker:
  enabled: true
  socketPath: /var/run/docker.sock
  sshTunnel:
    enabled: true
    # Uses the same SSH configuration as the device
```

This approach:
1. Establishes an SSH connection to the device
2. Creates a secure tunnel to the Docker socket
3. Manages containers through this encrypted channel

::: warning ⚠️ Important
The SSH user must have permissions to access the Docker socket (typically by being in the 'docker' group)
:::

## Terminal Features

SSM's SSH implementation includes a full-featured terminal:

- **Real-time data streaming** for interactive sessions
- **Terminal resizing** to match your browser window
- **Session management** with automatic cleanup
- **Multi-client support** for collaborative sessions

## Platform-Specific Considerations

### Linux

<div class="platform-notes">
  <div class="platform-icon">🐧</div>
  <div class="platform-content">
    <h4>SSH Key Generation</h4>
    <div class="code-with-copy">
      <pre><code>ssh-keygen -t rsa -b 4096 -C "your_email@example.com"</code></pre>
      <button class="copy-button" onclick="navigator.clipboard.writeText('ssh-keygen -t rsa -b 4096 -C \"your_email@example.com\"')">Copy</button>
    </div>
    
    <h4>Key Permissions</h4>
    <p>Ensure proper permissions on SSH files:</p>
    <div class="code-with-copy">
      <pre><code>chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub</code></pre>
      <button class="copy-button" onclick="navigator.clipboard.writeText('chmod 700 ~/.ssh\nchmod 600 ~/.ssh/id_rsa\nchmod 644 ~/.ssh/id_rsa.pub')">Copy</button>
    </div>
    
    <h4>SSH Agent</h4>
    <div class="code-with-copy">
      <pre><code>eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa</code></pre>
      <button class="copy-button" onclick="navigator.clipboard.writeText('eval \"$(ssh-agent -s)\"\nssh-add ~/.ssh/id_rsa')">Copy</button>
    </div>
  </div>
</div>

### macOS

<div class="platform-notes">
  <div class="platform-icon">🍎</div>
  <div class="platform-content">
    <h4>SSH Key Generation</h4>
    <div class="code-with-copy">
      <pre><code>ssh-keygen -t rsa -b 4096 -C "your_email@example.com"</code></pre>
      <button class="copy-button" onclick="navigator.clipboard.writeText('ssh-keygen -t rsa -b 4096 -C \"your_email@example.com\"')">Copy</button>
    </div>
    
    <h4>SSH Agent (Automatic)</h4>
    <p>macOS Sierra 10.12.2 or later automatically loads keys into SSH agent.</p>
    
    <h4>SSH Agent (Manual)</h4>
    <div class="code-with-copy">
      <pre><code>ssh-add -K ~/.ssh/id_rsa</code></pre>
      <button class="copy-button" onclick="navigator.clipboard.writeText('ssh-add -K ~/.ssh/id_rsa')">Copy</button>
    </div>
    
    <h4>Keychain Integration</h4>
    <p>Add to ~/.ssh/config to use Keychain:</p>
    <div class="code-with-copy">
      <pre><code>Host *
  UseKeychain yes
  AddKeysToAgent yes
  IdentityFile ~/.ssh/id_rsa</code></pre>
      <button class="copy-button" onclick="navigator.clipboard.writeText('Host *\n  UseKeychain yes\n  AddKeysToAgent yes\n  IdentityFile ~/.ssh/id_rsa')">Copy</button>
    </div>
  </div>
</div>

### Windows

<div class="platform-notes">
  <div class="platform-icon">🪟</div>
  <div class="platform-content">
    <h4>SSH Key Generation (PowerShell)</h4>
    <div class="code-with-copy">
      <pre><code>ssh-keygen -t rsa -b 4096 -C "your_email@example.com"</code></pre>
      <button class="copy-button" onclick="navigator.clipboard.writeText('ssh-keygen -t rsa -b 4096 -C \"your_email@example.com\"')">Copy</button>
    </div>
    
    <h4>SSH Agent Service</h4>
    <p>Enable and start the SSH Agent service:</p>
    <div class="code-with-copy">
      <pre><code># In PowerShell as Administrator
Set-Service -Name ssh-agent -StartupType Automatic
Start-Service ssh-agent</code></pre>
      <button class="copy-button" onclick="navigator.clipboard.writeText('# In PowerShell as Administrator\nSet-Service -Name ssh-agent -StartupType Automatic\nStart-Service ssh-agent')">Copy</button>
    </div>
    
    <h4>Add Key to Agent</h4>
    <div class="code-with-copy">
      <pre><code>ssh-add $env:USERPROFILE\.ssh\id_rsa</code></pre>
      <button class="copy-button" onclick="navigator.clipboard.writeText('ssh-add $env:USERPROFILE\\.ssh\\id_rsa')">Copy</button>
    </div>
    
    <h4>Alternative Tools</h4>
    <p>Consider using PuTTY/PuTTYgen or Windows Subsystem for Linux (WSL) for more options.</p>
  </div>
</div>

## Troubleshooting

### Authentication Issues

**Symptom**: "Authentication failed" error message

**Solution**:
1. Verify username and password/key are correct
2. Check if the user exists on the target system
3. Ensure the user has login permissions
4. Check SSH server configuration for allowed authentication methods

**Common Causes**:
- Incorrect username or password
- SSH key not properly added to authorized_keys on the server
- SSH server configured to disallow the authentication method you're using
- Account is locked or expired

### Connection Issues

**Symptom**: "Connection timeout" or "Connection refused"

**Solution**:
1. Verify the device is online and reachable (ping test)
2. Check if SSH service is running on the device
3. Verify firewall rules allow SSH connections
4. Confirm the correct port is configured

**Common Causes**:
- SSH service not running on the target device
- Firewall blocking the SSH port
- Network connectivity issues
- Incorrect IP address or hostname
- SSH server configured to use a non-standard port

### Permission Issues

**Symptom**: "Permission denied" when executing commands

**Solution**:
1. Verify the SSH user has appropriate permissions
2. Check if sudo is required and configured correctly
3. Ensure file permissions are set correctly for accessed resources

**Common Causes**:
- SSH user doesn't have permission to access the requested resource
- SSH user not in the required group (e.g., docker group for Docker access)
- Sudo not configured for passwordless operation
- File permissions too restrictive

### Host Key Verification Issues

**Symptom**: "Host key verification failed" or "WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!"

**Solution**:
1. If you trust the host, remove the old key from known_hosts:
   ```bash
   ssh-keygen -R hostname_or_ip
   ```
2. Reconnect and verify the new host key

**Common Causes**:
- Server has been reinstalled or reconfigured
- DNS points to a different server than before
- Man-in-the-middle attack attempt (be cautious!)

### SSH Agent Issues

**Symptom**: "Could not open a connection to your authentication agent"

**Solution**:
1. Start the SSH agent:
   ```bash
   eval "$(ssh-agent -s)"
   ```
2. Add your key to the agent:
   ```bash
   ssh-add ~/.ssh/id_rsa
   ```

**Common Causes**:
- SSH agent not running
- SSH agent socket not accessible
- Environment variables not set correctly

## Related Documentation

- [Device Management](/docs/user-guides/devices/management) - Managing devices in SSM
- [Docker Configuration](/docs/reference/docker-configuration) - Configuring Docker access
- [Security Best Practices](/docs/advanced-guides/security) - Overall security recommendations
- [Ansible Integration](/docs/reference/technical-guide/ansible) - How SSM uses Ansible with SSH

<div class="next-steps">
  <a href="/docs/reference/docker-configuration" class="next-step-card">
    <div class="next-step-card-title">Docker Configuration</div>
    <div class="next-step-card-description">Learn how to configure Docker access for your devices</div>
  </a>
</div>

<style>
.quick-start-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  background-color: var(--vp-c-bg-soft);
  padding: 1rem;
  border-radius: 8px;
}

.quick-start-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.quick-start-time {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.screenshot-container {
  margin: 1.5rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.screenshot {
  width: 100%;
  display: block;
}

.screenshot-caption {
  background-color: var(--vp-c-bg-soft);
  padding: 0.75rem;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  border-top: 1px solid var(--vp-c-divider);
}

.next-steps {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.next-step-card {
  display: block;
  padding: 1.5rem;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--vp-c-divider);
}

.next-step-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.next-step-card-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--vp-c-brand);
}

.next-step-card-description {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

/* SSH Flow Diagram Styles */
.ssh-flow-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin: 1.5rem 0;
}

.flow-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: var(--vp-c-bg-soft);
  padding: 1rem;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
}

.flow-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.flow-content {
  flex: 1;
}

.flow-content h4 {
  margin-top: 0;
  margin-bottom: 0.25rem;
}

.flow-content p {
  margin: 0;
  font-size: 0.9rem;
}

.flow-arrow {
  font-size: 1.5rem;
  color: var(--vp-c-brand);
}

/* Authentication Decision Tree Styles */
.auth-decision-tree {
  margin: 1.5rem 0;
}

.decision-node {
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.decision-question {
  font-weight: bold;
  margin-bottom: 0.75rem;
  text-align: center;
}

.decision-options {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}

.decision-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.option-label {
  background-color: var(--vp-c-brand);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.option-arrow {
  font-size: 1.25rem;
  margin: 0.25rem 0;
  color: var(--vp-c-brand);
}

.decision-result {
  background-color: var(--vp-c-bg);
  border-radius: 8px;
  padding: 0.75rem;
  width: 100%;
  text-align: center;
}

.decision-result.success {
  border-left: 4px solid #4caf50;
}

.decision-result.warning {
  border-left: 4px solid #ff9800;
}

.result-title {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.result-description {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

/* Platform-Specific Notes Styles */
.platform-notes {
  display: flex;
  gap: 1rem;
  background-color: var(--vp-c-bg-soft);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.platform-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.platform-content {
  flex: 1;
}

.platform-content h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.code-with-copy {
  position: relative;
  margin: 0.5rem 0 1rem 0;
}

.code-with-copy pre {
  margin: 0;
  padding: 1rem;
  background-color: var(--vp-c-bg);
  border-radius: 4px;
  overflow-x: auto;
}

.copy-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.copy-button:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .decision-options {
    flex-direction: column;
  }
  
  .platform-notes {
    flex-direction: column;
    align-items: center;
  }
  
  .platform-content {
    width: 100%;
  }
}
</style>
