<script setup>
import NextStepCard from '/components/NextStepCard.vue';
import PageHeader from '/components/PageHeader.vue';
</script>

<PageHeader 
  title="Troubleshooting Guide: [System/Feature Name]" 
  icon="🔧" 
  time="Reading time: 10 minutes" 
/>

:::tip 🌰 In a Nutshell
- Diagnose and fix common issues with [System/Feature]
- Check logs at [log location] for detailed error messages
- Run diagnostic commands to identify configuration problems
:::

## Common Issues

<!-- Table of Contents for Quick Navigation -->
<div class="toc-container">
  <div class="toc-header">Quick Navigation</div>
  <div class="toc-list">
    <ul>
      <li><a href="#connection-issues">Connection Issues</a></li>
      <li><a href="#authentication-issues">Authentication Issues</a></li>
      <li><a href="#performance-issues">Performance Issues</a></li>
      <li><a href="#configuration-issues">Configuration Issues</a></li>
      <li><a href="#update-issues">Update/Upgrade Issues</a></li>
    </ul>
  </div>
</div>

<style>
.toc-container {
  margin: 24px 0;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.toc-header {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
  font-weight: bold;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.toc-list {
  padding: 16px;
}

.toc-list ul {
  margin: 0;
  padding-left: 20px;
}

.toc-list li {
  margin-bottom: 8px;
}

.toc-list li:last-child {
  margin-bottom: 0;
}
</style>

## Diagnostic Tools

Before diving into specific issues, these diagnostic tools can help identify problems:

### Log Files

Check the following log files for error messages:
- **Server logs**: `[path-to-server-logs]`
- **Client logs**: `[path-to-client-logs]`
- **Database logs**: `[path-to-database-logs]`

::: code-group
```bash [Docker]
# View SSM server logs
docker logs -f ssm-server
```

```bash [Host System]
# View SSM server logs
tail -f /var/log/ssm/server.log
```
:::

### Diagnostic Commands

Run these commands to gather system information:

```bash
# Check SSM version
ssm --version

# Verify system dependencies
ssm doctor

# Test database connection
ssm check-db-connection
```

:::tip 💡 Diagnostic Mode
You can enable verbose logging by setting the environment variable:
```bash
export SSM_DEBUG=true
```
:::

## Connection Issues {#connection-issues}

<div class="issue-card">
  <div class="issue-title">Cannot Connect to SSH Server</div>
  
  <div class="issue-symptoms">
    <h4>Symptoms:</h4>
    <ul>
      <li>Error message: "Connection refused" or "Connection timed out"</li>
      <li>Device shows as offline in the dashboard</li>
      <li>Cannot execute commands on the remote device</li>
    </ul>
  </div>
  
  <div class="issue-solutions">
    <h4>Solutions:</h4>
    <ol>
      <li>
        <strong>Verify SSH service is running</strong>
        <pre><code>systemctl status sshd</code></pre>
        <p>If it's not running, start it with:</p>
        <pre><code>systemctl start sshd</code></pre>
      </li>
      <li>
        <strong>Check firewall settings</strong>
        <p>Ensure port 22 (or your custom SSH port) is open:</p>
        <pre><code>sudo ufw status</code></pre>
        <p>If needed, allow SSH traffic:</p>
        <pre><code>sudo ufw allow ssh</code></pre>
      </li>
      <li>
        <strong>Verify network connectivity</strong>
        <p>Test basic connectivity with ping:</p>
        <pre><code>ping [server-ip-address]</code></pre>
      </li>
    </ol>
  </div>
  
  <div class="issue-prevention">
    <h4>Prevention:</h4>
    <ul>
      <li>Configure SSH to start automatically on boot</li>
      <li>Use a persistent SSH connection with keepalive settings</li>
      <li>Set up monitoring to alert on SSH service failures</li>
    </ul>
  </div>
</div>

<div class="issue-card">
  <div class="issue-title">SSH Connection Slow or Unstable</div>
  
  <div class="issue-symptoms">
    <h4>Symptoms:</h4>
    <ul>
      <li>Long delays when connecting to devices</li>
      <li>Connections drop unexpectedly</li>
      <li>Timeout errors during operations</li>
    </ul>
  </div>
  
  <div class="issue-solutions">
    <h4>Solutions:</h4>
    <ol>
      <li>
        <strong>Optimize SSH client settings</strong>
        <p>Edit <code>/etc/ssh/ssh_config</code> or <code>~/.ssh/config</code>:</p>
        <pre><code>Host *
  ServerAliveInterval 60
  ServerAliveCountMax 3
  ControlMaster auto
  ControlPath ~/.ssh/sockets/%r@%h-%p
  ControlPersist 600</code></pre>
      </li>
      <li>
        <strong>Check network quality</strong>
        <p>Test network latency and packet loss:</p>
        <pre><code>mtr [server-ip-address]</code></pre>
      </li>
      <li>
        <strong>Adjust timeout settings in SSM configuration</strong>
        <p>Increase SSH connection timeout in <code>.env</code> file:</p>
        <pre><code>SSH_CONNECT_TIMEOUT=30000
SSH_OPERATION_TIMEOUT=60000</code></pre>
      </li>
    </ol>
  </div>
  
  <div class="issue-prevention">
    <h4>Prevention:</h4>
    <ul>
      <li>Use keepalive settings to maintain connections</li>
      <li>Implement connection pooling for multiple operations</li>
      <li>Consider using a more reliable network connection</li>
    </ul>
  </div>
</div>

<style>
.issue-card {
  margin: 24px 0;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.issue-title {
  background-color: #1890ff;
  color: white;
  padding: 12px 16px;
  font-weight: bold;
  font-size: 1.1em;
}

.issue-symptoms, .issue-solutions, .issue-prevention {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.issue-prevention {
  background-color: rgba(0, 0, 0, 0.02);
  border-bottom: none;
}

.issue-symptoms h4, .issue-solutions h4, .issue-prevention h4 {
  margin-top: 0;
  margin-bottom: 8px;
}

.issue-solutions ol {
  padding-left: 20px;
}

.issue-solutions li {
  margin-bottom: 16px;
}

.issue-solutions li:last-child {
  margin-bottom: 0;
}

.issue-solutions li strong {
  display: block;
  margin-bottom: 4px;
}

.issue-solutions pre {
  margin: 8px 0;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 8px 12px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>

## Authentication Issues {#authentication-issues}

<div class="issue-card">
  <div class="issue-title">SSH Key Authentication Failure</div>
  
  <div class="issue-symptoms">
    <h4>Symptoms:</h4>
    <ul>
      <li>Error message: "Permission denied (publickey)"</li>
      <li>SSM cannot connect despite correct SSH key configuration</li>
    </ul>
  </div>
  
  <div class="issue-solutions">
    <h4>Solutions:</h4>
    <ol>
      <li>
        <strong>Verify SSH key permissions</strong>
        <p>SSH keys need specific permissions to work:</p>
        <pre><code>chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
chmod 644 ~/.ssh/authorized_keys</code></pre>
      </li>
      <li>
        <strong>Check if the key is correctly added to authorized_keys</strong>
        <p>Ensure the public key is in the authorized_keys file:</p>
        <pre><code>cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys</code></pre>
      </li>
      <li>
        <strong>Verify SSH server configuration</strong>
        <p>Edit <code>/etc/ssh/sshd_config</code> to enable key authentication:</p>
        <pre><code>PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys</code></pre>
        <p>Then restart the SSH service:</p>
        <pre><code>systemctl restart sshd</code></pre>
      </li>
    </ol>
  </div>
  
  <div class="issue-prevention">
    <h4>Prevention:</h4>
    <ul>
      <li>Use SSM's built-in SSH key management features</li>
      <li>Regularly test SSH connections before adding devices</li>
      <li>Implement proper key rotation and backup procedures</li>
    </ul>
  </div>
</div>

<!-- Add more issue cards as needed -->

## Diagnostic Decision Tree

Not sure what's causing your issue? Use this decision tree to diagnose common problems:

<div class="decision-tree">
  <div class="decision-node">
    <div class="decision-question">Can SSM connect to the device?</div>
    <div class="decision-options">
      <div class="decision-option">
        <div class="decision-option-label">Yes</div>
        <div class="decision-option-arrow">→</div>
        <div class="decision-option-next">Can SSM authenticate?</div>
        <div class="decision-suboptions">
          <div class="decision-suboption">
            <div class="decision-suboption-label">Yes</div>
            <div class="decision-suboption-arrow">→</div>
            <div class="decision-suboption-next">Check permission issues</div>
          </div>
          <div class="decision-suboption">
            <div class="decision-suboption-label">No</div>
            <div class="decision-suboption-arrow">→</div>
            <div class="decision-suboption-next">See <a href="#authentication-issues">Authentication Issues</a></div>
          </div>
        </div>
      </div>
      <div class="decision-option">
        <div class="decision-option-label">No</div>
        <div class="decision-option-arrow">→</div>
        <div class="decision-option-next">See <a href="#connection-issues">Connection Issues</a></div>
      </div>
    </div>
  </div>
</div>

<style>
.decision-tree {
  margin: 24px 0;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.decision-node {
  margin-bottom: 16px;
}

.decision-question {
  font-weight: bold;
  margin-bottom: 8px;
}

.decision-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-left: 16px;
}

.decision-option {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
}

.decision-option-label {
  font-weight: bold;
  min-width: 40px;
}

.decision-option-arrow {
  margin: 0 8px;
}

.decision-option-next {
  font-weight: bold;
}

.decision-suboptions {
  width: 100%;
  padding-left: 64px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.decision-suboption {
  display: flex;
  align-items: center;
}

.decision-suboption-label {
  font-weight: bold;
  min-width: 40px;
}

.decision-suboption-arrow {
  margin: 0 8px;
}

.decision-suboption-next {
  font-weight: normal;
}
</style>

## Still Having Issues?

If you're still experiencing problems after trying the troubleshooting steps:

1. **Collect Detailed Logs**
   ```bash
   ssm collect-logs --output=ssm-logs.zip
   ```

2. **Enable Debug Mode**
   ```bash
   export SSM_DEBUG=true
   systemctl restart ssm-server
   ```

3. **Get Community Help**
   - [Join our Discord](https://discord.gg/ssm)
   - [Create a GitHub Issue](https://github.com/squirrelcorporation/ssm/issues)
   - [Check the FAQ](../reference/faq)

:::warning ⚠️ Advanced Troubleshooting
For persistent issues, you might need to check the database integrity or reinstall components. Always back up your data before attempting advanced troubleshooting steps.
:::

## Related Documentation

<div class="related-docs">
  <div class="related-doc-card">
    <h3>📋 System Requirements</h3>
    <p>Ensure your system meets all requirements.</p>
    <a href="../reference/system-requirements">View requirements →</a>
  </div>
  
  <div class="related-doc-card">
    <h3>🔧 Configuration Reference</h3>
    <p>Complete reference for all configuration options.</p>
    <a href="../reference/configuration">View configuration →</a>
  </div>
  
  <div class="related-doc-card">
    <h3>📝 Logs Reference</h3>
    <p>Understanding SSM log formats and messages.</p>
    <a href="../reference/logs">View logs reference →</a>
  </div>
</div>

<style>
.related-docs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.related-doc-card {
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.related-doc-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.related-doc-card h3 {
  margin-top: 0;
}

.related-doc-card a {
  display: inline-block;
  margin-top: 8px;
  font-weight: bold;
}
</style>
